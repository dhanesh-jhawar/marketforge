import { apiClient } from './client.js';

export const marketApi = {
  getUniverse: () => apiClient('/markets'),
  getIndices: () => apiClient('/markets/indices'),
  getMovers: (limit = 10) => apiClient(`/markets/movers?limit=${limit}`),
  getStatus: () => apiClient('/markets/status'),
  search: (query, limit = 20) => apiClient(`/markets/search?q=${encodeURIComponent(query)}&limit=${limit}`),
  getHeatmap: () => apiClient('/markets/heatmap'),
};
