/**
 * PORTFOLIO ENGINE — deterministic valuation, P&L, allocation, portfolio risk.
 */
import { ORDER_SIDE } from '@marketforge/shared/constants';
import { riskLevelFor, computeVolatility } from '../riskEngine/index.js';

const r2 = (n) => Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;
const pct = (a, b) => (b > 0 ? (a / b) * 100 : 0);

/**
 * Apply an executed trade to a holding (average-cost method).
 * @returns {{holding: {quantity:number, avgPrice:number}|null, realizedPnl:number}}
 */
export function applyTrade(holding, trade) {
  const qty = holding?.quantity ?? 0;
  const avg = holding?.avgPrice ?? 0;
  if (trade.side === ORDER_SIDE.BUY) {
    const newQty = qty + trade.quantity;
    return { holding: { quantity: newQty, avgPrice: r2((qty * avg + trade.quantity * trade.price) / newQty) }, realizedPnl: 0 };
  }
  const sellQty = Math.min(qty, trade.quantity);
  const realizedPnl = r2((trade.price - avg) * sellQty);
  const newQty = qty - sellQty;
  return { holding: newQty > 0 ? { quantity: newQty, avgPrice: avg } : null, realizedPnl };
}

/**
 * Enrich raw holdings with live prices.
 * @param {{symbol:string, quantity:number, avgPrice:number}[]} holdings
 * @param {Map<string, import('@marketforge/shared/types').Quote>} quotes
 * @param {Map<string, {sector:string|null, name:string}>} securities
 */
export function valueHoldings(holdings, quotes, securities, totalValueForWeights) {
  const rows = holdings.map((h) => {
    const q = quotes.get(h.symbol);
    const ltp = q?.ltp ?? h.avgPrice;
    const investedValue = r2(h.quantity * h.avgPrice);
    const currentValue = r2(h.quantity * ltp);
    const pnl = r2(currentValue - investedValue);
    return {
      symbol: h.symbol, name: securities.get(h.symbol)?.name ?? h.symbol, quantity: h.quantity, avgPrice: h.avgPrice,
      investedValue, ltp, currentValue, pnl, pnlPct: r2(pct(pnl, investedValue)),
      dayChange: r2((q?.change ?? 0) * h.quantity), dayChangePct: q?.changePct ?? 0,
      sector: securities.get(h.symbol)?.sector ?? null, weightPct: 0,
    };
  });
  const total = totalValueForWeights ?? rows.reduce((a, r) => a + r.currentValue, 0);
  for (const r of rows) r.weightPct = r2(pct(r.currentValue, total));
  return rows;
}

/** @returns {import('@marketforge/shared/types').PortfolioSummary} */
export function summarize(funds, valued) {
  const investedValue = r2(valued.reduce((a, h) => a + h.investedValue, 0));
  const currentValue = r2(valued.reduce((a, h) => a + h.currentValue, 0));
  const dayPnl = r2(valued.reduce((a, h) => a + h.dayChange, 0));
  const totalValue = r2(funds.availableCash + funds.blockedMargin + currentValue);
  const totalPnl = r2(totalValue - funds.totalCapital);
  return {
    totalValue, investedValue, currentValue, totalPnl, totalPnlPct: r2(pct(totalPnl, funds.totalCapital)),
    dayPnl, dayPnlPct: r2(pct(dayPnl, currentValue - dayPnl)),
    funds: { ...funds, investedValue }, holdingsCount: valued.length, timestamp: Date.now(),
  };
}

/** @param {'symbol'|'sector'} by */
export function allocation(valued, cash, by = 'symbol') {
  const buckets = new Map();
  for (const h of valued) {
    const key = by === 'sector' ? h.sector ?? 'Unclassified' : h.symbol;
    buckets.set(key, (buckets.get(key) ?? 0) + h.currentValue);
  }
  if (cash > 0) buckets.set('CASH', cash);
  const total = [...buckets.values()].reduce((a, b) => a + b, 0);
  return [...buckets.entries()].map(([key, value]) => ({ key, value: r2(value), pct: r2(pct(value, total)) })).sort((a, b) => b.value - a.value);
}

/**
 * Deterministic portfolio-level risk.
 * @param {ReturnType<typeof valueHoldings>} valued
 * @param {number} totalValue
 * @param {Map<string, {close:number}[]>} histories daily candles per symbol
 */
export function portfolioRisk(valued, totalValue, histories = new Map()) {
  const weights = valued.map((h) => (totalValue > 0 ? h.currentValue / totalValue : 0)).sort((a, b) => b - a);
  const sectorW = new Map();
  for (const h of valued) sectorW.set(h.sector ?? 'Unclassified', (sectorW.get(h.sector ?? 'Unclassified') ?? 0) + h.currentValue);
  const largestSectorPct = r2(pct(Math.max(0, ...sectorW.values()), totalValue));

  // Herfindahl index over equity weights -> diversification score.
  const eq = valued.reduce((a, h) => a + h.currentValue, 0);
  const hhi = eq > 0 ? valued.reduce((a, h) => a + (h.currentValue / eq) ** 2, 0) : 1;
  const diversificationScore = valued.length <= 1 ? 0 : Math.round((1 - hhi) / (1 - 1 / valued.length) * 100 * Math.min(1, valued.length / 10));

  // Weighted-average volatility (upper bound; ignores correlation — documented simplification).
  let wv = 0, wsum = 0;
  for (const h of valued) {
    const v = computeVolatility(histories.get(h.symbol));
    if (v != null) { wv += v * h.currentValue; wsum += h.currentValue; }
  }
  const portfolioVolatility30d = wsum > 0 ? r2(wv / wsum) : null;

  const concentrationTop1Pct = r2((weights[0] ?? 0) * 100);
  const riskScore = Math.round(
    0.35 * Math.min(100, concentrationTop1Pct * 2.5) +
    0.25 * Math.min(100, largestSectorPct * 1.5) +
    0.25 * (portfolioVolatility30d == null ? 50 : Math.min(100, portfolioVolatility30d * 1.5)) +
    0.15 * (100 - diversificationScore),
  );
  return {
    concentrationTop1Pct,
    concentrationTop5Pct: r2(weights.slice(0, 5).reduce((a, b) => a + b, 0) * 100),
    largestSectorPct, diversificationScore, portfolioVolatility30d,
    potentialLossAt5Pct: r2(eq * 0.05), potentialLossAt10Pct: r2(eq * 0.10),
    riskScore, riskLevel: riskLevelFor(riskScore),
  };
}
