import { apiClient } from './client.js';

export const watchlistApi = {
  getWatchlist: () => apiClient('/watchlist'),
  add: (symbol) => apiClient('/watchlist', { method: 'POST', body: { symbol } }),
  remove: (symbol) => apiClient(`/watchlist/${symbol}`, { method: 'DELETE' }),
};
