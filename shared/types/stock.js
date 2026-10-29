/**
 * @typedef {Object} Security  Normalized entry from the NSE security master.
 * @property {string} symbol           NSE trading symbol, e.g. "INFY"
 * @property {string} name             Company name
 * @property {string} exchange         NSE | BSE
 * @property {string} series           EQ | BE | ...
 * @property {string|null} isin
 * @property {string|null} sector      Normalized sector (see SECTORS)
 * @property {string|null} industry
 * @property {number|null} faceValue
 * @property {number|null} lotSize
 * @property {string|null} listingDate ISO date
 * @property {string} instrumentType   EQUITY | ETF | INDEX
 * @property {boolean} isActive
 * @property {Object<string,string>} providerSymbols  e.g. { fyers: "NSE:INFY-EQ", twelvedata: "INFY:NSE" }
 */

/**
 * @typedef {Object} StockProfile
 * @property {Security} security
 * @property {number|null} marketCap
 * @property {number|null} peRatio
 * @property {number|null} pbRatio
 * @property {number|null} dividendYield
 * @property {number|null} week52High
 * @property {number|null} week52Low
 * @property {string|null} description
 */

/** @param {Partial<Security>} s @returns {Security} */
export function createSecurity(s = {}) {
  const symbol = String(s.symbol || '').trim().toUpperCase();
  return {
    symbol,
    name: s.name ?? symbol,
    exchange: s.exchange ?? 'NSE',
    series: s.series ?? 'EQ',
    isin: s.isin ?? null,
    sector: s.sector ?? null,
    industry: s.industry ?? null,
    faceValue: s.faceValue != null ? Number(s.faceValue) : null,
    lotSize: s.lotSize != null ? Number(s.lotSize) : 1,
    listingDate: s.listingDate ?? null,
    instrumentType: s.instrumentType ?? 'EQUITY',
    isActive: s.isActive ?? true,
    providerSymbols: s.providerSymbols ?? {
      fyers: `NSE:${symbol}-EQ`,
      twelvedata: `${symbol}:NSE`,
      tejhq: symbol,
    },
  };
}
