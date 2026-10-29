export const demoIndices = [
  { symbol: 'NIFTY50', name: 'NIFTY 50', value: 24350.25, change: 142.10, changePct: 0.59, timestamp: Date.now() },
  { symbol: 'SENSEX', name: 'S&P BSE SENSEX', value: 80120.40, change: 410.85, changePct: 0.52, timestamp: Date.now() },
  { symbol: 'BANKNIFTY', name: 'NIFTY BANK', value: 52190.10, change: -85.30, changePct: -0.16, timestamp: Date.now() },
  { symbol: 'NIFTYIT', name: 'NIFTY IT', value: 41800.75, change: 520.40, changePct: 1.26, timestamp: Date.now() },
];

export const demoStocks = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Limited', ltp: 2980.50, change: 32.10, changePct: 1.09, volume: 4210000, sector: 'Oil Gas & Consumable Fuels' },
  { symbol: 'TCS', name: 'Tata Consultancy Services Limited', ltp: 4120.00, change: 54.00, changePct: 1.33, volume: 1850000, sector: 'Information Technology' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', ltp: 1650.25, change: -8.40, changePct: -0.51, volume: 9400000, sector: 'Financial Services' },
  { symbol: 'INFY', name: 'Infosys Limited', ltp: 1845.80, change: 28.50, changePct: 1.57, volume: 6200000, sector: 'Information Technology' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', ltp: 1220.10, change: 11.20, changePct: 0.93, volume: 5100000, sector: 'Financial Services' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Limited', ltp: 985.40, change: 18.20, changePct: 1.88, volume: 8300000, sector: 'Automobile and Auto Components' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', ltp: 1620.00, change: 4.50, changePct: 0.28, volume: 3200000, sector: 'Telecommunication' },
  { symbol: 'ITC', name: 'ITC Limited', ltp: 490.15, change: -1.25, changePct: -0.25, volume: 7800000, sector: 'Fast Moving Consumer Goods' },
];

export const demoPortfolio = {
  totalValue: 1045230.50,
  investedValue: 620000.00,
  currentValue: 665230.50,
  totalPnl: 45230.50,
  totalPnlPct: 4.52,
  dayPnl: 6420.00,
  dayPnlPct: 0.62,
  funds: {
    totalCapital: 1000000,
    availableCash: 380000.00,
    blockedMargin: 0,
    investedValue: 620000.00,
    currency: 'INR',
  },
  holdingsCount: 4,
};

export const demoHoldings = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', quantity: 50, avgPrice: 2850.00, ltp: 2980.50, currentValue: 149025.00, investedValue: 142500.00, pnl: 6525.00, pnlPct: 4.58, dayChange: 1605.00, dayChangePct: 1.09, sector: 'Oil Gas & Consumable Fuels', weightPct: 22.4 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', quantity: 30, avgPrice: 3950.00, ltp: 4120.00, currentValue: 123600.00, investedValue: 118500.00, pnl: 5100.00, pnlPct: 4.30, dayChange: 1620.00, dayChangePct: 1.33, sector: 'Information Technology', weightPct: 18.6 },
  { symbol: 'INFY', name: 'Infosys Limited', quantity: 80, avgPrice: 1720.00, ltp: 1845.80, currentValue: 147664.00, investedValue: 137600.00, pnl: 10064.00, pnlPct: 7.31, dayChange: 2280.00, dayChangePct: 1.57, sector: 'Information Technology', weightPct: 22.2 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', quantity: 200, avgPrice: 1107.00, ltp: 1220.10, currentValue: 244020.00, investedValue: 221400.00, pnl: 22620.00, pnlPct: 10.22, dayChange: 2240.00, dayChangePct: 0.93, sector: 'Financial Services', weightPct: 36.7 },
];

export const demoNews = [
  {
    id: 'news-1',
    title: 'RBI maintains status quo on repo rate at 6.5%; policy stance remains focused on withdrawal of accommodation',
    summary: 'The Monetary Policy Committee decided unanimously to keep the policy rate unchanged as inflation moderates towards the 4% target.',
    sourceName: 'Economic Times',
    publishedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    symbols: ['BANKNIFTY', 'HDFCBANK', 'ICICIBANK'],
    sentiment: 'NEUTRAL',
  },
  {
    id: 'news-2',
    title: 'IT majors surge as global cloud spending indicators show acceleration in Q3 pipeline',
    summary: 'Strong signals from US enterprise earnings spark fresh buying in top Indian IT exporters.',
    sourceName: 'LiveMint',
    publishedAt: new Date(Date.now() - 75 * 60000).toISOString(),
    symbols: ['TCS', 'INFY', 'HCLTECH'],
    sentiment: 'POSITIVE',
  },
];
