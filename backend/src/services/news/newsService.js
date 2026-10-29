import { repos } from '../../repositories/index.js';
import { getProviders } from '../../providers/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { TTLCache } from '../../utils/index.js';

const newsCache = new TTLCache(60000); // 1 min

export const newsService = {
  async getLatest({ limit = 20, symbols, query } = {}) {
    const key = `latest:${limit}:${(symbols || []).join(',')}:${query || ''}`;
    const cached = newsCache.get(key);
    if (cached) return cached;

    const providers = getProviders();
    const articles = await providers.news.getLatest({ limit, symbols, query });

    // Store in DB for search / offline reading
    for (const a of articles) {
      await repos.news.upsert(a);
      if (a.symbols?.length) {
        for (const s of a.symbols) {
          await repos.newsStocks.upsert({ newsId: a.id, symbol: s, relevance: 1 });
        }
      }
    }

    newsCache.set(key, articles);
    return articles;
  },

  async getById(id) {
    const article = await repos.news.findById(id);
    if (!article) throw ApiError.notFound('News article not found');
    return article;
  },

  async getForHoldings(userId) {
    const portfolio = await repos.portfolios.findOne({ userId });
    if (!portfolio) return [];
    const holdings = await repos.holdings.findMany({ portfolioId: portfolio.id });
    const symbols = holdings.map((h) => h.symbol);
    if (!symbols.length) return this.getLatest({ limit: 10 });
    return this.getLatest({ symbols, limit: 20 });
  },

  async getForWatchlist(userId) {
    const watchlist = await repos.watchlists.findOne({ userId, isDefault: true });
    const symbols = watchlist?.symbols || [];
    if (!symbols.length) return this.getLatest({ limit: 10 });
    return this.getLatest({ symbols, limit: 20 });
  },

  async search(query, limit = 20) {
    if (!query) return [];
    return this.getLatest({ query, limit });
  },
};
