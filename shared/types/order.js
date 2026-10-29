/**
 * @typedef {Object} OrderRequest   What the client submits for review / placement.
 * @property {string} symbol
 * @property {'BUY'|'SELL'} side
 * @property {'MARKET'|'LIMIT'|'SL'|'SL-M'} orderType
 * @property {'CNC'|'MIS'} product
 * @property {number} quantity
 * @property {number|null} [limitPrice]
 * @property {number|null} [triggerPrice]
 * @property {'DAY'|'IOC'} [validity]
 */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} userId
 * @property {string} symbol
 * @property {string} side
 * @property {string} orderType
 * @property {string} product
 * @property {number} quantity
 * @property {number} filledQuantity
 * @property {number|null} limitPrice
 * @property {number|null} triggerPrice
 * @property {number|null} avgFillPrice
 * @property {string} validity
 * @property {string} status          see ORDER_STATUS
 * @property {string|null} rejectionReason
 * @property {RiskAssessment|null} riskSnapshot  frozen at review time
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} RuleViolation
 * @property {string} ruleId
 * @property {string} severity   INFO | WARNING | BLOCKING
 * @property {string} message    deterministic, human-readable
 * @property {number|null} limit
 * @property {number|null} actual
 */

/**
 * @typedef {Object} RiskAssessment  OUTPUT OF THE DETERMINISTIC RISK ENGINE.
 * AI must only *explain* these numbers, never compute or alter them.
 * @property {number} orderValue
 * @property {number} estimatedCharges
 * @property {number} availableFunds
 * @property {number} fundsAfterOrder
 * @property {number} portfolioValue
 * @property {number} currentPositionPct
 * @property {number} newPositionPct
 * @property {string|null} sector
 * @property {number} currentSectorPct
 * @property {number} newSectorPct
 * @property {number} potentialLossAt5Pct
 * @property {number} potentialLossAt10Pct
 * @property {number|null} volatility30d     annualised %, null if insufficient history
 * @property {number} riskScore              0-100
 * @property {string} riskLevel              LOW | MODERATE | HIGH | VERY_HIGH
 * @property {RuleViolation[]} violations
 * @property {boolean} canPlace              false if any BLOCKING violation
 * @property {string} engineVersion
 * @property {number} computedAt
 */

/**
 * @typedef {Object} Trade
 * @property {string} id
 * @property {string} orderId
 * @property {string} userId
 * @property {string} symbol
 * @property {string} side
 * @property {number} quantity
 * @property {number} price
 * @property {number} charges
 * @property {string} executedAt
 */

/** @param {Partial<OrderRequest>} r @returns {OrderRequest} */
export function createOrderRequest(r = {}) {
  return {
    symbol: String(r.symbol || '').toUpperCase(),
    side: r.side,
    orderType: r.orderType ?? 'MARKET',
    product: r.product ?? 'CNC',
    quantity: Math.floor(Number(r.quantity ?? 0)),
    limitPrice: r.limitPrice != null ? Number(r.limitPrice) : null,
    triggerPrice: r.triggerPrice != null ? Number(r.triggerPrice) : null,
    validity: r.validity ?? 'DAY',
  };
}
