/**
 * Normalized WebSocket event names.
 * The backend translates FYERS / TejHQ / Twelve Data socket payloads into these
 * events. The frontend must ONLY ever listen to these names.
 */
export const WS_EVENTS = Object.freeze({
  PRICE_UPDATE: 'price:update',
  MARKET_STATUS: 'market:status',
  ORDER_UPDATE: 'order:update',
  TRADE_EXECUTED: 'trade:executed',
  PORTFOLIO_UPDATE: 'portfolio:update',
  NEWS_NEW: 'news:new',
  ALERT_NEW: 'alert:new',
  SYNC_UPDATE: 'sync:update',
  SYSTEM_STATUS: 'system:status',
});

/** Client -> server control messages. */
export const WS_CLIENT_ACTIONS = Object.freeze({
  SUBSCRIBE: 'subscribe',     // { action, symbols: string[] }
  UNSUBSCRIBE: 'unsubscribe', // { action, symbols: string[] }
  AUTH: 'auth',               // { action, token }
  PING: 'ping',
});

/** Channels a socket can join. Symbol channels are `symbol:<SYMBOL>`. */
export const WS_CHANNELS = Object.freeze({
  MARKET: 'market',
  NEWS: 'news',
  SYSTEM: 'system',
  user: (userId) => `user:${userId}`,
  symbol: (symbol) => `symbol:${String(symbol).toUpperCase()}`,
});

/**
 * Envelope every server message uses.
 * @template T
 * @param {string} event
 * @param {T} data
 * @returns {{event: string, data: T, ts: number}}
 */
export const wsEnvelope = (event, data) => ({ event, data, ts: Date.now() });
