import { apiClient } from './client.js';

export const newsApi = {
  getLatest: ({ limit = 20, symbols, sector, query } = {}) => {
    const params = new URLSearchParams();
    if (limit) params.set('limit', String(limit));
    if (symbols) params.set('symbols', Array.isArray(symbols) ? symbols.join(',') : symbols);
    if (sector) params.set('sector', sector);
    if (query) params.set('q', query);
    return apiClient(`/news?${params.toString()}`);
  },
  getHoldingsNews: () => apiClient('/news/holdings'),
  getWatchlistNews: () => apiClient('/news/watchlist'),
  explainNews: (newsData) => apiClient('/ai/news-explanation', { method: 'POST', body: newsData }),
};
