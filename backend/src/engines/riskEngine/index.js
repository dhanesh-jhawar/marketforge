/**
 * ============================================================
 * RISK ENGINE — deterministic, pure, side-effect free.
 * ------------------------------------------------------------
 * This is the ONLY place financial risk numbers are computed.
 * The AI layer receives this output verbatim and may only
 * explain it. Do not import any AI/provider code here.
 * ============================================================
 */
import {
  DEFAULT_RISK_RULES, RISK_LEVEL, RULE_SEVERITY, ORDER_SIDE, PRODUCT_TYPE,
  VOLATILITY_WINDOW_DAYS, TRADING_DAYS_PER_YEAR, API_ERROR_CODES,
} from '@marketforge/shared/constants';

export const RISK_ENGINE_VERSION = '1.0.0';

const r2 = (n) => Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;
const pct = (part, whole) => (whole > 0 ? (part / whole) * 100 : 0);
const clamp01 = (x) => Math.max(0, Math.min(1, x));

/**
 * Annualised volatility (%) from daily candles using sample stdev of log returns
 * over the last `window` returns. Returns null if insufficient data.
 * @param {{close:number}[]} candles ascending by time
 */
export function computeVolatility(candles, window = VOLATILITY_WINDOW_DAYS) {
  const closes = (candles ?? []).map((c) => c.close).filter((c) => c > 0).slice(-(window + 1));
  if (closes.length < Math.min(window, 10) + 1) return null;
  const rets = [];
  for (let i = 1; i < closes.length; i++) rets.push(Math.log(closes[i] / closes[i - 1]));
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / (rets.length - 1);
  return r2(Math.sqrt(variance) * Math.sqrt(TRADING_DAYS_PER_YEAR) * 100);
}

/** Simulated charges (flat brokerage + approximate statutory charges). */
export function estimateCharges(orderValue, { brokerageFlat = 20 } = {}) {
  // Simplified STT/exchange/GST/stamp approximation for education — not tax advice.
  const statutory = orderValue * 0.0012;
  return r2(Math.min(brokerageFlat, orderValue * 0.0003 || brokerageFlat) + statutory);
}

/** Normalize rule rows ({id,value,severity,isEnabled}) into a lookup. */
export function normalizeRules(ruleRows = []) {
  const rules = {};
  for (const [id, value] of Object.entries(DEFAULT_RISK_RULES)) rules[id] = { id, value, severity: RULE_SEVERITY.WARNING, isEnabled: true };
  for (const r of ruleRows) {
    const value = typeof r.value === 'string' ? JSON.parse(r.value) : r.value;
    rules[r.id] = { id: r.id, value, severity: r.severity ?? RULE_SEVERITY.WARNING, isEnabled: r.isEnabled !== false };
  }
  return rules;
}

export function riskLevelFor(score) {
  if (score < 25) return RISK_LEVEL.LOW;
  if (score < 50) return RISK_LEVEL.MODERATE;
  if (score < 75) return RISK_LEVEL.HIGH;
  return RISK_LEVEL.VERY_HIGH;
}

/**
 * Assess a proposed order.
 *
 * @param {object} input
 * @param {import('@marketforge/shared/types').OrderRequest} input.order
 * @param {number} input.price                    execution price estimate (LTP or limit)
 * @param {{symbol:string, sector:string|null}} input.security
 * @param {{symbol:string, quantity:number, ltp:number, sector:string|null}[]} input.holdings
 * @param {{availableCash:number, blockedMargin:number}} input.funds
 * @param {object[]} [input.rules]                 market_rules rows
 * @param {{close:number}[]} [input.history]       daily candles for volatility
 * @param {number} [input.ordersToday]
 * @param {{brokerageFlat?:number}} [input.chargesConfig]
 * @returns {import('@marketforge/shared/types').RiskAssessment}
 */
export function assessOrderRisk({ order, price, security, holdings = [], funds, rules = [], history = [], ordersToday = 0, chargesConfig = {} }) {
  const R = normalizeRules(rules);
  const isBuy = order.side === ORDER_SIDE.BUY;
  const qty = Number(order.quantity) || 0;

  const orderValue = r2(qty * price);
  const estimatedCharges = estimateCharges(orderValue, chargesConfig);
  const availableFunds = r2(funds.availableCash);
  const fundsAfterOrder = r2(isBuy ? availableFunds - orderValue - estimatedCharges : availableFunds + orderValue - estimatedCharges);

  const holdingsValue = holdings.reduce((a, h) => a + h.quantity * (h.symbol === security.symbol ? price : h.ltp), 0);
  const portfolioValue = r2(availableFunds + (funds.blockedMargin ?? 0) + holdingsValue);

  const held = holdings.find((h) => h.symbol === security.symbol);
  const heldQty = held?.quantity ?? 0;
  const currentPositionValue = heldQty * price;
  const newQty = isBuy ? heldQty + qty : Math.max(0, heldQty - qty);
  const newPositionValue = newQty * price;

  const sector = security.sector ?? null;
  const sectorValue = sector ? holdings.filter((h) => h.sector === sector).reduce((a, h) => a + h.quantity * (h.symbol === security.symbol ? price : h.ltp), 0) : currentPositionValue;
  const newSectorValue = sectorValue - currentPositionValue + newPositionValue;

  const currentPositionPct = r2(pct(currentPositionValue, portfolioValue));
  const newPositionPct = r2(pct(newPositionValue, portfolioValue));
  const currentSectorPct = r2(pct(sectorValue, portfolioValue));
  const newSectorPct = r2(pct(newSectorValue, portfolioValue));
  const orderValuePct = r2(pct(orderValue, portfolioValue));

  const potentialLossAt5Pct = r2(newPositionValue * 0.05);
  const potentialLossAt10Pct = r2(newPositionValue * 0.10);
  const volatility30d = computeVolatility(history);

  // ---- rule evaluation ----
  const violations = [];
  const add = (ruleId, severity, message, limit = null, actual = null) => violations.push({ ruleId, severity, message, limit, actual });
  const rule = (id) => (R[id]?.isEnabled ? R[id] : null);

  if (qty <= 0) add('quantity', RULE_SEVERITY.BLOCKING, 'Quantity must be at least 1.', 1, qty);
  if (isBuy && orderValue + estimatedCharges > availableFunds) {
    add(API_ERROR_CODES.INSUFFICIENT_FUNDS, RULE_SEVERITY.BLOCKING, `Order needs ₹${r2(orderValue + estimatedCharges)} but only ₹${availableFunds} is available.`, availableFunds, r2(orderValue + estimatedCharges));
  }
  if (!isBuy && order.product === PRODUCT_TYPE.CNC && qty > heldQty && !(rule('allowShortSelling')?.value)) {
    add('allowShortSelling', RULE_SEVERITY.BLOCKING, `You hold ${heldQty} shares; cannot sell ${qty} (short selling disabled).`, heldQty, qty);
  }
  if (order.product === PRODUCT_TYPE.MIS && rule('allowIntraday') && !rule('allowIntraday').value) {
    add('allowIntraday', RULE_SEVERITY.BLOCKING, 'Intraday (MIS) orders are disabled.', null, null);
  }
  const check = (id, actual, message) => {
    const r = rule(id);
    if (r && actual > Number(r.value)) add(id, r.severity, message(Number(r.value)), Number(r.value), actual);
  };
  if (isBuy) {
    check('maxPositionPct', newPositionPct, (l) => `Position would be ${newPositionPct}% of portfolio (limit ${l}%).`);
    if (sector) check('maxSectorPct', newSectorPct, (l) => `${sector} exposure would be ${newSectorPct}% (limit ${l}%).`);
    check('maxOrderValuePct', orderValuePct, (l) => `Order is ${orderValuePct}% of portfolio value (limit ${l}%).`);
    const buffer = rule('minCashBufferPct');
    const cashAfterPct = r2(pct(fundsAfterOrder, portfolioValue));
    if (buffer && Number(buffer.value) > 0 && cashAfterPct < Number(buffer.value)) add('minCashBufferPct', buffer.severity, `Cash would fall to ${cashAfterPct}% (minimum ${buffer.value}%).`, Number(buffer.value), cashAfterPct);
  }
  check('maxDailyOrders', ordersToday + 1, (l) => `Daily order limit of ${l} reached.`);
  const volRule = rule('highVolatilityThresholdPct');
  if (volRule && volatility30d != null && volatility30d > Number(volRule.value)) {
    add('highVolatilityThresholdPct', RULE_SEVERITY.WARNING, `30-day volatility is ${volatility30d}% (high-volatility threshold ${volRule.value}%).`, Number(volRule.value), volatility30d);
  }

  // ---- composite risk score (0-100) ----
  const lim = (id, d) => Number(R[id]?.value ?? d);
  const posComp = clamp01(newPositionPct / lim('maxPositionPct', 20));
  const secComp = clamp01(newSectorPct / lim('maxSectorPct', 40));
  const volComp = volatility30d == null ? 0.5 : clamp01(volatility30d / (lim('highVolatilityThresholdPct', 45) * 1.5));
  const ordComp = clamp01(orderValuePct / lim('maxOrderValuePct', 25));
  const riskScore = Math.round(100 * (0.4 * posComp + 0.25 * secComp + 0.25 * volComp + 0.1 * ordComp));

  return {
    orderValue, estimatedCharges, availableFunds, fundsAfterOrder, portfolioValue,
    currentPositionPct, newPositionPct, sector, currentSectorPct, newSectorPct,
    potentialLossAt5Pct, potentialLossAt10Pct, volatility30d,
    riskScore, riskLevel: riskLevelFor(riskScore),
    violations, canPlace: !violations.some((v) => v.severity === RULE_SEVERITY.BLOCKING),
    engineVersion: RISK_ENGINE_VERSION, computedAt: Date.now(),
  };
}
