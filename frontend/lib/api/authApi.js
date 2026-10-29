import { apiClient, setApiToken, getApiToken } from './client.js';

export const authApi = {
  login: (email, password) => apiClient('/auth/login', { method: 'POST', body: { email, password } }),
  register: (name, email, password) => apiClient('/auth/register', { method: 'POST', body: { name, email, password } }),
  getMe: () => apiClient('/auth/me'),
  logout: () => {
    setApiToken(null);
  },
  onboarding: (answers) => apiClient('/onboarding', { method: 'POST', body: answers }),
};
