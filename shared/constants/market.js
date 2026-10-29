export const EXCHANGES = Object.freeze({ NSE: 'NSE', BSE: 'BSE' });

/** NSE series codes we care about. EQ = normal equity, BE = trade-for-trade, etc. */
export const SERIES = Object.freeze({ EQ: 'EQ', BE: 'BE', BZ: 'BZ', SM: 'SM', ST: 'ST' });

export const INSTRUMENT_TYPES = Object.freeze({
  EQUITY: 'EQUITY',
  INDEX: 'INDEX',
  ETF: 'ETF',
});

export const MARKET_SESSION = Object.freeze({
  PRE_OPEN: 'PRE_OPEN',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  HOLIDAY: 'HOLIDAY',
  HALTED: 'HALTED', // admin-controlled simulation halt
});

/** Indian market hours (IST). */
export const MARKET_HOURS = Object.freeze({
  timezone: 'Asia/Kolkata',
  preOpen: { start: '09:00', end: '09:15' },
  regular: { start: '09:15', end: '15:30' },
});

export const HISTORY_INTERVALS = Object.freeze(['1m', '5m', '15m', '30m', '1h', '1d', '1w', '1M']);
export const HISTORY_RANGES = Object.freeze(['1D', '5D', '1M', '3M', '6M', '1Y', '3Y', '5Y', 'MAX']);

/** Benchmark indices tracked on the dashboard. Index *data* comes from providers. */
export const DEFAULT_INDICES = Object.freeze([
  { symbol: 'NIFTY50', name: 'NIFTY 50' },
  { symbol: 'SENSEX', name: 'S&P BSE SENSEX' },
  { symbol: 'BANKNIFTY', name: 'NIFTY BANK' },
  { symbol: 'NIFTYIT', name: 'NIFTY IT' },
  { symbol: 'NIFTYMIDCAP100', name: 'NIFTY MIDCAP 100' },
]);
