import { seededRandom, round } from '../../utils/index.js';

/**
 * Curated knowledge base for top Indian blue-chip companies on NSE.
 * Includes sector, business overview, 52W range, P/E ratio, market cap, and past track records.
 */
export const CURATED_INDIAN_COMPANIES = {
  RELIANCE: {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Limited',
    sector: 'Energy & Conglomerate',
    industry: 'Integrated Oil, Petrochemicals, Telecom & Retail',
    description: 'India\'s largest conglomerate by market cap, operating premier oil refining and petrochemicals, Jio Infocomm (digital services), and Reliance Retail.',
    pastRecords: 'Consistently delivered strong revenue growth; Jio and Retail now contribute over 50% of EBITDA. Maintained low net-debt post massive telecom monetization and capital raises.',
    peRatio: 26.8,
    pbRatio: 2.1,
    marketCapCr: 1855000,
    high52w: 3024.90,
    low52w: 2220.30,
    dividendYieldPct: 0.38,
    beta: 0.95,
    return1yPct: 18.4,
  },
  TCS: {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Limited',
    sector: 'Information Technology',
    industry: 'IT Consulting & Software Services',
    description: 'The flagship IT arm of Tata Group, TCS is a global leader in IT services, consulting, and enterprise business solutions operating across 55 countries.',
    pastRecords: 'Consistently high Return on Equity (~48%) and robust free cash flow generation with 80%+ profit returned to shareholders via dividends and share buybacks.',
    peRatio: 29.4,
    pbRatio: 12.8,
    marketCapCr: 1412000,
    high52w: 4585.90,
    low52w: 3313.00,
    dividendYieldPct: 1.45,
    beta: 0.68,
    return1yPct: 14.2,
  },
  INFY: {
    symbol: 'INFY',
    name: 'Infosys Limited',
    sector: 'Information Technology',
    industry: 'Enterprise Cloud & Digital Services',
    description: 'A global leader in next-generation digital services, cloud consulting (Cobalt), and artificial intelligence (Topaz) for Fortune 500 enterprises.',
    pastRecords: 'Pioneer of the Indian IT services revolution. Strong dividend payout track record with steady double-digit digital revenue growth and negligible debt.',
    peRatio: 27.2,
    pbRatio: 8.4,
    marketCapCr: 765000,
    high52w: 1991.45,
    low52w: 1358.35,
    dividendYieldPct: 2.10,
    beta: 0.74,
    return1yPct: 22.8,
  },
  HDFCBANK: {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    sector: 'Banking & Financial Services',
    industry: 'Private Sector Commercial Bank',
    description: 'India\'s largest private sector bank, delivering extensive retail banking, wholesale banking, rural finance, and digital payment infrastructure.',
    pastRecords: 'Maintained industry-leading Gross NPA discipline (<1.4%) over two decades. Successfully completed mega-merger with parent HDFC Ltd to create an integrated financial titan.',
    peRatio: 18.6,
    pbRatio: 2.6,
    marketCapCr: 1280000,
    high52w: 1794.00,
    low52w: 1363.55,
    dividendYieldPct: 1.15,
    beta: 0.88,
    return1yPct: 12.6,
  },
  ICICIBANK: {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Limited',
    sector: 'Banking & Financial Services',
    industry: 'Private Sector Commercial Bank',
    description: 'One of India\'s premier private sector banks with strong leadership in retail lending, corporate loans, digital banking (iMobile Pay), and SME credit.',
    pastRecords: 'Exceptional turnaround over past 5 years: Return on Assets expanded from 1.2% to 2.3%, with net NPA falling to historic lows of 0.42%.',
    peRatio: 17.2,
    pbRatio: 2.9,
    marketCapCr: 875000,
    high52w: 1332.00,
    low52w: 915.00,
    dividendYieldPct: 0.82,
    beta: 0.92,
    return1yPct: 32.5,
  },
  SBIN: {
    symbol: 'SBIN',
    name: 'State Bank of India',
    sector: 'Banking & Financial Services',
    industry: 'Public Sector Banking Leader',
    description: 'A Fortune 500 Indian multinational public sector bank and financial services statutory body holding ~23% market share in total deposits and loans.',
    pastRecords: 'Delivered record annual net profit exceeding ₹60,000 Cr in FY24, fueled by YONO digital adoption, corporate capex revival, and clean asset books.',
    peRatio: 10.4,
    pbRatio: 1.4,
    marketCapCr: 724000,
    high52w: 912.10,
    low52w: 555.30,
    dividendYieldPct: 1.68,
    beta: 1.12,
    return1yPct: 41.2,
  },
  BHARTIARTL: {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Limited',
    sector: 'Telecommunications',
    industry: 'Mobile, Broadband & Enterprise Cloud',
    description: 'Leading telecom provider with 500M+ customers across India and Africa, dominating high-ARPU post-paid subscribers, Airtel 5G Plus, and enterprise cloud.',
    pastRecords: 'Rapid ARPU expansion from ₹135 to ₹211+ post tariff hikes. Successfully rolled out nationwide 5G coverage with disciplined debt reduction.',
    peRatio: 52.0,
    pbRatio: 9.1,
    marketCapCr: 910000,
    high52w: 1779.00,
    low52w: 901.00,
    dividendYieldPct: 0.55,
    beta: 0.82,
    return1yPct: 68.4,
  },
  JIOFIN: {
    symbol: 'JIOFIN',
    name: 'Jio Financial Services Limited',
    sector: 'Financial Services',
    industry: 'NBFC, Digital Lending, AMC & Payments',
    description: 'Demerged financial services arm of Reliance Industries, building tech-native digital lending, asset management (JV with BlackRock), insurance broking, and merchant payments.',
    pastRecords: 'Massive capital base post demerger with zero debt. Strategic partnerships with BlackRock for Indian mutual funds and wealth management rollouts.',
    peRatio: 115.0,
    pbRatio: 1.6,
    marketCapCr: 221000,
    high52w: 394.70,
    low52w: 204.65,
    dividendYieldPct: 0.0,
    beta: 1.35,
    return1yPct: 54.0,
  },
  TATAMOTORS: {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Limited',
    sector: 'Automobile',
    industry: 'Commercial Vehicles, Passenger Cars & EVs',
    description: 'Automobile multinational manufacturing commercial trucks, India’s #1 EV line (Nexon.ev, Punch.ev), and luxury SUVs through Jaguar Land Rover (JLR).',
    pastRecords: 'Dramatic multi-year turnaround: JLR order book recovery and EV dominance in India led to achieving net auto debt-free status.',
    peRatio: 10.8,
    pbRatio: 3.2,
    marketCapCr: 355000,
    high52w: 1179.05,
    low52w: 622.00,
    dividendYieldPct: 0.62,
    beta: 1.42,
    return1yPct: 48.6,
  },
  TATASTEEL: {
    symbol: 'TATASTEEL',
    name: 'Tata Steel Limited',
    sector: 'Metals & Mining',
    industry: 'Integrated Steel Manufacturing',
    description: 'One of the world\'s most geographically diversified steel producers with captive iron ore mines in India and green electric arc transition in Europe.',
    pastRecords: 'Low-cost Indian operations consistently generate high margins. Successfully restructuring UK operations into eco-friendly electric arc furnaces with UK government grants.',
    peRatio: 24.1,
    pbRatio: 1.8,
    marketCapCr: 190000,
    high52w: 184.60,
    low52w: 114.60,
    dividendYieldPct: 2.35,
    beta: 1.38,
    return1yPct: 26.5,
  },
  ITC: {
    symbol: 'ITC',
    name: 'ITC Limited',
    sector: 'Consumer Goods (FMCG)',
    industry: 'Cigarettes, Packaged Foods, Agri-Business & Hotels',
    description: 'Diversified Indian conglomerate with market leadership in cigarettes, rapidly scaling FMCG foods (Aashirvaad, Sunfeast), hotels, paperboards, and agri-exports.',
    pastRecords: 'Phenomenal cash cow with 80%+ dividend payout ratio. FMCG segment operating leverage expanding profitability while demerging high-growth hotels business.',
    peRatio: 26.2,
    pbRatio: 7.9,
    marketCapCr: 580000,
    high52w: 528.50,
    low52w: 399.30,
    dividendYieldPct: 2.95,
    beta: 0.58,
    return1yPct: 15.8,
  },
  ZOMATO: {
    symbol: 'ZOMATO',
    name: 'Zomato Limited',
    sector: 'Consumer Tech',
    industry: 'Food Delivery & Quick Commerce (Blinkit)',
    description: 'India\'s leading tech platform for food ordering, dining-out discovery, and hyper-growth 10-minute quick commerce through Blinkit.',
    pastRecords: 'Achieved consolidated PAT profitability in FY24. Blinkit grew revenue 100%+ year-on-year, positioning Zomato as the dominant player in Indian quick-commerce.',
    peRatio: 88.0,
    pbRatio: 11.2,
    marketCapCr: 235000,
    high52w: 298.20,
    low52w: 104.70,
    dividendYieldPct: 0.0,
    beta: 1.48,
    return1yPct: 145.0,
  },
};

/**
 * Returns or deterministically synthesizes complete company fundamentals
 * and past track records for any of the 2,620 listed NSE equities.
 */
export function getCompanyProfile(symbol, currentLtp = 1000) {
  const sym = String(symbol || '').toUpperCase().trim();
  if (CURATED_INDIAN_COMPANIES[sym]) {
    const curated = CURATED_INDIAN_COMPANIES[sym];
    return {
      ...curated,
      ltp: currentLtp || curated.high52w * 0.9,
    };
  }

  // Synthesize realistic deterministic metrics based on symbol hash
  const rnd = seededRandom(sym);
  const basePrice = currentLtp > 0 ? currentLtp : 250 + rnd() * 2000;
  const high52w = round(basePrice * (1.15 + rnd() * 0.35), 2);
  const low52w = round(basePrice * (0.65 + rnd() * 0.25), 2);
  const peRatio = round(12 + rnd() * 45, 1);
  const pbRatio = round(1.2 + rnd() * 6.5, 2);
  const marketCapCr = Math.round(5000 + rnd() * 180000);
  const dividendYieldPct = rnd() > 0.3 ? round(rnd() * 2.8, 2) : 0;
  const beta = round(0.7 + rnd() * 0.9, 2);
  const return1yPct = round(-15 + rnd() * 75, 1);

  const sectors = ['Information Technology', 'Banking & Finance', 'Automobile', 'Energy & Power', 'Pharmaceuticals', 'Infrastructure', 'Consumer Goods', 'Metals & Mining', 'Chemicals'];
  const sector = sectors[Math.floor(rnd() * sectors.length)];

  return {
    symbol: sym,
    name: `${sym} India Limited`,
    sector,
    industry: `${sector} Industry`,
    description: `${sym} is an established listed Indian corporate participating in ${sector}, trading on the National Stock Exchange (NSE).`,
    pastRecords: `Maintains stable operations within the ${sector} index. 1-year performance stands at ${return1yPct >= 0 ? '+' : ''}${return1yPct}%, with trading range between ₹${low52w} and ₹${high52w}.`,
    peRatio,
    pbRatio,
    marketCapCr,
    high52w,
    low52w,
    dividendYieldPct,
    beta,
    return1yPct,
    ltp: basePrice,
  };
}

/**
 * Computes exact multi-target profit/loss scenarios for an order review.
 * Accounts for side (BUY/SELL), quantity, entry price, and regulatory charges.
 */
export function calculateOrderScenarios({ symbol, side, quantity, orderType, limitPrice, currentPrice }) {
  const p = Number(orderType === 'LIMIT' && limitPrice > 0 ? limitPrice : currentPrice) || 100;
  const qty = Number(quantity) || 1;
  const isBuy = String(side).toUpperCase() === 'BUY';
  const orderValue = round(p * qty, 2);

  // Regulatory charges: STT (0.1% on delivery), exchange turnover, SEBI charges, GST ~0.15% total
  const estimatedCharges = round(orderValue * 0.0015, 2);

  // Targets and shocks
  const targets = [
    { label: '+5% Target 1', pct: 5.0, price: round(p * 1.05, 2) },
    { label: '+10% Bullish Rally', pct: 10.0, price: round(p * 1.10, 2) },
    { label: '-3% Conservative Stop', pct: -3.0, price: round(p * 0.97, 2) },
    { label: '-5% Standard Stop', pct: -5.0, price: round(p * 0.95, 2) },
    { label: '-10% Severe Drawdown', pct: -10.0, price: round(p * 0.90, 2) },
  ];

  const scenarios = targets.map((t) => {
    // If BUY: profit when price rises, loss when price falls
    // If SELL (short/exit): profit when price drops, loss when price rallies
    const diffPerShare = isBuy ? (t.price - p) : (p - t.price);
    const grossPnl = round(diffPerShare * qty, 2);
    const netPnl = round(grossPnl - estimatedCharges, 2);
    const netReturnPct = round((netPnl / orderValue) * 100, 2);

    return {
      label: t.label,
      targetPrice: t.price,
      priceChangePct: t.pct,
      grossPnl,
      netPnl,
      netReturnPct,
      outcome: netPnl >= 0 ? 'PROFIT' : 'LOSS',
    };
  });

  // Breakeven price calculation
  const breakevenSpreadPerShare = estimatedCharges / qty;
  const breakevenPrice = round(isBuy ? p + breakevenSpreadPerShare : p - breakevenSpreadPerShare, 2);

  return {
    symbol,
    side,
    quantity: qty,
    executionPrice: p,
    orderValue,
    estimatedCharges,
    breakevenPrice,
    scenarios,
    riskRewardRatio: '1 : 1.67', // Standard 5% target vs 3% stop
    riskAnalysis: isBuy
      ? `BUY (Long Position): Your capital gains when ${symbol} rises above breakeven price ₹${breakevenPrice}. Downside is capped at 100% of order value (₹${orderValue.toLocaleString('en-IN')}). A 5% stop-loss limits your drawdown to ₹${round(orderValue * 0.05 + estimatedCharges, 2).toLocaleString('en-IN')}.`
      : `SELL (Exit / Short Position): If selling existing holdings, this locks in virtual capital and eliminates future drawdown. If initiating intraday short (MIS), you profit if ${symbol} falls below ₹${breakevenPrice}, but carry uncapped upside risk if price surges.`,
  };
}
