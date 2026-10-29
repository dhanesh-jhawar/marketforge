import { apiClient } from './client.js';

export const stockApi = {
  getSecurity: (symbol) => apiClient(`/stocks/${symbol}`),
  getQuote: (symbol) => apiClient(`/stocks/${symbol}/quote`),
  getHistory: (symbol, interval = '1d', range = '1Y') =>
    apiClient(`/stocks/${symbol}/history?interval=${interval}&range=${range}`),
  getNews: (symbol, limit = 5) => apiClient(`/stocks/${symbol}/news?limit=${limit}`),
};
