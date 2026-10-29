'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { wsClient } from '../lib/websocket/socketClient.js';
import { apiClient } from '../lib/api/client.js';
import { WS_EVENTS } from '@marketforge/shared/constants';

const MarketContext = createContext(null);

export function MarketProvider({ children }) {
  const [quotes, setQuotes] = useState({});
  const [indices, setIndices] = useState([]);
  const [marketStatus, setMarketStatus] = useState(null);

  useEffect(() => {
    wsClient.connect();

    async function loadInitial() {
      try {
        const [idx, stat] = await Promise.all([
          apiClient('/markets/indices'),
          apiClient('/markets/status'),
        ]);
        setIndices(idx || []);
        setMarketStatus(stat || null);
      } catch (e) {
        console.warn('Initial market load fallback', e);
      }
    }
    loadInitial();

    // Listen to real-time price ticks
    const unbindTick = wsClient.on(WS_EVENTS.PRICE_UPDATE, (quote) => {
      setQuotes((prev) => ({ ...prev, [quote.symbol]: quote }));
    });

    const unbindStatus = wsClient.on(WS_EVENTS.MARKET_STATUS, (stat) => {
      setMarketStatus(stat);
    });

    return () => {
      unbindTick();
      unbindStatus();
    };
  }, []);

  return (
    <MarketContext.Provider value={{ quotes, indices, marketStatus, wsClient }}>
      {children}
    </MarketContext.Provider>
  );
}

export const useMarket = () => useContext(MarketContext);
