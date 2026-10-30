import { apiClient } from './client.js';

export const replayApi = {
  getStockMeta: (symbol) => apiClient(`/replay/stocks/${encodeURIComponent(symbol)}`),
  getHistory: (symbol, { from, to, interval } = {}) => {
    const p = new URLSearchParams();
    if (from) p.set('from', from);
    if (to) p.set('to', to);
    if (interval) p.set('interval', interval);
    return apiClient(`/replay/history/${encodeURIComponent(symbol)}?${p.toString()}`);
  },
  getEvents: (symbol, { from, to } = {}) => {
    const p = new URLSearchParams();
    if (from) p.set('from', from);
    if (to) p.set('to', to);
    return apiClient(`/replay/events/${encodeURIComponent(symbol)}?${p.toString()}`);
  },
  analyze: (payload) => apiClient('/replay/analyze', { method: 'POST', body: payload }),
  getSummary: (symbol) => apiClient(`/replay/summary/${encodeURIComponent(symbol)}`),
  getAiExplanation: (payload) => apiClient('/replay/ai-explanation', { method: 'POST', body: payload }),
};

