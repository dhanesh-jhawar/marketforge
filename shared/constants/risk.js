/**
 * Default virtual-trading rules. Admins override these via `market_rules`.
 * The deterministic risk engine is the ONLY place these are evaluated.
 */
export const DEFAULT_RISK_RULES = Object.freeze({
  maxPositionPct: 20,          // max % of portfolio in a single stock after the order
  maxSectorPct: 40,            // max % of portfolio in a single sector after the order
  maxOrderValuePct: 25,        // max single order value as % of portfolio value
  maxDailyOrders: 50,
  minCashBufferPct: 0,         // cash that must remain after order
  allowShortSelling: false,
  allowIntraday: true,
  highVolatilityThresholdPct: 45, // annualised 30d vol above this => warning
});

export const RISK_LEVEL = Object.freeze({
  LOW: 'LOW',
  MODERATE: 'MODERATE',
  HIGH: 'HIGH',
  VERY_HIGH: 'VERY_HIGH',
});

export const RULE_SEVERITY = Object.freeze({
  INFO: 'INFO',
  WARNING: 'WARNING',   // allowed, but user must acknowledge
  BLOCKING: 'BLOCKING', // order is rejected
});

/** Stress scenarios the risk engine always computes. */
export const STRESS_MOVES_PCT = Object.freeze([-5, -10]);

/** Trading days used for volatility window. */
export const VOLATILITY_WINDOW_DAYS = 30;
export const TRADING_DAYS_PER_YEAR = 252;
