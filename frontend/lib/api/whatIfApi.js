import { apiClient } from './client.js';

export const whatIfApi = {
  getScenarios: () => apiClient('/what-if/scenarios'),
  getScenario: (id) => apiClient(`/what-if/scenarios/${id}`),
  runScenario: (id, { symbol, amount, timeframe }) =>
    apiClient(`/what-if/scenarios/${id}/run`, { method: 'POST', body: { symbol, amount, timeframe } }),
};

export const challengeApi = {
  getAll: () => apiClient('/challenges'),
  getById: (id) => apiClient(`/challenges/${id}`),
  start: (id) => apiClient(`/challenges/${id}/start`, { method: 'POST' }),
  claim: (id) => apiClient(`/challenges/${id}/claim`, { method: 'POST' }),
};

export const studyPlanApi = {
  getPlan: () => apiClient('/study-plan'),
  generate: () => apiClient('/study-plan/generate', { method: 'POST' }),
  completeTask: (taskId) => apiClient(`/study-plan/tasks/${taskId}/complete`, { method: 'POST' }),
};

export const adminApi = {
  getAnalytics: () => apiClient('/admin/analytics'),
  getUsers: () => apiClient('/admin/users'),
  getRules: () => apiClient('/admin/rules'),
  updateRules: (rules) => apiClient('/admin/rules', { method: 'PUT', body: rules }),
  getChallenges: () => apiClient('/admin/challenges'),
  getContent: () => apiClient('/admin/content'),
  getSyncStatus: () => apiClient('/admin/sync'),
  getAuditLog: () => apiClient('/admin/audit-log'),
  getSystemStatus: () => apiClient('/admin/system-status'),
  setMarketStatus: (status) => apiClient('/admin/market-controls/status', { method: 'POST', body: { status } }),
};
