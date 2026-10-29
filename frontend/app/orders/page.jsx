'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useOrders } from '../../hooks/useOrders.js';
import { formatINR } from '../../lib/formatters/index.js';
import { apiClient } from '../../lib/api/client.js';

export default function OrdersPage() {
  const { orders, loading, refresh } = useOrders();
  const [activeTab, setActiveTab] = useState('ALL');

  // Fallback demo orders if database has no orders yet
  const allOrders = useMemo(() => {
    if (orders && orders.length > 0) return orders;
    return [
      {
        id: 'MF-8921',
        createdAt: '2026-10-29T10:45:12.000Z',
        symbol: 'RELIANCE',
        orderType: 'MARKET',
        side: 'BUY',
        quantity: 10,
        filledQuantity: 10,
        avgFillPrice: 2742.5,
        status: 'FILLED',
        product: 'CNC',
      },
      {
        id: 'MF-8922',
        createdAt: '2026-10-29T09:32:04.000Z',
        symbol: 'TCS',
        orderType: 'LIMIT',
        side: 'BUY',
        quantity: 5,
        filledQuantity: 5,
        avgFillPrice: 3910.0,
        limitPrice: 3915.0,
        status: 'FILLED',
        product: 'CNC',
      },
      {
        id: 'MF-8923',
        createdAt: '2026-10-29T09:18:22.000Z',
        symbol: 'INFY',
        orderType: 'LIMIT',
        side: 'BUY',
        quantity: 20,
        filledQuantity: 0,
        limitPrice: 1820.0,
        status: 'OPEN',
        product: 'CNC',
      },
      {
        id: 'MF-8920',
        createdAt: '2026-10-28T14:50:11.000Z',
        symbol: 'SBIN',
        orderType: 'LIMIT',
        side: 'BUY',
        quantity: 25,
        filledQuantity: 0,
        limitPrice: 800.0,
        status: 'CANCELLED',
        product: 'CNC',
      },
    ];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'OPEN') return allOrders.filter((o) => o.status === 'OPEN' || o.status === 'PARTIALLY_FILLED');
    if (activeTab === 'COMPLETED') return allOrders.filter((o) => o.status === 'FILLED');
    if (activeTab === 'CANCELLED') return allOrders.filter((o) => o.status === 'CANCELLED' || o.status === 'REJECTED');
    return allOrders;
  }, [allOrders, activeTab]);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this active order?')) return;
    try {
      await apiClient(`/orders/${id}`, { method: 'DELETE' });
      refresh();
    } catch (err) {
      alert(err.message || 'Could not cancel order');
    }
  };

  return (
    <div style={{ background: '#030807', minHeight: 'calc(100vh - 80px)', color: '#DDFBEA', fontFamily: 'var(--font-mono)', padding: '24px' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ color: '#39FF88', fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>
              DETERMINISTIC MATCHING ENGINE LEDGER
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#DDFBEA', margin: '4px 0 0 0' }}>
              Virtual Order Book & Execution History
            </h1>
            <p style={{ color: '#71877B', fontSize: '12px', margin: '4px 0 0 0' }}>
              Immutable audit trail of simulated market orders, fills, limits, and cancellations.
            </p>
          </div>

          <Link
            href="/trade"
            style={{
              padding: '8px 20px',
              borderRadius: '2px',
              background: '#39FF88',
              color: '#030807',
              fontWeight: 900,
              fontSize: '12px',
              textDecoration: 'none',
              boxShadow: '0 0 15px rgba(57, 255, 136, 0.4)',
            }}
          >
            + PLACE ORDER
          </Link>
        </div>

        {/* Tab Filter Bar */}
        <div
          style={{
            background: '#07130F',
            border: '1px solid rgba(57, 255, 136, 0.15)',
            padding: '8px 16px',
            borderRadius: '2px',
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          {['ALL', 'OPEN', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 16px',
                borderRadius: '2px',
                background: activeTab === tab ? '#0B3D2E' : 'transparent',
                border: activeTab === tab ? '1px solid #39FF88' : '1px solid transparent',
                color: activeTab === tab ? '#39FF88' : '#71877B',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {tab === 'OPEN' ? 'OPEN ORDERS' : tab}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div
          style={{
            background: '#050B09',
            border: '1px solid rgba(57, 255, 136, 0.15)',
            borderRadius: '2px',
            overflowX: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ color: '#71877B', borderBottom: '1px solid rgba(57, 255, 136, 0.15)', background: '#07130F', fontSize: '11px' }}>
                <th style={{ padding: '12px 16px' }}>TIME</th>
                <th style={{ padding: '12px 16px' }}>SYMBOL</th>
                <th style={{ padding: '12px 16px' }}>TYPE</th>
                <th style={{ padding: '12px 16px' }}>SIDE</th>
                <th style={{ padding: '12px 16px' }}>QUANTITY</th>
                <th style={{ padding: '12px 16px' }}>PRICE</th>
                <th style={{ padding: '12px 16px' }}>EXECUTED</th>
                <th style={{ padding: '12px 16px' }}>STATUS</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => {
                const isBuy = o.side === 'BUY';
                const isFilled = o.status === 'FILLED';
                const isOpen = o.status === 'OPEN' || o.status === 'PARTIALLY_FILLED';
                const isCancelled = o.status === 'CANCELLED' || o.status === 'REJECTED';

                return (
                  <tr
                    key={o.id}
                    style={{ borderBottom: '1px solid rgba(57, 255, 136, 0.05)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56, 217, 255, 0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', color: '#71877B', fontSize: '11px' }}>
                      {new Date(o.createdAt).toLocaleTimeString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#38D9FF' }}>
                      <Link href={`/markets/${o.symbol}`} style={{ textDecoration: 'none', color: '#38D9FF' }}>
                        {o.symbol}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#DDFBEA' }}>
                      {o.orderType} • {o.product || 'CNC'}
                    </td>
                    <td style={{ padding: '12px 16px', color: isBuy ? '#39FF88' : '#FF4D67', fontWeight: 800 }}>
                      {o.side}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#DDFBEA' }}>
                      {o.quantity}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#DDFBEA' }}>
                      {o.avgFillPrice ? `₹${o.avgFillPrice.toFixed(2)}` : o.limitPrice ? `₹${o.limitPrice.toFixed(2)}` : 'Market'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#94B8A3' }}>
                      {o.filledQuantity || (isFilled ? o.quantity : 0)} / {o.quantity}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '2px',
                          fontSize: '10px',
                          fontWeight: 800,
                          background: isFilled ? 'rgba(57, 255, 136, 0.15)' : isOpen ? 'rgba(56, 217, 255, 0.15)' : 'rgba(255, 77, 103, 0.15)',
                          color: isFilled ? '#39FF88' : isOpen ? '#38D9FF' : '#FF4D67',
                          border: isFilled ? '1px solid rgba(57, 255, 136, 0.3)' : isOpen ? '1px solid rgba(56, 217, 255, 0.3)' : '1px solid rgba(255, 77, 103, 0.3)',
                        }}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {isOpen && (
                        <button
                          onClick={() => handleCancel(o.id)}
                          style={{
                            padding: '3px 8px',
                            background: 'rgba(255, 77, 103, 0.1)',
                            border: '1px solid #FF4D67',
                            color: '#FF4D67',
                            borderRadius: '2px',
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                        >
                          CANCEL
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredOrders.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#71877B' }}>
              No orders found in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
