'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/api/client.js';
import { formatINR, formatPct, formatVolume } from '../../lib/formatters/index.js';

const MARKET_INDICES = [
  { symbol: 'NIFTY 50', value: 24315.8, change: 142.3, changePct: 0.59, high: 24380.0, low: 24190.2 },
  { symbol: 'SENSEX', value: 79942.2, change: 485.6, changePct: 0.61, high: 80120.4, low: 79540.1 },
  { symbol: 'BANK NIFTY', value: 51840.4, change: -130.5, changePct: -0.25, high: 52100.0, low: 51650.0 },
  { symbol: 'NIFTY IT', value: 38740.1, change: 440.8, changePct: 1.15, high: 38920.0, low: 38350.0 },
];

const TOP_GAINERS = [
  { symbol: 'JIOFIN', name: 'Jio Financial Services', price: 348.7, changePct: 4.82, volume: 32450000, sector: 'Financial Services' },
  { symbol: 'TATASTEEL', name: 'Tata Steel Limited', price: 154.2, changePct: 3.45, volume: 28900000, sector: 'Metals' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', price: 1598.6, changePct: 2.91, volume: 14500000, sector: 'Telecom' },
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2742.5, changePct: 1.2, volume: 12400000, sector: 'Energy' },
];

const TOP_LOSERS = [
  { symbol: 'SBIN', name: 'State Bank of India', price: 812.3, changePct: -2.15, volume: 19800000, sector: 'Banking' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2380.0, changePct: -1.84, volume: 6200000, sector: 'FMCG' },
  { symbol: 'INFY', name: 'Infosys Limited', price: 1845.2, changePct: -0.92, volume: 9400000, sector: 'IT' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India', price: 12100.0, changePct: -0.75, volume: 1400000, sector: 'Automobile' },
];

export default function MarketsPage() {
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    apiClient('/markets')
      .then((data) => setStocks(data || []))
      .catch(() => setStocks([]))
      .finally(() => setLoading(false));
  }, []);

  const sectors = useMemo(() => {
    return ['ALL', 'Financial Services', 'Information Technology', 'Energy & Petrochemicals', 'Automobile', 'Metals & Mining', 'Fast Moving Consumer Goods', 'Pharmaceuticals', 'Telecommunication'];
  }, []);

  const filtered = useMemo(() => {
    let result = stocks;
    if (activeTab === 'GAINERS') {
      result = [...stocks].sort((a, b) => (b.changePct || 0) - (a.changePct || 0));
    } else if (activeTab === 'LOSERS') {
      result = [...stocks].sort((a, b) => (a.changePct || 0) - (b.changePct || 0));
    }

    return result.filter((s) => {
      const q = search.toLowerCase();
      const matchSearch = (s.symbol && s.symbol.toLowerCase().includes(q)) || (s.name && s.name.toLowerCase().includes(q));
      const matchSector = selectedSector === 'ALL' || (s.sector && s.sector.toLowerCase().includes(selectedSector.toLowerCase()));
      return matchSearch && matchSector;
    });
  }, [stocks, search, selectedSector, activeTab]);

  const paginatedStocks = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  return (
    <div style={{ background: '#030807', minHeight: 'calc(100vh - 80px)', color: '#DDFBEA', fontFamily: 'var(--font-mono)', padding: '24px' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {/* Page Title & Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ color: '#39FF88', fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>
              NATIONAL STOCK EXCHANGE OF INDIA • DIRECTORY
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#DDFBEA', margin: '4px 0 0 0' }}>
              NSE Securities Exchange
            </h1>
            <p style={{ color: '#71877B', fontSize: '12px', margin: '4px 0 0 0' }}>
              Browse real-time metrics across 2,620 listed equities, sectoral indices, and virtual order endpoints.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
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
              + QUICK ORDER DESK
            </Link>
          </div>
        </div>

        {/* 1. Market Indices Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          {MARKET_INDICES.map((idx) => {
            const isUp = idx.changePct >= 0;
            return (
              <div
                key={idx.symbol}
                style={{
                  background: '#07130F',
                  border: '1px solid rgba(57, 255, 136, 0.15)',
                  padding: '14px 18px',
                  borderRadius: '2px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#38D9FF' }}>{idx.symbol}</span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: isUp ? '#39FF88' : '#FF4D67' }}>
                    {isUp ? '+' : ''}{idx.changePct}%
                  </span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#DDFBEA', marginTop: '6px' }}>
                  {idx.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#71877B', marginTop: '6px' }}>
                  <span>H: ₹{idx.high.toLocaleString('en-IN')}</span>
                  <span>L: ₹{idx.low.toLocaleString('en-IN')}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Top Movers Cards (Gainers & Losers) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {/* Top Gainers */}
          <div style={{ background: '#07130F', border: '1px solid rgba(57, 255, 136, 0.2)', padding: '16px', borderRadius: '2px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#39FF88', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#39FF88' }} />
              TOP GAINERS (NSE)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {TOP_GAINERS.map((g) => (
                <Link
                  key={g.symbol}
                  href={`/markets/${g.symbol}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: '#050B09',
                    borderRadius: '2px',
                    textDecoration: 'none',
                    border: '1px solid rgba(57, 255, 136, 0.08)',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '12px', color: '#38D9FF' }}>{g.symbol}</span>
                    <span style={{ fontSize: '10px', color: '#71877B', marginLeft: '8px' }}>{g.sector}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 800, fontSize: '12px', color: '#DDFBEA', marginRight: '12px' }}>₹{g.price}</span>
                    <span style={{ fontWeight: 800, fontSize: '11px', color: '#39FF88' }}>+{g.changePct}%</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div style={{ background: '#07130F', border: '1px solid rgba(255, 77, 103, 0.2)', padding: '16px', borderRadius: '2px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#FF4D67', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF4D67' }} />
              TOP LOSERS (NSE)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {TOP_LOSERS.map((l) => (
                <Link
                  key={l.symbol}
                  href={`/markets/${l.symbol}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: '#050B09',
                    borderRadius: '2px',
                    textDecoration: 'none',
                    border: '1px solid rgba(255, 77, 103, 0.08)',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '12px', color: '#38D9FF' }}>{l.symbol}</span>
                    <span style={{ fontSize: '10px', color: '#71877B', marginLeft: '8px' }}>{l.sector}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 800, fontSize: '12px', color: '#DDFBEA', marginRight: '12px' }}>₹{l.price}</span>
                    <span style={{ fontWeight: 800, fontSize: '11px', color: '#FF4D67' }}>{l.changePct}%</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Search & Sector Filter Bar */}
        <div
          style={{
            background: '#07130F',
            border: '1px solid rgba(57, 255, 136, 0.15)',
            padding: '14px 18px',
            borderRadius: '2px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          {/* Tabs: ALL, GAINERS, LOSERS */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'GAINERS', 'LOSERS'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '2px',
                  background: activeTab === tab ? '#0B3D2E' : 'transparent',
                  border: activeTab === tab ? '1px solid #39FF88' : '1px solid rgba(57, 255, 136, 0.15)',
                  color: activeTab === tab ? '#39FF88' : '#71877B',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search symbol, company (e.g. RELIANCE, Tata)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                width: '320px',
                padding: '8px 12px',
                borderRadius: '2px',
                background: '#030807',
                border: '1px solid rgba(57, 255, 136, 0.25)',
                color: '#DDFBEA',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
              }}
            />

            <select
              value={selectedSector}
              onChange={(e) => {
                setSelectedSector(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '2px',
                background: '#030807',
                border: '1px solid rgba(57, 255, 136, 0.25)',
                color: '#DDFBEA',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {sectors.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. High-Density Market Table */}
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
              <tr style={{ background: '#07130F', borderBottom: '1px solid rgba(57, 255, 136, 0.2)', color: '#71877B', fontSize: '11px' }}>
                <th style={{ padding: '12px 16px' }}>SYMBOL</th>
                <th style={{ padding: '12px 16px' }}>COMPANY NAME</th>
                <th style={{ padding: '12px 16px' }}>SECTOR</th>
                <th style={{ padding: '12px 16px' }}>SERIES</th>
                <th style={{ padding: '12px 16px' }}>EST. LTP</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStocks.map((sec) => {
                const estPrice = sec.symbol === 'RELIANCE' ? 2742.5 : sec.symbol === 'TCS' ? 3912.8 : sec.symbol === 'INFY' ? 1845.2 : 1250.0;
                return (
                  <tr
                    key={sec.symbol}
                    style={{
                      borderBottom: '1px solid rgba(57, 255, 136, 0.05)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56, 217, 255, 0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#38D9FF' }}>
                      <Link href={`/markets/${sec.symbol}`} style={{ textDecoration: 'none', color: '#38D9FF' }}>
                        {sec.symbol}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#DDFBEA' }}>{sec.name}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: '#07130F', padding: '2px 8px', borderRadius: '2px', fontSize: '10px', color: '#94B8A3', border: '1px solid rgba(57, 255, 136, 0.1)' }}>
                        {sec.sector || 'Equities'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#71877B' }}>{sec.series || 'EQ'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#DDFBEA' }}>
                      ₹{estPrice.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Link
                          href={`/markets/${sec.symbol}`}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '2px',
                            background: '#07130F',
                            border: '1px solid rgba(57, 255, 136, 0.2)',
                            color: '#DDFBEA',
                            fontSize: '11px',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          CHART
                        </Link>
                        <Link
                          href={`/trade?symbol=${sec.symbol}`}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '2px',
                            background: '#39FF88',
                            color: '#030807',
                            fontSize: '11px',
                            fontWeight: 900,
                            textDecoration: 'none',
                          }}
                        >
                          TRADE
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#71877B' }}>
              No matching NSE listed securities found for &quot;{search}&quot;.
            </div>
          )}

          {/* Pagination Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              background: '#07130F',
              borderTop: '1px solid rgba(57, 255, 136, 0.15)',
              fontSize: '11px',
              color: '#71877B',
            }}
          >
            <div>
              SHOWING {(page - 1) * pageSize + 1} TO {Math.min(page * pageSize, filtered.length)} OF {filtered.length} SECURITIES
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{
                  padding: '4px 12px',
                  borderRadius: '2px',
                  background: '#030807',
                  border: '1px solid rgba(57, 255, 136, 0.2)',
                  color: page <= 1 ? '#71877B' : '#39FF88',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                PREVIOUS
              </button>
              <span style={{ padding: '4px 8px', color: '#DDFBEA' }}>
                PAGE {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{
                  padding: '4px 12px',
                  borderRadius: '2px',
                  background: '#030807',
                  border: '1px solid rgba(57, 255, 136, 0.2)',
                  color: page >= totalPages ? '#71877B' : '#39FF88',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                NEXT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
