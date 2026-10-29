import { repos } from '../../repositories/index.js';
import { getProviders } from '../../providers/index.js';
import { TTLCache } from '../../utils/index.js';
import { config } from '../../config/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { eventBus } from '../../websocket/eventBus.js';
import { WS_EVENTS } from '@marketforge/shared/constants';

const quoteCache = new TTLCache(config.market.quoteCacheTtlMs);

export const marketService = {
  /** Returns the full universe of active NSE securities */
  async getUniverse() {
    return repos.stocks.findMany({ isActive: true });
  },

  async getSecurity(symbol) {
    const s = await repos.stocks.findById(String(symbol).toUpperCase());
    if (!s) throw ApiError.notFound(`Security ${symbol} not found`);
    return s;
  },

  async getQuote(symbol) {
    const sym = String(symbol).toUpperCase();
    const cached = quoteCache.get(sym);
    if (cached) return cached;

    const security = await this.getSecurity(sym);
    const providers = getProviders();
    const quote = await providers.market.getQuote(security);

    quoteCache.set(sym, quote);
    await repos.stockPrices.upsert(quote);
    return quote;
  },

  async getQuotes(symbols) {
    const list = Array.isArray(symbols) ? symbols : [symbols];
    return Promise.all(list.map((s) => this.getQuote(s)));
  },

  async getMarketStatus() {
    const configHalt = await repos.marketConfig.findById('market_halted');
    if (configHalt?.value === true || configHalt?.value === 'true') {
      return {
        exchange: 'NSE',
        session: 'HALTED',
        isOpen: false,
        message: 'Trading halted by administrator for maintenance/simulation',
        timestamp: Date.now(),
      };
    }
    const providers = getProviders();
    return providers.market.getMarketStatus();
  },

  async getIndices() {
    const providers = getProviders();
    return providers.market.getIndices();
  },

  async getMovers({ limit = 10 } = {}) {
    const universe = await this.getUniverse();
    const sample = universe.slice(0, 30);
    const quotes = await Promise.all(sample.map((s) => this.getQuote(s.symbol).catch(() => null)));
    const valid = quotes.filter(Boolean);

    const gainers = [...valid].sort((a, b) => b.changePct - a.changePct).slice(0, limit);
    const losers = [...valid].sort((a, b) => a.changePct - b.changePct).slice(0, limit);
    const active = [...valid].sort((a, b) => b.volume - a.volume).slice(0, limit);

    return { gainers, losers, active };
  },

  async getHeatmap() {
    const universe = await this.getUniverse();
    const sample = universe.slice(0, 40);
    const quotes = await Promise.all(sample.map((s) => this.getQuote(s.symbol).catch(() => null)));
    const cells = quotes.filter(Boolean).map((q) => {
      const sec = universe.find((u) => u.symbol === q.symbol);
      return {
        symbol: q.symbol,
        name: sec?.name ?? q.symbol,
        sector: sec?.sector ?? 'Other',
        changePct: q.changePct,
        weight: q.ltp * (q.volume || 1000),
      };
    });
    return cells;
  },

  async search(query, limit = 20) {
    if (!query) return [];
    return repos.stocks.search(query, ['symbol', 'name', 'sector'], { limit });
  },

  /** Ingest ticks from RealtimeProvider and broadcast to WS clients */
  onTick(quote) {
    quoteCache.set(quote.symbol, quote);
    eventBus.publish(WS_EVENTS.PRICE_UPDATE, quote, { channel: `symbol:${quote.symbol}` });
    eventBus.publish(WS_EVENTS.PRICE_UPDATE, quote, { channel: 'market' });
  },
};
