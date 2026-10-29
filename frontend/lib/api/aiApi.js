import { apiClient } from './client.js';

export const aiApi = {
  chat: (message, context = {}) => apiClient('/ai/chat', { method: 'POST', body: { message, context } }),
  explainOrder: (order, riskSnapshot) =>
    apiClient('/ai/order-explanation', { method: 'POST', body: { order, riskSnapshot } }),
  explainStock: (symbol) => apiClient('/ai/stock-explanation', { method: 'POST', body: { symbol } }),
  explainNews: (newsData) => apiClient('/ai/news-explanation', { method: 'POST', body: newsData }),
  explainPortfolio: () => apiClient('/ai/portfolio-explanation', { method: 'POST' }),
};
