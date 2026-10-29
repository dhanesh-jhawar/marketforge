/**
 * MATCHING ENGINE — simulated execution against market quotes.
 * Pure functions: given an order and a quote, decide whether/at what price it fills.
 * No partial fills in v1 (whole quantity fills), but the contract supports them.
 */
import { ORDER_TYPE, ORDER_SIDE, ORDER_STATUS } from '@marketforge/shared/constants';

const r2 = (n) => Math.round(n * 100) / 100;
/** Round to NSE tick size (₹0.05). */
export const toTick = (p, tick = 0.05) => r2(Math.round(p / tick) * tick);

/**
 * @param {import('@marketforge/shared/types').Order} order
 * @param {import('@marketforge/shared/types').Quote} quote
 * @param {{slippageBps?:number}} [opts]
 * @returns {{fill:boolean, price?:number, quantity?:number, triggered?:boolean, reason?:string}}
 */
export function evaluateOrder(order, quote, { slippageBps = 5 } = {}) {
  const ltp = quote.ltp;
  const isBuy = order.side === ORDER_SIDE.BUY;
  const slip = slippageBps / 10000;
  const marketPrice = () => toTick(isBuy ? (quote.ask ?? ltp) * (1 + slip) : (quote.bid ?? ltp) * (1 - slip));
  const remaining = order.quantity - (order.filledQuantity ?? 0);

  switch (order.orderType) {
    case ORDER_TYPE.MARKET:
      return { fill: true, price: marketPrice(), quantity: remaining };

    case ORDER_TYPE.LIMIT: {
      const lp = order.limitPrice;
      if (isBuy && ltp <= lp) return { fill: true, price: toTick(Math.min(ltp, lp)), quantity: remaining };
      if (!isBuy && ltp >= lp) return { fill: true, price: toTick(Math.max(ltp, lp)), quantity: remaining };
      return { fill: false, reason: 'limit_not_reached' };
    }

    case ORDER_TYPE.STOP_LOSS:
    case ORDER_TYPE.STOP_LOSS_MARKET: {
      const tp = order.triggerPrice;
      const triggered = isBuy ? ltp >= tp : ltp <= tp;
      if (!triggered) return { fill: false, reason: 'trigger_not_hit' };
      if (order.orderType === ORDER_TYPE.STOP_LOSS_MARKET) return { fill: true, triggered, price: marketPrice(), quantity: remaining };
      const lp = order.limitPrice;
      if (isBuy && ltp <= lp) return { fill: true, triggered, price: toTick(Math.min(ltp, lp)), quantity: remaining };
      if (!isBuy && ltp >= lp) return { fill: true, triggered, price: toTick(Math.max(ltp, lp)), quantity: remaining };
      return { fill: false, triggered, reason: 'triggered_limit_not_reached' };
    }
    default:
      return { fill: false, reason: 'unknown_order_type' };
  }
}

/** Price used for fund blocking / risk at review time. */
export function referencePrice(order, quote) {
  if (order.orderType === ORDER_TYPE.LIMIT || order.orderType === ORDER_TYPE.STOP_LOSS) return order.limitPrice;
  if (order.orderType === ORDER_TYPE.STOP_LOSS_MARKET) return Math.max(order.triggerPrice, quote.ltp);
  return quote.ltp;
}

/** Status after applying a fill. */
export function statusAfterFill(order, fillQty) {
  const filled = (order.filledQuantity ?? 0) + fillQty;
  return filled >= order.quantity ? ORDER_STATUS.FILLED : ORDER_STATUS.PARTIALLY_FILLED;
}

/** Order-book of resting orders per symbol, used by the order service on ticks. */
export class OrderBook {
  constructor() { this.bySymbol = new Map(); }
  add(order) {
    if (!this.bySymbol.has(order.symbol)) this.bySymbol.set(order.symbol, new Map());
    this.bySymbol.get(order.symbol).set(order.id, order);
  }
  remove(order) { this.bySymbol.get(order.symbol)?.delete(order.id); }
  forSymbol(symbol) { return [...(this.bySymbol.get(symbol)?.values() ?? [])]; }
  symbols() { return [...this.bySymbol.keys()].filter((s) => this.bySymbol.get(s).size > 0); }
}
