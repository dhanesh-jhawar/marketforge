import { config } from '../config/index.js';
import { createLogger } from '../utils/logger.js';
import { MockMarketDataProvider, MockRealtimeProvider, MockNewsProvider, MockAIProvider } from './mock/index.js';
import { FyersMarketDataProvider, FyersRealtimeProvider } from './fyers/index.js';
import { TejHQMarketDataProvider } from './tejhq/index.js';
import { TwelveDataMarketDataProvider } from './twelveData/index.js';
import { GNewsProvider } from './gnews/index.js';
import { NewsApiProvider } from './newsapi/index.js';
import { GeminiProvider } from './gemini/index.js';
import { NseSecurityMasterProvider } from './nse/index.js';

const log = createLogger('providers');
const P = config.providers;

const MARKET_FACTORIES = {
  mock: () => new MockMarketDataProvider(),
  fyers: () => new FyersMarketDataProvider(P.fyers),
  tejhq: () => new TejHQMarketDataProvider(P.tejhq),
  twelvedata: () => new TwelveDataMarketDataProvider(P.twelveData),
};
const REALTIME_FACTORIES = {
  mock: () => new MockRealtimeProvider({ intervalMs: 2000 }),
  fyers: () => new FyersRealtimeProvider(P.fyers),
};

/**
 * Wraps an ordered list of providers. Each call tries providers in order,
 * skipping unconfigured ones, and falls through on error. The consumer sees
 * a single provider with the same interface.
 */
export function createFallbackChain(kind, providers) {
  const active = providers.filter((p) => {
    if (!p.isConfigured()) { log.warn(`${kind}: '${p.id}' not configured — skipped`); return false; }
    return true;
  });
  if (!active.length) throw new Error(`${kind}: no configured providers. Check .env`);
  log.info(`${kind} chain: ${active.map((p) => p.id).join(' -> ')}`);

  const call = (method) => async (...args) => {
    const errors = [];
    for (const p of active) {
      if (typeof p[method] !== 'function') continue;
      try { return await p[method](...args); }
      catch (e) { errors.push(`${p.id}: ${e.message}`); log.debug(`${kind}.${method} failed on ${p.id}`, { error: e.message }); }
    }
    const err = new Error(`${kind}.${method} failed on all providers`);
    err.code = 'PROVIDER_UNAVAILABLE'; err.details = errors;
    throw err;
  };

  return new Proxy({ providers: active, ids: active.map((p) => p.id) }, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (prop === 'then' || typeof prop === 'symbol') return undefined; // not a thenable
      return call(prop);
    },
  });
}

/** Lazily-built singleton registry. */
let registry = null;

/** @param {{ getUniverse: () => Promise<import('@marketforge/shared/types').Security[]> }} deps */
export function initProviders({ getUniverse }) {
  const pick = (factories, ids) => ids.map((id) => {
    if (!factories[id]) throw new Error(`Unknown provider '${id}'`);
    return factories[id]();
  });
  const newsFactories = {
    mock: () => new MockNewsProvider(getUniverse),
    gnews: () => new GNewsProvider(P.gnews),
    newsapi: () => new NewsApiProvider(P.newsapi),
  };
  const aiFactories = { mock: () => new MockAIProvider(), gemini: () => new GeminiProvider(P.gemini) };

  const realtime = (REALTIME_FACTORIES[config.market.realtimeProvider] ?? REALTIME_FACTORIES.mock)();
  const ai = aiFactories[config.ai.provider]?.() ?? aiFactories.mock();

  registry = {
    market: createFallbackChain('market', pick(MARKET_FACTORIES, config.market.providers)),
    historical: createFallbackChain('historical', pick(MARKET_FACTORIES, config.market.historicalProviders)),
    realtime: realtime.isConfigured() ? realtime : REALTIME_FACTORIES.mock(),
    news: createFallbackChain('news', pick(newsFactories, config.news.providers)),
    ai: ai.isConfigured() ? ai : aiFactories.mock(),
    securityMaster: new NseSecurityMasterProvider(P.nse),
  };
  log.info(`realtime=${registry.realtime.id} ai=${registry.ai.id}`);
  return registry;
}

export function getProviders() {
  if (!registry) throw new Error('Providers not initialised — call initProviders() first');
  return registry;
}
