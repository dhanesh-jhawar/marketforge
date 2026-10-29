import { EventEmitter } from 'node:events';

/**
 * ============================================================
 * PROVIDER INTERFACES
 * ------------------------------------------------------------
 * Every external integration implements one of these. Providers
 * MUST return shared/types normalized objects (createQuote,
 * createCandle, createSecurity, createNewsArticle). Nothing
 * provider-specific may leak past the provider boundary.
 * ============================================================
 */

export class BaseProvider {
  /** @param {string} id @param {object} cfg */
  constructor(id, cfg = {}) {
    this.id = id;
    this.cfg = cfg;
  }
  /** True if required credentials are present. Unconfigured providers are skipped in fallback chains. */
  isConfigured() { return true; }
  /** @returns {Promise<{ok:boolean, latencyMs?:number, error?:string}>} */
  async healthCheck() { return { ok: this.isConfigured() }; }
  notImplemented(method) {
    const e = new Error(`${this.id}.${method} not implemented`);
    e.code = 'NOT_IMPLEMENTED';
    return e;
  }
}

/** Quotes, history, indices, market status. */
export class MarketDataProvider extends BaseProvider {
  /** @returns {{quotes:boolean, history:boolean, indices:boolean, marketStatus:boolean}} */
  get capabilities() { return { quotes: true, history: true, indices: false, marketStatus: false }; }
  /** @param {import('@marketforge/shared/types').Security} security @returns {Promise<import('@marketforge/shared/types').Quote>} */
  async getQuote(security) { throw this.notImplemented('getQuote'); }
  /** Batch quotes. Default: sequential getQuote. Override for batch endpoints. */
  async getQuotes(securities) { return Promise.all(securities.map((s) => this.getQuote(s))); }
  /**
   * @param {import('@marketforge/shared/types').Security} security
   * @param {{interval:string, from:Date, to:Date}} opts
   * @returns {Promise<import('@marketforge/shared/types').Candle[]>}
   */
  async getHistory(security, opts) { throw this.notImplemented('getHistory'); }
  /** @returns {Promise<import('@marketforge/shared/types').IndexSnapshot[]>} */
  async getIndices() { throw this.notImplemented('getIndices'); }
  /** @returns {Promise<import('@marketforge/shared/types').MarketStatus>} */
  async getMarketStatus() { throw this.notImplemented('getMarketStatus'); }
}

/**
 * Streaming provider. Emits:
 *   'tick'   (Quote)                 normalized quote
 *   'status' ({connected:boolean})
 *   'error'  (Error)
 */
export class RealtimeProvider extends BaseProvider {
  constructor(id, cfg) {
    super(id, cfg);
    this.events = new EventEmitter();
    this.subscribed = new Map(); // symbol -> Security
  }
  async connect() { throw this.notImplemented('connect'); }
  async disconnect() {}
  /** @param {import('@marketforge/shared/types').Security[]} securities */
  async subscribe(securities) { for (const s of securities) this.subscribed.set(s.symbol, s); }
  /** @param {string[]} symbols */
  async unsubscribe(symbols) { for (const s of symbols) this.subscribed.delete(s); }
  onTick(cb) { this.events.on('tick', cb); return () => this.events.off('tick', cb); }
  onStatus(cb) { this.events.on('status', cb); return () => this.events.off('status', cb); }
}

/** Financial news. */
export class NewsProvider extends BaseProvider {
  /**
   * @param {{query?:string, symbols?:string[], limit?:number, from?:Date, language?:string}} opts
   * @returns {Promise<import('@marketforge/shared/types').NewsArticle[]>}
   */
  async getLatest(opts) { throw this.notImplemented('getLatest'); }
  async search(query, opts = {}) { return this.getLatest({ ...opts, query }); }
}

/**
 * LLM provider. Receives ONLY pre-computed, deterministic facts in `grounding`.
 * Must never be asked to compute financial numbers.
 */
export class AIProvider extends BaseProvider {
  /**
   * @param {{system:string, messages:Array<{role:'user'|'assistant', content:string}>, grounding?:object, maxTokens?:number, temperature?:number}} req
   * @returns {Promise<{text:string, model:string, usage?:{in:number, out:number}}>}
   */
  async generate(req) { throw this.notImplemented('generate'); }
}

/** Listed-company universe. */
export class SecurityMasterProvider extends BaseProvider {
  /** @returns {Promise<import('@marketforge/shared/types').Security[]>} */
  async fetchAll() { throw this.notImplemented('fetchAll'); }
}
