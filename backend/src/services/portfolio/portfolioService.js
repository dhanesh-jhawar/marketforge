import { repos } from '../../repositories/index.js';
import { marketService } from '../market/marketService.js';
import { historicalService } from '../historical/historicalService.js';
import { valueHoldings, summarize, allocation, portfolioRisk } from '../../engines/portfolioEngine/index.js';
import { ApiError } from '../../utils/ApiError.js';

export const portfolioService = {
  async getValuedHoldings(userId) {
    const portfolio = await repos.portfolios.findOne({ userId });
    if (!portfolio) throw ApiError.notFound('Portfolio not found');

    const rawHoldings = await repos.holdings.findMany({ portfolioId: portfolio.id });
    if (!rawHoldings.length) return { portfolio, valued: [] };

    const quotes = new Map();
    const securities = new Map();

    await Promise.all(
      rawHoldings.map(async (h) => {
        const q = await marketService.getQuote(h.symbol).catch(() => ({ ltp: h.avgPrice, change: 0, changePct: 0 }));
        const sec = await repos.stocks.findById(h.symbol);
        quotes.set(h.symbol, q);
        securities.set(h.symbol, { sector: sec?.sector ?? 'Other', name: sec?.name ?? h.symbol });
      })
    );

    const valued = valueHoldings(rawHoldings, quotes, securities);
    return { portfolio, valued };
  },

  async getSummary(userId) {
    const funds = await repos.funds.findById(userId);
    if (!funds) throw ApiError.notFound('Funds record not found');
    const { valued } = await this.getValuedHoldings(userId);
    const summary = summarize(funds, valued);
    return {
      ...summary,
      cash: funds.availableCash,
      availableCash: funds.availableCash,
      portfolioValue: summary.totalValue,
      holdings: valued,
    };
  },

  async getHoldings(userId) {
    const { valued } = await this.getValuedHoldings(userId);
    return valued;
  },

  async getPositions(userId) {
    const portfolio = await repos.portfolios.findOne({ userId });
    if (!portfolio) return [];
    return repos.positions.findMany({ portfolioId: portfolio.id });
  },

  async getAllocation(userId) {
    const funds = await repos.funds.findById(userId);
    const { valued } = await this.getValuedHoldings(userId);
    return {
      bySymbol: allocation(valued, funds.availableCash, 'symbol'),
      bySector: allocation(valued, funds.availableCash, 'sector'),
    };
  },

  async getRiskMetrics(userId) {
    const funds = await repos.funds.findById(userId);
    const { valued } = await this.getValuedHoldings(userId);
    const totalValue = funds.availableCash + funds.blockedMargin + valued.reduce((a, b) => a + b.currentValue, 0);

    const histories = new Map();
    await Promise.all(
      valued.map(async (h) => {
        const c = await historicalService.getHistory(h.symbol, { interval: '1d', range: '3M' }).catch(() => []);
        histories.set(h.symbol, c);
      })
    );

    return portfolioRisk(valued, totalValue, histories);
  },

  async getPerformance(userId) {
    const portfolio = await repos.portfolios.findOne({ userId });
    if (!portfolio) return [];
    return repos.portfolioSnapshots.findMany({ portfolioId: portfolio.id }, { orderBy: 'snapshotDate', desc: false });
  },

  async getFunds(userId) {
    const funds = await repos.funds.findById(userId);
    if (!funds) throw ApiError.notFound('Funds not found');
    return funds;
  },

  async getTransactions(userId, limit = 50) {
    return repos.transactions.findMany({ userId }, { limit, orderBy: 'createdAt', desc: true });
  },
};
