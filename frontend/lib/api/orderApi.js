import { apiClient } from './client.js';

export const orderApi = {
  review: (orderData) => apiClient('/orders/review', { method: 'POST', body: orderData }),
  create: (orderData) => apiClient('/orders', { method: 'POST', body: orderData }),
  confirm: (orderId) => apiClient(`/orders/${orderId}/confirm`, { method: 'POST' }),
  list: (status) => apiClient(`/orders${status ? `?status=${status}` : ''}`),
  getById: (id) => apiClient(`/orders/${id}`),
  cancel: (id) => apiClient(`/orders/${id}`, { method: 'DELETE' }),
};
