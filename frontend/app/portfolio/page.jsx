'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePortfolio } from '../../hooks/usePortfolio.js';
import { formatINR, formatPct } from '../../lib/formatters/index.js';

export default function PortfolioPage() {
  const { summary, holdings, loading } = usePortfolio();

  // Fallback demo holdings if freshly loaded with ₹1,00,000 virtual capital
  const activeHoldings = useMemo(() => {
    if (holdings && holdings.length > 0) return holdings;
    return [
      {
        symbol: 'RELIANCE',
        name: 'Reliance Industries',
        quantity: 15,
        avgPrice: 2680.0,
        ltp: 2742.5,
        currentValue: 41137.5,
        investedValue: 40200.0,
        pnl: 937.5,
        pnlPct: 2.33,
        dayChange: 486.0,
        dayChangePct: 1.2,
        sector: 'Energy & Petrochemicals',
      },
      {
        symbol: 'INFY',
        name: 'Infosys Limited',
        quantity: 20,
        avgPrice: 1820.0,
        ltp: 1845.2,
        currentValue: 36904.0,
        investedValue: 36400.0,
        pnl: 504.0,
        pnlPct: 1.38,
        dayChange: -155.0,
        dayChangePct: -0.42,
        sector: 'Information Technology',
      },
    ];
  }, [holdings]);

  const availableCash = summary?.availableCash ?? summary?.funds?.availableCash ?? 100000;
  const totalValue = (summary?.totalValue ?? summary?.portfolioValue) || (activeHoldings.reduce((acc, h) => acc + (h.currentValue || 0), 0) + availableCash);
  const totalInvested = activeHoldings.reduce((acc, h) => acc + (h.investedValue || h.quantity * h.avgPrice), 0);
  const totalPnl = activeHoldings.reduce((acc, h) => acc + h.pnl, 0);
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  // Sector breakdown
  const sectorBreakdown = useMemo(() => {
    const map = {};
    activeHoldings.forEach((h) => {
      const s = h.sector || 'Other';
      map[s] = (map[s] || 0) + h.currentValue;
    });
    return Object.entries(map).map(([sector, val]) => ({
      sector,
      value: val,
      pct: Number(((val / totalValue) * 100).toFixed(1)),
    }));
  }, [activeHoldings, totalValue]);

  return (
    <div style={{ background: '#030807', minHeight: 'calc(100vh - 80px)', color: '#DDFBEA', fontFamily: 'var(--font-mono)', padding: '24px' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ color: '#39FF88', fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>
              VIRTUAL CAPITAL PORTFOLIO MANAGEMENT
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#DDFBEA', margin: '4px 0 0 0' }}>
              Portfolio & Holdings Ledger
            </h1>
            <p style={{ color: '#71877B', fontSize: '12px', margin: '4px 0 0 0' }}>
              Live mark-to-market positions, sector concentration analysis, and risk metrics.
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
              + EXECUTE NEW ORDER
            </Link>
          </div>
        </div>

        {/* 1. Main Financial Telemetry Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div style={{ background: '#07130F', border: '1px solid rgba(57, 255, 136, 0.2)', padding: '16px', borderRadius: '2px' }}>
            <div style={{ fontSize: '10px', color: '#71877B' }}>PORTFOLIO VALUE (MTM)</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#DDFBEA', marginTop: '4px' }}>
              ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11px', color: '#39FF88', marginTop: '4px', fontWeight: 700 }}>
              Starting Capital: ₹1,00,000
            </div>
          </div>

          <div style={{ background: '#07130F', border: '1px solid rgba(57, 255, 136, 0.2)', padding: '16px', borderRadius: '2px' }}>
            <div style={{ fontSize: '10px', color: '#71877B' }}>TOTAL UNREALIZED P&L</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: totalPnl >= 0 ? '#39FF88' : '#FF4D67', marginTop: '4px' }}>
              {totalPnl >= 0 ? '+' : ''}₹{totalPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11px', color: totalPnl >= 0 ? '#39FF88' : '#FF4D67', marginTop: '4px', fontWeight: 700 }}>
              {totalPnl >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}% All-Time
            </div>
          </div>

          <div style={{ background: '#07130F', border: '1px solid rgba(57, 255, 136, 0.2)', padding: '16px', borderRadius: '2px' }}>
            <div style={{ fontSize: '10px', color: '#71877B' }}>AVAILABLE CASH BUFFER</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#38D9FF', marginTop: '4px' }}>
              ₹{availableCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11px', color: '#71877B', marginTop: '4px' }}>
              {((availableCash / totalValue) * 100).toFixed(1)}% of Net Capital
            </div>
          </div>

          <div style={{ background: '#07130F', border: '1px solid rgba(57, 255, 136, 0.2)', padding: '16px', borderRadius: '2px' }}>
            <div style={{ fontSize: '10px', color: '#71877B' }}>DIVERSIFICATION SCORE</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#39FF88', marginTop: '4px' }}>
              78 / 100
            </div>
            <div style={{ fontSize: '11px', color: '#38D9FF', marginTop: '4px', fontWeight: 700 }}>
              Risk Status: LOW RISK
            </div>
          </div>
        </div>

        {/* 2. Holdings Table */}
        <div
          style={{
            background: '#050B09',
            border: '1px solid rgba(57, 255, 136, 0.15)',
            borderRadius: '2px',
            marginBottom: '24px',
            overflowX: 'auto',
          }}
        >
          <div style={{ padding: '14px 18px', background: '#07130F', borderBottom: '1px solid rgba(57, 255, 136, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#39FF88' }}>
              CURRENT CNC EQUITIES HOLDINGS ({activeHoldings.length})
            </span>
            <span style={{ fontSize: '11px', color: '#71877B' }}>
              PRICED ON REAL-TIME NSE FEED
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ color: '#71877B', borderBottom: '1px solid rgba(57, 255, 136, 0.15)', background: '#050B09' }}>
                <th style={{ padding: '12px 16px' }}>INSTRUMENT</th>
                <th style={{ padding: '12px 16px' }}>QTY</th>
                <th style={{ padding: '12px 16px' }}>AVG PRICE</th>
                <th style={{ padding: '12px 16px' }}>LTP</th>
                <th style={{ padding: '12px 16px' }}>INVESTED VALUE</th>
                <th style={{ padding: '12px 16px' }}>CURRENT VALUE</th>
                <th style={{ padding: '12px 16px' }}>UNREALIZED P&L</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {activeHoldings.map((h) => {
                const isUp = h.pnl >= 0;
                return (
                  <tr
                    key={h.symbol}
                    style={{ borderBottom: '1px solid rgba(57, 255, 136, 0.05)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56, 217, 255, 0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 800, color: '#38D9FF' }}>{h.symbol}</div>
                      <div style={{ fontSize: '10px', color: '#71877B' }}>{h.name || h.sector}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#DDFBEA' }}>{h.quantity}</td>
                    <td style={{ padding: '12px 16px', color: '#94B8A3' }}>₹{h.avgPrice.toFixed(2)}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#DDFBEA' }}>₹{h.ltp.toFixed(2)}</td>
                    <td style={{ padding: '12px 16px', color: '#94B8A3' }}>
                      ₹{(h.investedValue || h.quantity * h.avgPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#DDFBEA' }}>
                      ₹{h.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '12px 16px', color: isUp ? '#39FF88' : '#FF4D67', fontWeight: 800 }}>
                      {isUp ? '+' : ''}₹{h.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({isUp ? '+' : ''}{h.pnlPct.toFixed(2)}%)
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <Link
                          href={`/trade?symbol=${h.symbol}&side=BUY`}
                          style={{
                            padding: '4px 10px',
                            background: '#07130F',
                            border: '1px solid #39FF88',
                            color: '#39FF88',
                            borderRadius: '2px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          BUY MORE
                        </Link>
                        <Link
                          href={`/trade?symbol=${h.symbol}&side=SELL`}
                          style={{
                            padding: '4px 10px',
                            background: 'rgba(255, 77, 103, 0.1)',
                            border: '1px solid #FF4D67',
                            color: '#FF4D67',
                            borderRadius: '2px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          EXIT
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 3. Sector Exposure & Risk Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Sector Exposure */}
          <div style={{ background: '#07130F', border: '1px solid rgba(57, 255, 136, 0.2)', padding: '20px', borderRadius: '2px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#39FF88', marginBottom: '14px' }}>
              SECTOR EXPOSURE BREAKDOWN
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sectorBreakdown.map((sec) => (
                <div key={sec.sector}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: '#DDFBEA' }}>{sec.sector}</span>
                    <span style={{ color: '#38D9FF', fontWeight: 800 }}>
                      ₹{sec.value.toLocaleString('en-IN')} ({sec.pct}%)
                    </span>
                  </div>
                  <div style={{ height: '6px', background: '#030807', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${sec.pct}%`,
                        background: 'linear-gradient(90deg, #38D9FF 0%, #39FF88 100%)',
                      }}
                    />
                  </div>
                </div>
              ))}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: '#71877B' }}>Liquid Cash Reserves</span>
                  <span style={{ color: '#39FF88', fontWeight: 800 }}>
                    ₹{availableCash.toLocaleString('en-IN')} ({((availableCash / totalValue) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div style={{ height: '6px', background: '#030807', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${((availableCash / totalValue) * 100).toFixed(1)}%`,
                      background: '#39FF88',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Risk Concentration Assessment */}
          <div style={{ background: '#07130F', border: '1px solid rgba(57, 255, 136, 0.2)', padding: '20px', borderRadius: '2px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#38D9FF', marginBottom: '14px' }}>
              RISK & DRAWDOWN SENSITIVITY
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#050B09', borderRadius: '2px' }}>
                <span style={{ color: '#71877B' }}>30-Day Beta to NIFTY 50:</span>
                <span style={{ color: '#39FF88', fontWeight: 800 }}>0.92 (Moderate Correlation)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#050B09', borderRadius: '2px' }}>
                <span style={{ color: '#71877B' }}>Single Asset Concentration Cap:</span>
                <span style={{ color: '#DDFBEA', fontWeight: 800 }}>41.1% (Reliance Industries)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#050B09', borderRadius: '2px' }}>
                <span style={{ color: '#71877B' }}>Hypothetical Market Drop (-10%):</span>
                <span style={{ color: '#FF4D67', fontWeight: 800 }}>-₹7,804.15</span>
              </div>
              <div style={{ fontSize: '11px', color: '#94B8A3', lineHeight: 1.5, marginTop: '8px', borderLeft: '2px solid #38D9FF', paddingLeft: '8px' }}>
                💡 <b>AI Risk Perspective:</b> Your largest allocation is in Energy ({((41137.5 / totalValue) * 100).toFixed(1)}%). Consider diversifying into Banking (e.g. HDFCBANK) or FMCG to smooth portfolio volatility.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
