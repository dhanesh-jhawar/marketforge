/**
 * @typedef {Object} Holding   Delivery (CNC) position carried overnight.
 * @property {string} symbol
 * @property {number} quantity
 * @property {number} avgPrice
 * @property {number} investedValue
 * @property {number} ltp
 * @property {number} currentValue
 * @property {number} pnl
 * @property {number} pnlPct
 * @property {number} dayChange
 * @property {number} dayChangePct
 * @property {string|null} sector
 * @property {number} weightPct        % of total portfolio value
 */

/**
 * @typedef {Object} Position  Intraday (MIS) position.
 * @property {string} symbol
 * @property {number} netQuantity
 * @property {number} buyQuantity
 * @property {number} sellQuantity
 * @property {number} buyAvg
 * @property {number} sellAvg
 * @property {number} ltp
 * @property {number} realizedPnl
 * @property {number} unrealizedPnl
 */

/**
 * @typedef {Object} Funds
 * @property {number} totalCapital
 * @property {number} availableCash
 * @property {number} blockedMargin   reserved for open orders
 * @property {number} investedValue
 * @property {number} realizedPnl
 * @property {string} currency        INR
 */

/**
 * @typedef {Object} PortfolioSummary
 * @property {number} totalValue      cash + holdings market value
 * @property {number} investedValue
 * @property {number} currentValue
 * @property {number} totalPnl
 * @property {number} totalPnlPct
 * @property {number} dayPnl
 * @property {number} dayPnlPct
 * @property {Funds} funds
 * @property {number} holdingsCount
 * @property {number} timestamp
 */

/**
 * @typedef {Object} AllocationSlice
 * @property {string} key       symbol or sector
 * @property {number} value
 * @property {number} pct
 */

/**
 * @typedef {Object} PortfolioRisk   Deterministic portfolio risk metrics.
 * @property {number} concentrationTop1Pct
 * @property {number} concentrationTop5Pct
 * @property {number} largestSectorPct
 * @property {number} diversificationScore  0-100
 * @property {number|null} portfolioVolatility30d
 * @property {number} potentialLossAt5Pct
 * @property {number} potentialLossAt10Pct
 * @property {number} riskScore
 * @property {string} riskLevel
 */

export const createEmptyFunds = (capital = 0) => ({
  totalCapital: capital,
  availableCash: capital,
  blockedMargin: 0,
  investedValue: 0,
  realizedPnl: 0,
  currency: 'INR',
});
