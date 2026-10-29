/**
 * @typedef {Object} Quote  Normalized real-time / delayed quote. Every provider maps to this.
 * @property {string} symbol
 * @property {string} exchange
 * @property {number} ltp            Last traded price
 * @property {number} open
 * @property {number} high
 * @property {number} low
 * @property {number} prevClose
 * @property {number} change         ltp - prevClose
 * @property {number} changePct
 * @property {number} volume
 * @property {number|null} bid
 * @property {number|null} ask
 * @property {number} timestamp      epoch ms
 * @property {string} source         provider id (mock | fyers | tejhq | twelvedata)
 * @property {boolean} delayed
 */

/**
 * @typedef {Object} Candle
 * @property {number} time   epoch ms (bar open)
 * @property {number} open
 * @property {number} high
 * @property {number} low
 * @property {number} close
 * @property {number} volume
 */

/**
 * @typedef {Object} IndexSnapshot
 * @property {string} symbol
 * @property {string} name
 * @property {number} value
 * @property {number} change
 * @property {number} changePct
 * @property {number} timestamp
 */

/**
 * @typedef {Object} MarketStatus
 * @property {string} exchange
 * @property {string} session        see MARKET_SESSION
 * @property {boolean} isOpen
 * @property {string|null} nextOpen  ISO
 * @property {string|null} nextClose ISO
 * @property {string|null} message   e.g. admin halt reason
 * @property {number} timestamp
 */

/**
 * @typedef {Object} HeatmapCell
 * @property {string} symbol
 * @property {string} sector
 * @property {number} changePct
 * @property {number} weight   market cap or traded value used for sizing
 */

const round = (n, d = 2) => (Number.isFinite(n) ? Math.round(n * 10 ** d) / 10 ** d : 0);

/** @param {Partial<Quote>} q @returns {Quote} */
export function createQuote(q = {}) {
  const ltp = Number(q.ltp ?? 0);
  const prevClose = Number(q.prevClose ?? ltp);
  const change = q.change != null ? Number(q.change) : ltp - prevClose;
  return {
    symbol: String(q.symbol || '').toUpperCase(),
    exchange: q.exchange ?? 'NSE',
    ltp: round(ltp),
    open: round(Number(q.open ?? ltp)),
    high: round(Number(q.high ?? ltp)),
    low: round(Number(q.low ?? ltp)),
    prevClose: round(prevClose),
    change: round(change),
    changePct: round(q.changePct != null ? Number(q.changePct) : prevClose ? (change / prevClose) * 100 : 0),
    volume: Number(q.volume ?? 0),
    bid: q.bid ?? null,
    ask: q.ask ?? null,
    timestamp: Number(q.timestamp ?? Date.now()),
    source: q.source ?? 'unknown',
    delayed: Boolean(q.delayed ?? false),
  };
}

/** @param {Partial<Candle>} c @returns {Candle} */
export function createCandle(c = {}) {
  return {
    time: Number(c.time),
    open: round(Number(c.open)),
    high: round(Number(c.high)),
    low: round(Number(c.low)),
    close: round(Number(c.close)),
    volume: Number(c.volume ?? 0),
  };
}
