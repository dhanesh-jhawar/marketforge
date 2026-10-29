'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api/client.js';
import { wsClient } from '../lib/websocket/socketClient.js';
import { WS_EVENTS } from '@marketforge/shared/constants';

export function usePortfolio() {
  const [summary, setSummary] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = async () => {
    try {
      const [sum, hld] = await Promise.all([
        apiClient('/portfolio'),
        apiClient('/portfolio/holdings'),
      ]);
      setSummary(sum);
      setHoldings(hld || []);
    } catch (e) {
      console.warn('Portfolio load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    const unbind = wsClient.on(WS_EVENTS.PORTFOLIO_UPDATE, () => {
      fetchPortfolio();
    });
    return () => unbind();
  }, []);

  return { summary, holdings, loading, refresh: fetchPortfolio };
}
