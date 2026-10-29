'use client';
import { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext.jsx';
import { apiClient } from '../lib/api/client.js';

export function useMarketData(symbol) {
  const { quotes, wsClient } = useMarket();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;
    const sym = symbol.toUpperCase();
    wsClient.subscribeSymbols([sym]);

    apiClient(`/stocks/${sym}/quote`)
      .then((q) => setData(q))
      .catch((e) => console.warn('Quote fetch failed', e))
      .finally(() => setLoading(false));

    return () => {
      wsClient.unsubscribeSymbols([sym]);
    };
  }, [symbol]);

  // Merge live tick if available
  const quote = (symbol && quotes[symbol.toUpperCase()]) || data;
  return { quote, loading };
}
