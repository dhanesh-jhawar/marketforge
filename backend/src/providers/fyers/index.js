import { MarketDataProvider, RealtimeProvider } from '../base/interfaces.js';
import { createQuote, createCandle } from '@marketforge/shared/types';
import { MARKET_SESSION } from '@marketforge/shared/constants';
import { httpJson } from '../../utils/index.js';

/**
 * FYERS API v3 adapter — historical data, quotes, market status.
 * Docs: https://myapi.fyers.in/docsv3
 *
 * Auth: FYERS uses an OAuth-style daily access token. The admin sync screen
 * should drive the login flow (FYERS_REDIRECT_URI) and persist the token in
 * market_config; FYERS_ACCESS_TOKEN env is a dev shortcut.
 */
const RESOLUTION = { '1m': '1', '5m': '5', '15m': '15', '30m': '30', '1h': '60', '1d': 'D', '1w': 'W', '1M': 'M' };

export const fyersSymbol = (security) => security.providerSymbols?.fyers ?? `NSE:${security.symbol}-EQ`;

/** Normalize a FYERS /quotes `d[i]` entry. */
export function normalizeFyersQuote(entry, symbol) {
  const v = entry.v ?? {};
  return createQuote({
    symbol, exchange: 'NSE',
    ltp: v.lp, open: v.open_price, high: v.high_price, low: v.low_price, prevClose: v.prev_close_price,
    change: v.ch, changePct: v.chp, volume: v.volume, bid: v.bid ?? null, ask: v.ask ?? null,
    timestamp: v.tt ? Number(v.tt) * 1000 : Date.now(), source: 'fyers',
  });
}

export class FyersMarketDataProvider extends MarketDataProvider {
  constructor(cfg) { super('fyers', cfg); }
  get capabilities() { return { quotes: true, history: true, indices: true, marketStatus: true }; }
  isConfigured() { return Boolean(this.cfg.appId && this.cfg.accessToken); }

  #headers() { return { Authorization: `${this.cfg.appId}:${this.cfg.accessToken}` }; }

  async getQuotes(securities) {
    // FYERS supports up to 50 symbols per call.
    const out = [];
    for (let i = 0; i < securities.length; i += 50) {
      const chunk = securities.slice(i, i + 50);
      const bySym = new Map(chunk.map((s) => [fyersSymbol(s), s.symbol]));
      const url = `${this.cfg.dataUrl}/quotes?symbols=${encodeURIComponent([...bySym.keys()].join(','))}`;
      const body = await httpJson(url, { headers: this.#headers() });
      if (body?.s !== 'ok') throw new Error(`FYERS quotes error: ${body?.message ?? 'unknown'}`);
      for (const d of body.d ?? []) if (d.s === 'ok') out.push(normalizeFyersQuote(d, bySym.get(d.n)));
    }
    return out;
  }
  async getQuote(security) { return (await this.getQuotes([security]))[0]; }

  async getHistory(security, { interval = '1d', from, to }) {
    const params = new URLSearchParams({
      symbol: fyersSymbol(security), resolution: RESOLUTION[interval] ?? 'D', date_format: '0',
      range_from: String(Math.floor(from.getTime() / 1000)), range_to: String(Math.floor(to.getTime() / 1000)), cont_flag: '1',
    });
    const body = await httpJson(`${this.cfg.dataUrl}/history?${params}`, { headers: this.#headers() });
    if (body?.s !== 'ok') throw new Error(`FYERS history error: ${body?.message ?? 'unknown'}`);
    return (body.candles ?? []).map(([t, o, h, l, c, v]) => createCandle({ time: t * 1000, open: o, high: h, low: l, close: c, volume: v }));
  }

  async getMarketStatus() {
    const body = await httpJson(`${this.cfg.dataUrl}/marketStatus`, { headers: this.#headers() });
    // TODO: map FYERS segment statuses precisely; capital-market segment = exchange 10, segment 10.
    const cm = (body?.marketStatus ?? []).find((m) => m.exchange === 10 && m.segment === 10);
    const isOpen = cm?.status === 'OPEN';
    return { exchange: 'NSE', session: isOpen ? MARKET_SESSION.OPEN : MARKET_SESSION.CLOSED, isOpen, nextOpen: null, nextClose: null, message: null, timestamp: Date.now() };
  }

  async getIndices() {
    // FYERS index symbols, e.g. NSE:NIFTY50-INDEX, NSE:NIFTYBANK-INDEX, BSE:SENSEX-INDEX
    const map = { NIFTY50: 'NSE:NIFTY50-INDEX', BANKNIFTY: 'NSE:NIFTYBANK-INDEX', SENSEX: 'BSE:SENSEX-INDEX', NIFTYIT: 'NSE:NIFTYIT-INDEX', NIFTYMIDCAP100: 'NSE:NIFTYMIDCAP100-INDEX' };
    const quotes = await this.getQuotes(Object.entries(map).map(([symbol, fy]) => ({ symbol, providerSymbols: { fyers: fy } })));
    return quotes.map((q) => ({ symbol: q.symbol, name: q.symbol, value: q.ltp, change: q.change, changePct: q.changePct, timestamp: q.timestamp }));
  }
}

/**
 * FYERS Data WebSocket. The FYERS feed uses a binary protocol; use the official
 * `fyers-api-v3` Node SDK (`fyersDataSocket`) inside connect() and translate
 * each message with normalizeFyersSocketTick -> emit('tick', Quote).
 */
export class FyersRealtimeProvider extends RealtimeProvider {
  constructor(cfg) { super('fyers', cfg); }
  isConfigured() { return Boolean(this.cfg.appId && this.cfg.accessToken); }
  async connect() {
    // TODO(fyers-ws):
    //   const { fyersDataSocket } = await import('fyers-api-v3');
    //   this.sock = fyersDataSocket.getInstance(`${appId}:${accessToken}`);
    //   this.sock.on('message', (m) => this.events.emit('tick', normalizeFyersSocketTick(m)));
    //   this.sock.on('connect', () => this.events.emit('status', { connected: true }));
    //   this.sock.connect();
    throw this.notImplemented('connect');
  }
  async subscribe(securities) {
    await super.subscribe(securities);
    // TODO(fyers-ws): this.sock?.subscribe(securities.map(fyersSymbol));
  }
}

/** Map a FYERS socket "sf" (symbol feed) message to a Quote. */
export function normalizeFyersSocketTick(m) {
  const symbol = String(m.symbol ?? '').replace(/^NSE:/, '').replace(/-EQ$/, '');
  return createQuote({
    symbol, ltp: m.ltp, open: m.open_price, high: m.high_price, low: m.low_price, prevClose: m.prev_close_price,
    change: m.ch, changePct: m.chp, volume: m.vol_traded_today, bid: m.bid_price, ask: m.ask_price,
    timestamp: m.last_traded_time ? m.last_traded_time * 1000 : Date.now(), source: 'fyers',
  });
}
