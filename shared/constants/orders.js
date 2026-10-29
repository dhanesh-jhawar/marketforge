export const ORDER_SIDE = Object.freeze({ BUY: 'BUY', SELL: 'SELL' });

export const ORDER_TYPE = Object.freeze({
  MARKET: 'MARKET',
  LIMIT: 'LIMIT',
  STOP_LOSS: 'SL',        // stop-loss limit
  STOP_LOSS_MARKET: 'SL-M',
});

/** CNC = delivery (holdings), MIS = intraday (positions). */
export const PRODUCT_TYPE = Object.freeze({ CNC: 'CNC', MIS: 'MIS' });

export const ORDER_VALIDITY = Object.freeze({ DAY: 'DAY', IOC: 'IOC' });

/**
 * Order lifecycle:
 * DRAFT -> (review) -> PENDING_CONFIRMATION -> (confirm) -> OPEN -> PARTIALLY_FILLED -> FILLED
 *                                                         \-> CANCELLED / REJECTED / EXPIRED
 */
export const ORDER_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
  OPEN: 'OPEN',
  PARTIALLY_FILLED: 'PARTIALLY_FILLED',
  FILLED: 'FILLED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
});

export const TERMINAL_ORDER_STATUSES = Object.freeze([
  ORDER_STATUS.FILLED,
  ORDER_STATUS.CANCELLED,
  ORDER_STATUS.REJECTED,
  ORDER_STATUS.EXPIRED,
]);

export const ORDER_EVENT_TYPE = Object.freeze({
  CREATED: 'CREATED',
  REVIEWED: 'REVIEWED',
  CONFIRMED: 'CONFIRMED',
  PARTIAL_FILL: 'PARTIAL_FILL',
  FILLED: 'FILLED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
});

export const TRANSACTION_TYPE = Object.freeze({
  INITIAL_CAPITAL: 'INITIAL_CAPITAL',
  BUY: 'BUY',
  SELL: 'SELL',
  CHARGES: 'CHARGES',
  BLOCK: 'BLOCK',       // funds reserved for open order
  RELEASE: 'RELEASE',   // funds released on cancel
  RESET: 'RESET',       // admin / user portfolio reset
  REWARD: 'REWARD',     // challenge reward
});
