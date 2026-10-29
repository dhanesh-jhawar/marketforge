'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api/client.js';
import { wsClient } from '../lib/websocket/socketClient.js';
import { WS_EVENTS } from '@marketforge/shared/constants';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const data = await apiClient('/orders');
      setOrders(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const unbind = wsClient.on(WS_EVENTS.ORDER_UPDATE, () => {
      fetchOrders();
    });
    return () => unbind();
  }, []);

  return { orders, loading, refresh: fetchOrders };
}
