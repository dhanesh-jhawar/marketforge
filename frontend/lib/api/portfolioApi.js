import { apiClient } from './client.js';

export const portfolioApi = {
  getSummary: () => apiClient('/portfolio'),
  getHoldings: () => apiClient('/portfolio/holdings'),
  getPositions: () => apiClient('/portfolio/positions'),
  getAllocation: () => apiClient('/portfolio/allocation'),
  getRiskMetrics: () => apiClient('/portfolio/risk'),
  getPerformance: (range = '1M') => apiClient(`/portfolio/performance?range=${range}`),
  getFunds: () => apiClient('/funds'),
};
