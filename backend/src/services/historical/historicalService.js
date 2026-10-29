import { repos } from '../../repositories/index.js';
import { getProviders } from '../../providers/index.js';
import { TTLCache } from '../../utils/index.js';
import { config } from '../../config/index.js';

const historyCache = new TTLCache(config.market.historyCacheTtlMs);

export const historicalService = {
  async getHistory(symbol, { interval = '1d', range = '1Y', from, to } = {}) {
    const sym = String(symbol).toUpperCase();
    const cacheKey = `${sym}:${interval}:${range}:${from || ''}:${to || ''}`;
    const cached = historyCache.get(cacheKey);
    if (cached) return cached;

    const toDate = to ? new Date(to) : new Date();
    let fromDate = from ? new Date(from) : null;

    if (!fromDate) {
      const rangeMap = {
        '1D': 1 * 864e5,
        '5D': 5 * 864e5,
        '1M': 30 * 864e5,
        '3M': 90 * 864e5,
        '6M': 180 * 864e5,
        '1Y': 365 * 864e5,
        '3Y': 3 * 365 * 864e5,
        '5Y': 5 * 365 * 864e5,
        'MAX': 10 * 365 * 864e5,
      };
      const ms = rangeMap[range] || 365 * 864e5;
      fromDate = new Date(toDate.getTime() - ms);
    }

    const security = await repos.stocks.findById(sym);
    const providers = getProviders();
    const candles = await providers.historical.getHistory(security || { symbol: sym }, {
      interval,
      from: fromDate,
      to: toDate,
    });

    historyCache.set(cacheKey, candles);
    return candles;
  },
};
