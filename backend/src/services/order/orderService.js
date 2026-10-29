import { repos } from '../../repositories/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { riskService } from '../risk/riskService.js';
import { marketService } from '../market/marketService.js';
import { evaluateOrder, referencePrice, statusAfterFill } from '../../engines/matchingEngine/index.js';
import { applyTrade } from '../../engines/portfolioEngine/index.js';
import { ORDER_STATUS, ORDER_EVENT_TYPE, ORDER_SIDE, TRANSACTION_TYPE, WS_EVENTS } from '@marketforge/shared/constants';
import { eventBus } from '../../websocket/eventBus.js';
import { nowIso, uuid, round } from '../../utils/index.js';
import { config } from '../../config/index.js';

import { getCompanyProfile, calculateOrderScenarios } from '../market/companyIntelligence.js';

export const orderService = {
  /** Review step: runs deterministic risk engine and returns assessment before placement */
  async reviewOrder(userId, orderReq) {
    const riskSnapshot = await riskService.assessOrder(userId, orderReq);
    const quote = await marketService.getQuote(orderReq.symbol).catch(() => ({ ltp: 1000 }));
    const companyProfile = getCompanyProfile(orderReq.symbol, quote?.ltp);
    const scenarioAnalysis = calculateOrderScenarios({
      symbol: orderReq.symbol,
      side: orderReq.side,
      quantity: orderReq.quantity,
      orderType: orderReq.orderType,
      limitPrice: orderReq.limitPrice,
      currentPrice: quote?.ltp,
    });
    return {
      order: orderReq,
      riskSnapshot,
      companyProfile,
      scenarioAnalysis,
    };
  },

  /** Create order in PENDING_CONFIRMATION / OPEN state */
  async createOrder(userId, orderReq) {
    const riskSnapshot = await riskService.assessOrder(userId, orderReq);
    if (!riskSnapshot.canPlace) {
      const blocking = riskSnapshot.violations.filter((v) => v.severity === 'BLOCKING');
      throw ApiError.unprocessable(
        'RISK_RULE_VIOLATION',
        blocking.map((b) => b.message).join(' | '),
        { violations: riskSnapshot.violations }
      );
    }

    const symbol = String(orderReq.symbol).toUpperCase();
    const quote = await marketService.getQuote(symbol);
    const estPrice = referencePrice(orderReq, quote);
    const isBuy = orderReq.side === ORDER_SIDE.BUY;
    const blockedAmount = isBuy ? round(orderReq.quantity * estPrice + riskSnapshot.estimatedCharges) : 0;

    // Block funds if BUY
    if (isBuy && blockedAmount > 0) {
      const funds = await repos.funds.findById(userId);
      await repos.funds.update(userId, {
        availableCash: round(funds.availableCash - blockedAmount),
        blockedMargin: round((funds.blockedMargin || 0) + blockedAmount),
      });
      await repos.transactions.insert({
        userId,
        type: TRANSACTION_TYPE.BLOCK,
        amount: -blockedAmount,
        balanceAfter: round(funds.availableCash - blockedAmount),
        referenceType: 'order',
        note: `Margin blocked for BUY order on ${symbol}`,
      });
    }

    const orderId = uuid();
    const order = await repos.orders.insert({
      id: orderId,
      userId,
      symbol,
      side: orderReq.side,
      orderType: orderReq.orderType,
      product: orderReq.product,
      validity: orderReq.validity || 'DAY',
      quantity: orderReq.quantity,
      filledQuantity: 0,
      limitPrice: orderReq.limitPrice || null,
      triggerPrice: orderReq.triggerPrice || null,
      avgFillPrice: null,
      status: ORDER_STATUS.OPEN,
      blockedAmount,
      riskSnapshot,
    });

    await repos.orderEvents.insert({
      orderId,
      eventType: ORDER_EVENT_TYPE.CREATED,
      payload: { orderReq, blockedAmount },
    });

    eventBus.publish(WS_EVENTS.ORDER_UPDATE, order, { channel: `user:${userId}` });

    // Attempt instant match (e.g. MARKET order or immediate LIMIT match)
    await this.tryExecuteOrder(order, quote);

    return repos.orders.findById(orderId);
  },

  async tryExecuteOrder(order, quote) {
    if (order.status !== ORDER_STATUS.OPEN && order.status !== ORDER_STATUS.PARTIALLY_FILLED) {
      return;
    }

    const currentQuote = quote || await marketService.getQuote(order.symbol);
    const match = evaluateOrder(order, currentQuote, { slippageBps: config.trading.slippageBps });

    if (!match.fill) return;

    const fillPrice = match.price;
    const fillQty = match.quantity;
    const tradeValue = round(fillQty * fillPrice);
    const charges = round(config.trading.brokerageFlat + tradeValue * 0.0012);

    // Record trade
    const tradeId = uuid();
    const trade = await repos.trades.insert({
      id: tradeId,
      orderId: order.id,
      userId: order.userId,
      symbol: order.symbol,
      side: order.side,
      product: order.product,
      quantity: fillQty,
      price: fillPrice,
      charges,
      executedAt: nowIso(),
    });

    // Update order status
    const newStatus = statusAfterFill(order, fillQty);
    const newFilledQty = (order.filledQuantity || 0) + fillQty;
    const newAvgPrice = order.avgFillPrice
      ? round((order.avgFillPrice * order.filledQuantity + fillPrice * fillQty) / newFilledQty)
      : fillPrice;

    await repos.orders.update(order.id, {
      filledQuantity: newFilledQty,
      avgFillPrice: newAvgPrice,
      status: newStatus,
    });

    await repos.orderEvents.insert({
      orderId: order.id,
      eventType: newStatus === ORDER_STATUS.FILLED ? ORDER_EVENT_TYPE.FILLED : ORDER_EVENT_TYPE.PARTIAL_FILL,
      payload: { tradeId, fillPrice, fillQty, charges },
    });

    // Update funds & portfolio
    const portfolio = await repos.portfolios.findOne({ userId: order.userId });
    const funds = await repos.funds.findById(order.userId);

    if (order.side === ORDER_SIDE.BUY) {
      // Release blocked margin and deduct real cost + charges
      const blocked = order.blockedAmount || 0;
      const actualDeduction = round(tradeValue + charges);
      const remainingBlock = round(blocked - actualDeduction);

      await repos.funds.update(order.userId, {
        blockedMargin: Math.max(0, round((funds.blockedMargin || 0) - blocked)),
        availableCash: round(funds.availableCash + (remainingBlock > 0 ? remainingBlock : 0)),
      });

      // Update holding
      const existingHolding = await repos.holdings.findOne({ portfolioId: portfolio.id, symbol: order.symbol });
      const { holding } = applyTrade(existingHolding, trade);
      await repos.holdings.upsert({
        portfolioId: portfolio.id,
        symbol: order.symbol,
        quantity: holding.quantity,
        avgPrice: holding.avgPrice,
      });
    } else {
      // SELL: Credit cash, deduct holding, record realized PnL
      const existingHolding = await repos.holdings.findOne({ portfolioId: portfolio.id, symbol: order.symbol });
      const { holding, realizedPnl } = applyTrade(existingHolding, trade);

      if (holding && holding.quantity > 0) {
        await repos.holdings.update({ portfolioId: portfolio.id, symbol: order.symbol }, holding);
      } else {
        await repos.holdings.delete({ portfolioId: portfolio.id, symbol: order.symbol });
      }

      const netCredit = round(tradeValue - charges);
      await repos.funds.update(order.userId, {
        availableCash: round(funds.availableCash + netCredit),
        realizedPnl: round((funds.realizedPnl || 0) + realizedPnl),
      });

      await repos.transactions.insert({
        userId: order.userId,
        type: TRANSACTION_TYPE.SELL,
        amount: netCredit,
        balanceAfter: round(funds.availableCash + netCredit),
        referenceType: 'trade',
        referenceId: trade.id,
        note: `Proceeds from SELL ${fillQty} ${order.symbol} @ ₹${fillPrice}`,
      });
    }

    eventBus.publish(WS_EVENTS.TRADE_EXECUTED, trade, { channel: `user:${order.userId}` });
    eventBus.publish(WS_EVENTS.ORDER_UPDATE, await repos.orders.findById(order.id), { channel: `user:${order.userId}` });
    eventBus.publish(WS_EVENTS.PORTFOLIO_UPDATE, { userId: order.userId }, { channel: `user:${order.userId}` });
  },

  async cancelOrder(userId, orderId) {
    const order = await repos.orders.findById(orderId);
    if (!order || order.userId !== userId) throw ApiError.notFound('Order not found');
    if (order.status !== ORDER_STATUS.OPEN && order.status !== ORDER_STATUS.PARTIALLY_FILLED) {
      throw ApiError.badRequest(`Cannot cancel order in ${order.status} status`);
    }

    // Release any remaining blocked margin
    if (order.side === ORDER_SIDE.BUY && order.blockedAmount > 0) {
      const funds = await repos.funds.findById(userId);
      await repos.funds.update(userId, {
        availableCash: round(funds.availableCash + order.blockedAmount),
        blockedMargin: Math.max(0, round((funds.blockedMargin || 0) - order.blockedAmount)),
      });
      await repos.transactions.insert({
        userId,
        type: TRANSACTION_TYPE.RELEASE,
        amount: order.blockedAmount,
        balanceAfter: round(funds.availableCash + order.blockedAmount),
        referenceType: 'order',
        referenceId: order.id,
        note: `Margin released upon cancellation of order ${order.id}`,
      });
    }

    await repos.orders.update(orderId, { status: ORDER_STATUS.CANCELLED });
    await repos.orderEvents.insert({ orderId, eventType: ORDER_EVENT_TYPE.CANCELLED });

    const updated = await repos.orders.findById(orderId);
    eventBus.publish(WS_EVENTS.ORDER_UPDATE, updated, { channel: `user:${userId}` });
    return updated;
  },

  async getUserOrders(userId, { status, limit = 50 } = {}) {
    const where = { userId };
    if (status) where.status = status;
    return repos.orders.findMany(where, { limit, orderBy: 'createdAt', desc: true });
  },

  async getOrderById(userId, orderId) {
    const order = await repos.orders.findById(orderId);
    if (!order || order.userId !== userId) throw ApiError.notFound('Order not found');
    return order;
  },

  async matchPendingOrders() {
    const openOrders = await repos.orders.findMany({ status: ORDER_STATUS.OPEN });
    const partialOrders = await repos.orders.findMany({ status: ORDER_STATUS.PARTIALLY_FILLED });
    const pending = [...openOrders, ...partialOrders];
    if (!pending.length) return 0;

    // Price-Time Priority (FIFO within price level)
    const sorted = pending.sort((a, b) => {
      if (a.side === ORDER_SIDE.BUY) {
        const pa = a.limitPrice || 9999999;
        const pb = b.limitPrice || 9999999;
        if (pb !== pa) return pb - pa;
      } else {
        const pa = a.limitPrice || 0;
        const pb = b.limitPrice || 0;
        if (pa !== pb) return pa - pb;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    let count = 0;
    for (const ord of sorted) {
      try {
        const quote = await marketService.getQuote(ord.symbol);
        const match = evaluateOrder(ord, quote, { slippageBps: config.trading.slippageBps, allowPartial: true });
        if (match.fill) {
          await this.tryExecuteOrder(ord, quote);
          count++;
        }
      } catch {
        // continue
      }
    }
    return count;
  },
};
