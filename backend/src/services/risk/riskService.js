import { repos } from '../../repositories/index.js';
import { assessOrderRisk } from '../../engines/riskEngine/index.js';
import { marketService } from '../market/marketService.js';
import { historicalService } from '../historical/historicalService.js';
import { referencePrice } from '../../engines/matchingEngine/index.js';
import { config } from '../../config/index.js';

export const riskService = {
  /**
   * Prepares context and calls the pure, deterministic riskEngine.
   * AI layer uses this exact return payload without recalculation.
   */
  async assessOrder(userId, orderReq) {
    const symbol = String(orderReq.symbol).toUpperCase();
    const security = await repos.stocks.findById(symbol) || { symbol, sector: null };
    const quote = await marketService.getQuote(symbol);
    const estPrice = referencePrice(orderReq, quote);

    // Get user funds & portfolio holdings
    const funds = await repos.funds.findById(userId) || { availableCash: 0, blockedMargin: 0 };
    const portfolio = await repos.portfolios.findOne({ userId });
    const rawHoldings = portfolio ? await repos.holdings.findMany({ portfolioId: portfolio.id }) : [];

    // Enrich holdings with live prices and sectors
    const holdings = await Promise.all(
      rawHoldings.map(async (h) => {
        const q = await marketService.getQuote(h.symbol).catch(() => ({ ltp: h.avgPrice }));
        const sec = await repos.stocks.findById(h.symbol);
        return {
          symbol: h.symbol,
          quantity: h.quantity,
          ltp: q.ltp,
          sector: sec?.sector ?? null,
        };
      })
    );

    // Rules from market_rules
    const rules = await repos.marketRules.findMany({ isEnabled: true });

    // Recent 30 daily candles for volatility calculation
    const history = await historicalService.getHistory(symbol, { interval: '1d', range: '3M' }).catch(() => []);

    // Orders placed today
    const today = new Date().toISOString().slice(0, 10);
    const userOrders = await repos.orders.findMany({ userId });
    const ordersToday = userOrders.filter((o) => o.createdAt && o.createdAt.startsWith(today)).length;

    // Run the deterministic engine
    return assessOrderRisk({
      order: orderReq,
      price: estPrice,
      security,
      holdings,
      funds,
      rules,
      history,
      ordersToday,
      chargesConfig: { brokerageFlat: config.trading.brokerageFlat },
    });
  },
};
