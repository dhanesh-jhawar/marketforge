import { MarketDataProvider } from '../base/interfaces.js';
import { createQuote, createCandle } from '@marketforge/shared/types';
import { httpJson } from '../../utils/index.js';

/**
 * Twelve Data adapter — backup / global market data.
 * Docs: https://twelvedata.com/docs
 */
const INTERVAL = { '1m': '1min', '5m': '5min', '15m': '15min', '30m': '30min', '1h': '1h', '1d': '1day', '1w': '1week', '1M': '1month' };

export const twelveSymbol = (security) => {
  const s = security.providerSymbols?.twelvedata ?? `${security.symbol}:NSE`;
  const [symbol, exchange = 'NSE'] = s.split(':');
  return { symbol, exchange };
};

export function normalizeTwelveQuote(b, symbol) {
  return createQuote({
    symbol, exchange: b.exchange ?? 'NSE',
    ltp: Number(b.close), open: Number(b.open), high: Number(b.high), low: Number(b.low),
    prevClose: Number(b.previous_close), change: Number(b.change), changePct: Number(b.percent_change),
    volume: Number(b.volume ?? 0), timestamp: b.timestamp ? b.timestamp * 1000 : Date.now(),
    source: 'twelvedata', delayed: true,
  });
}

export class TwelveDataMarketDataProvider extends MarketDataProvider {
  constructor(cfg) { super('twelvedata', cfg); }
  isConfigured() { return Boolean(this.cfg.apiKey); }

  async getQuote(security) {
    const { symbol, exchange } = twelveSymbol(security);
    const p = new URLSearchParams({ symbol, exchange, apikey: this.cfg.apiKey });
    const b = await httpJson(`${this.cfg.baseUrl}/quote?${p}`);
    if (b?.status === 'error') throw new Error(`TwelveData: ${b.message}`);
    return normalizeTwelveQuote(b, security.symbol);
  }

  async getHistory(security, { interval = '1d', from, to }) {
    const { symbol, exchange } = twelveSymbol(security);
    const p = new URLSearchParams({
      symbol, exchange, interval: INTERVAL[interval] ?? '1day', apikey: this.cfg.apiKey, order: 'ASC', outputsize: '5000',
      start_date: from.toISOString().slice(0, 19).replace('T', ' '), end_date: to.toISOString().slice(0, 19).replace('T', ' '),
    });
    const b = await httpJson(`${this.cfg.baseUrl}/time_series?${p}`);
    if (b?.status === 'error') throw new Error(`TwelveData: ${b.message}`);
    return (b.values ?? []).map((v) => createCandle({ time: new Date(v.datetime + (v.datetime.length === 10 ? 'T00:00:00+05:30' : '+05:30')).getTime(), open: v.open, high: v.high, low: v.low, close: v.close, volume: v.volume }));
  }
}
