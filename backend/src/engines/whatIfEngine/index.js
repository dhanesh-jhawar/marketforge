/**
 * WHAT-IF ENGINE — deterministic historical simulations.
 * Inputs are daily candles (ascending). Outputs are reproducible numbers.
 */
const r2 = (n) => Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;

export function maxDrawdownPct(values) {
  let peak = -Infinity, mdd = 0;
  for (const v of values) { peak = Math.max(peak, v); mdd = Math.min(mdd, (v - peak) / peak); }
  return r2(mdd * 100);
}

const years = (a, b) => (b - a) / (365.25 * 864e5);
const cagr = (start, end, yrs) => (start > 0 && yrs > 0 ? r2(((end / start) ** (1 / yrs) - 1) * 100) : null);

/** Invest `amount` on the first candle, hold to the last. */
export function runLumpSum(candles, amount) {
  if (!candles?.length) return null;
  const entry = candles[0].close;
  const units = amount / entry;
  const curve = candles.map((c) => ({ time: c.time, value: r2(units * c.close) }));
  const finalValue = curve.at(-1).value;
  return {
    strategy: 'LUMP_SUM', invested: r2(amount), units: r2(units), entryPrice: entry, exitPrice: candles.at(-1).close,
    finalValue, absoluteReturn: r2(finalValue - amount), returnPct: r2(((finalValue - amount) / amount) * 100),
    cagrPct: cagr(amount, finalValue, years(candles[0].time, candles.at(-1).time)),
    maxDrawdownPct: maxDrawdownPct(curve.map((p) => p.value)), equityCurve: curve,
  };
}

/** Invest `monthly` on the first trading day of each month. */
export function runSip(candles, monthly) {
  if (!candles?.length) return null;
  let units = 0, invested = 0, lastMonth = null;
  const curve = [];
  for (const c of candles) {
    const m = new Date(c.time).toISOString().slice(0, 7);
    if (m !== lastMonth) { units += monthly / c.close; invested += monthly; lastMonth = m; }
    curve.push({ time: c.time, value: r2(units * c.close), invested: r2(invested) });
  }
  const finalValue = curve.at(-1).value;
  return {
    strategy: 'SIP', invested: r2(invested), units: r2(units), installments: Math.round(invested / monthly),
    finalValue, absoluteReturn: r2(finalValue - invested), returnPct: r2(((finalValue - invested) / invested) * 100),
    maxDrawdownPct: maxDrawdownPct(curve.map((p) => p.value)), equityCurve: curve,
  };
}

/** Run a scenario and (optionally) a benchmark comparison. */
export function runScenario({ candles, benchmarkCandles, amount, sipMonthly }) {
  const primary = sipMonthly ? runSip(candles, sipMonthly) : runLumpSum(candles, amount);
  const benchmark = benchmarkCandles?.length ? (sipMonthly ? runSip(benchmarkCandles, sipMonthly) : runLumpSum(benchmarkCandles, amount)) : null;
  return {
    primary, benchmark,
    outperformancePct: primary && benchmark ? r2(primary.returnPct - benchmark.returnPct) : null,
    lumpSumComparison: sipMonthly ? runLumpSum(candles, primary.invested) : null,
  };
}
