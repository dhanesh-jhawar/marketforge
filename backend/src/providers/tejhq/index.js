import { MarketDataProvider } from '../base/interfaces.js';
import { createQuote, createCandle } from '@marketforge/shared/types';
import { httpJson } from '../../utils/index.js';

export const tejSymbol = (security) => security.providerSymbols?.tejhq ?? security.symbol;

/** Map a TejHQ quote payload to the internal Quote. */
export function normalizeTejQuote(raw, symbol) {
  const ltp = Number(raw.ltp ?? raw.last_price ?? raw.close ?? raw.price ?? 0);
  const prevClose = Number(raw.prev_close ?? raw.previous_close ?? raw.prevClose ?? (ltp * 0.99));
  const change = Number(raw.change ?? (ltp - prevClose));
  const changePct = Number(raw.change_percent ?? raw.changePct ?? (prevClose > 0 ? (change / prevClose) * 100 : 0));

  return createQuote({
    symbol,
    exchange: raw.exchange ?? 'NSE',
    ltp,
    open: Number(raw.open ?? ltp),
    high: Number(raw.high ?? Math.max(ltp, prevClose)),
    low: Number(raw.low ?? Math.min(ltp, prevClose)),
    prevClose,
    change,
    changePct,
    volume: Number(raw.volume ?? raw.totalTradedVolume ?? 100000),
    timestamp: raw.timestamp ? new Date(raw.timestamp).getTime() : Date.now(),
    source: 'tejhq',
    delayed: false,
  });
}

export class TejHQMarketDataProvider extends MarketDataProvider {
  constructor(cfg) {
    super('tejhq', cfg);
  }

  get capabilities() {
    return { quotes: true, history: true, indices: true, marketStatus: true };
  }

  isConfigured() {
    return Boolean(this.cfg.apiKey);
  }

  async getQuote(security) {
    const symbol = tejSymbol(security);
    const headers = {
      'Authorization': `Bearer ${this.cfg.apiKey}`,
      'x-api-key': this.cfg.apiKey,
      'Accept': 'application/json',
    };

    try {
      // Primary quote path on TejHQ
      const url = `${this.cfg.baseUrl || 'https://api.tejhq.dev/v1'}/quote?symbol=${encodeURIComponent(symbol)}`;
      const res = await httpJson(url, { headers, timeoutMs: 5000 });
      return normalizeTejQuote(res?.data ?? res, security.symbol);
    } catch (err) {
      // Fallback secondary equity path
      const altUrl = `${this.cfg.baseUrl || 'https://api.tejhq.dev/v1'}/equity/${encodeURIComponent(symbol)}`;
      const res = await httpJson(altUrl, { headers, timeoutMs: 5000 });
      return normalizeTejQuote(res?.data ?? res, security.symbol);
    }
  }

  async getHistory(security, { interval = '1d', from, to }) {
    const symbol = tejSymbol(security);
    const headers = {
      'Authorization': `Bearer ${this.cfg.apiKey}`,
      'x-api-key': this.cfg.apiKey,
    };
    const fromStr = from ? from.toISOString().split('T')[0] : '';
    const toStr = to ? to.toISOString().split('T')[0] : '';

    const url = `${this.cfg.baseUrl || 'https://api.tejhq.dev/v1'}/history?symbol=${encodeURIComponent(symbol)}&interval=${interval}&from=${fromStr}&to=${toStr}`;
    const res = await httpJson(url, { headers, timeoutMs: 8000 });
    const records = res?.data ?? res?.values ?? (Array.isArray(res) ? res : []);

    return records.map((r) =>
      createCandle({
        time: r.timestamp ? new Date(r.timestamp).getTime() : new Date(r.date).getTime(),
        open: Number(r.open),
        high: Number(r.high),
        low: Number(r.low),
        close: Number(r.close),
        volume: Number(r.volume || 0),
      })
    );
  }

  async getIndices() {
    const headers = {
      'Authorization': `Bearer ${this.cfg.apiKey}`,
      'x-api-key': this.cfg.apiKey,
    };
    const url = `${this.cfg.baseUrl || 'https://api.tejhq.dev/v1'}/indices`;
    const res = await httpJson(url, { headers, timeoutMs: 5000 });
    return res?.data ?? res ?? [];
  }
}
