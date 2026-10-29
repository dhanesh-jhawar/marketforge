export * from './wsEvents.js';
export * from './market.js';
export * from './orders.js';
export * from './risk.js';
export * from './domain.js';

/** Standard API response envelope used by every backend endpoint. */
export const API_VERSION = 'v1';
export const API_ERROR_CODES = Object.freeze({
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RISK_RULE_VIOLATION: 'RISK_RULE_VIOLATION',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  MARKET_CLOSED: 'MARKET_CLOSED',
  PROVIDER_UNAVAILABLE: 'PROVIDER_UNAVAILABLE',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
});
