'use client';
import { createContext, useContext, useState } from 'react';
import { apiClient } from '../lib/api/client.js';

const AIContext = createContext(null);

export function AIProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message, context = {}) => {
    setLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    try {
      const res = await apiClient('/ai/chat', { method: 'POST', body: { message, context } });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.message }]);
      return res.message;
    } finally {
      setLoading(false);
    }
  };

  const explainOrder = async (order, riskSnapshot) => {
    return apiClient('/ai/order-explanation', { method: 'POST', body: { order, riskSnapshot } });
  };

  const explainStock = async (symbol) => {
    return apiClient('/ai/stock-explanation', { method: 'POST', body: { symbol } });
  };

  return (
    <AIContext.Provider value={{ messages, loading, sendMessage, explainOrder, explainStock }}>
      {children}
    </AIContext.Provider>
  );
}

export const useAI = () => useContext(AIContext);
