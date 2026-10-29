import { MarketDataProvider, RealtimeProvider, NewsProvider, AIProvider } from '../base/interfaces.js';
import { createQuote, createCandle, createNewsArticle } from '@marketforge/shared/types';
import { DEFAULT_INDICES, MARKET_SESSION } from '@marketforge/shared/constants';
import { seededRandom, round } from '../../utils/index.js';
import { getIstSession } from '../../services/market/marketHours.js';

/**
 * Deterministic synthetic market. Works for ANY symbol (no hardcoded list):
 * base price & volatility are derived from a hash of the symbol.
 */
const state = new Map(); // symbol -> { ltp, open, high, low, prevClose, volume, vol }

function baseFor(symbol) {
  const rnd = seededRandom(symbol);
  const price = round(50 + rnd() ** 2 * 4000, 2);   // ₹50 – ₹4050, skewed lower
  const vol = 0.15 + rnd() * 0.45;                    // 15%–60% annualised
  return { price, vol };
}

function ensure(symbol) {
  if (!state.has(symbol)) {
    const { price, vol } = baseFor(symbol);
    const rnd = seededRandom(symbol + new Date().toISOString().slice(0, 10));
    const prevClose = price;
    const open = round(prevClose * (1 + (rnd() - 0.5) * 0.02));
    state.set(symbol, { ltp: open, open, high: open, low: open, prevClose, volume: Math.floor(rnd() * 1e6), vol });
  }
  return state.get(symbol);
}

function step(symbol) {
  const s = ensure(symbol);
  const sigmaPerTick = s.vol / Math.sqrt(252 * 375 * 12); // ~5s ticks
  const shock = (Math.random() - 0.5) * 2 * sigmaPerTick * 3;
  s.ltp = round(Math.max(0.05, s.ltp * (1 + shock)));
  s.high = Math.max(s.high, s.ltp);
  s.low = Math.min(s.low, s.ltp);
  s.volume += Math.floor(Math.random() * 5000);
  return s;
}

const toQuote = (symbol, s) => createQuote({ symbol, ...s, source: 'mock', timestamp: Date.now() });

export class MockMarketDataProvider extends MarketDataProvider {
  constructor() { super('mock'); }
  get capabilities() { return { quotes: true, history: true, indices: true, marketStatus: true }; }

  async getQuote(security) { return toQuote(security.symbol, ensure(security.symbol)); }

  async getHistory(security, { interval = '1d', from, to }) {
    const { price, vol } = baseFor(security.symbol);
    const stepMs = { '1m': 6e4, '5m': 3e5, '15m': 9e5, '30m': 18e5, '1h': 36e5, '1d': 864e5, '1w': 6048e5, '1M': 2592e6 }[interval] ?? 864e5;
    const end = (to ?? new Date()).getTime();
    const start = (from ?? new Date(end - 365 * 864e5)).getTime();
    const n = Math.min(5000, Math.max(1, Math.floor((end - start) / stepMs)));
    const rnd = seededRandom(`${security.symbol}:${interval}`);
    const sigma = vol * Math.sqrt(stepMs / (252 * 864e5));
    // Walk backward from today's anchor so recent history converges on the live price.
    const closes = new Array(n);
    let p = ensure(security.symbol).prevClose || price;
    for (let i = n - 1; i >= 0; i--) {
      closes[i] = p;
      const z = Math.sqrt(-2 * Math.log(rnd() || 1e-9)) * Math.cos(2 * Math.PI * rnd());
      p = Math.max(1, p / Math.exp(sigma * z + 0.00005));
    }
    const candles = [];
    for (let i = 0; i < n; i++) {
      const close = closes[i];
      const open = i ? closes[i - 1] : close;
      const wiggle = Math.abs(close - open) + close * sigma * rnd();
      const t = start + i * stepMs;
      if (stepMs >= 864e5 && [0, 6].includes(new Date(t).getUTCDay())) continue; // skip weekends
      candles.push(createCandle({ time: t, open, high: Math.max(open, close) + wiggle * 0.5, low: Math.min(open, close) - wiggle * 0.5, close, volume: Math.floor(1e5 + rnd() * 2e6) }));
    }
    return candles;
  }

  async getIndices() {
    return DEFAULT_INDICES.map(({ symbol, name }) => {
      const q = toQuote(symbol, step(symbol));
      return { symbol, name, value: q.ltp * 10, change: q.change * 10, changePct: q.changePct, timestamp: q.timestamp };
    });
  }

  async getMarketStatus() {
    const session = getIstSession(new Date());
    return { exchange: 'NSE', session, isOpen: session === MARKET_SESSION.OPEN, nextOpen: null, nextClose: null, message: 'Simulated market (mock provider)', timestamp: Date.now() };
  }
}

export class MockRealtimeProvider extends RealtimeProvider {
  constructor({ intervalMs = 2000 } = {}) { super('mock'); this.intervalMs = intervalMs; this.timer = null; }
  async connect() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      for (const symbol of this.subscribed.keys()) this.events.emit('tick', toQuote(symbol, step(symbol)));
    }, this.intervalMs);
    this.events.emit('status', { connected: true });
  }
  async disconnect() { clearInterval(this.timer); this.timer = null; this.events.emit('status', { connected: false }); }
}

const HEADLINES = [
  ['{name} reports quarterly results; revenue in focus', 'NEUTRAL'],
  ['{name} shares rise after analyst upgrade', 'POSITIVE'],
  ['{name} faces margin pressure amid input cost rise', 'NEGATIVE'],
  ['{name} announces expansion plans in {sector}', 'POSITIVE'],
  ['Sector watch: what the latest data means for {sector}', 'NEUTRAL'],
];

export class MockNewsProvider extends NewsProvider {
  constructor(getUniverse) { super('mock'); this.getUniverse = getUniverse; }
  async getLatest({ symbols, limit = 20, query } = {}) {
    const universe = (await this.getUniverse()).filter((s) => !symbols?.length || symbols.includes(s.symbol));
    const rnd = seededRandom(new Date().toISOString().slice(0, 13) + (symbols ?? []).join());
    const out = [];
    for (let i = 0; i < Math.min(limit, universe.length * 2); i++) {
      const sec = universe[Math.floor(rnd() * universe.length)];
      if (!sec) break;
      const [tpl, sentiment] = HEADLINES[Math.floor(rnd() * HEADLINES.length)];
      const title = tpl.replace('{name}', sec.name).replace('{sector}', sec.sector ?? 'the market');
      if (query && !title.toLowerCase().includes(query.toLowerCase())) continue;
      out.push(createNewsArticle({
        title, summary: `Synthetic demo article about ${sec.name}. Replace with GNews/NewsAPI in production.`,
        url: `https://example.com/mock/${sec.symbol}/${i}`, sourceName: 'MarketForge Demo Wire', provider: 'mock',
        publishedAt: new Date(Date.now() - i * 37 * 60000).toISOString(), symbols: [sec.symbol], sectors: [sec.sector].filter(Boolean), sentiment,
      }));
    }
    return out;
  }
}

export class MockAIProvider extends AIProvider {
  constructor() { super('mock'); }
  async generate({ messages, grounding }) {
    const last = messages.at(-1)?.content ?? '';
    const facts = grounding ? `\n\nFacts provided by MarketForge engines:\n${JSON.stringify(grounding, null, 2)}` : '';
    return {
      text: `[Mock AI] Set AI_PROVIDER=gemini and GEMINI_API_KEY to get real explanations.\nYou asked: "${last.slice(0, 200)}"${facts}`,
      model: 'mock',
      usage: { in: 0, out: 0 },
    };
  }
}
