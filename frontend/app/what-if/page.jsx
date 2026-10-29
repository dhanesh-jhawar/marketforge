'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatINR, formatPct } from '../../lib/formatters/index.js';

const SCENARIOS = [
  {
    id: 'invest-10k-past',
    title: 'INVESTED ₹10,000 IN THE PAST',
    date: 'Jan 2014 – Jan 2024 (10 Years)',
    asset: 'NIFTY 50 / BLUECHIP BASKET',
    initialCapital: 10000,
    finalValue: 38450,
    returnPct: 284.5,
    maxDrawdownPct: 38.4,
    description: 'What happens if you parked ₹10,000 into top Indian bluechips and never touched it for a decade?',
    lesson: 'Power of compounding over 10-year horizons overcomes intermediate volatility. Time in the market beats timing the market.',
    pricePath: [10000, 11400, 10800, 13200, 15600, 18900, 14200, 24500, 29800, 34200, 38450],
  },
  {
    id: 'covid-crash',
    title: 'COVID CRASH',
    date: 'Feb 2020 – Apr 2020 (Liquidity Shock)',
    asset: 'RELIANCE & NIFTY 50',
    initialCapital: 100000,
    finalValue: 62000,
    returnPct: -38.0,
    maxDrawdownPct: 38.2,
    description: 'The sharpest 40% crash in modern Indian market history as global lockdowns triggered mass liquidation.',
    lesson: 'Panic-selling at the bottom locks in paper losses. Investors who held or accumulated gained over 140% in the subsequent 18-month bull recovery.',
    pricePath: [100000, 96000, 89000, 78000, 65000, 62000, 67000, 74000, 82000, 95000, 115000],
  },
  {
    id: 'diversification',
    title: 'DIVERSIFICATION',
    date: '2021 – 2023 (Tech Correction)',
    asset: '5-Sector Equal Weight vs 100% IT',
    initialCapital: 100000,
    finalValue: 124800,
    returnPct: 24.8,
    maxDrawdownPct: 12.1,
    description: 'Comparing a concentrated single-sector tech bet against a disciplined 5-sector portfolio across IT, Banking, Auto, Energy, and Pharma.',
    lesson: 'Sector rotation cushions portfolio drawdown. When IT contracted 25% in 2022, Banking and Energy rallied, protecting net capital.',
    pricePath: [100000, 103000, 101000, 106000, 111000, 108000, 114000, 119000, 122000, 124800],
  },
  {
    id: 'earnings-day',
    title: 'EARNINGS DAY',
    date: 'Q3 Earnings Announcement',
    asset: 'INFY (Guidance Cut Reaction)',
    initialCapital: 50000,
    finalValue: 42100,
    returnPct: -15.8,
    maxDrawdownPct: 16.5,
    description: 'Entering a heavy speculative long order 10 minutes before market close ahead of earnings results.',
    lesson: 'Binary events exhibit extreme implied volatility crush and gap risk. Never hold oversized unhedged positions into corporate earnings.',
    pricePath: [50000, 50200, 50800, 50100, 42500, 41800, 42000, 42100],
  },
  {
    id: 'bought-at-peak',
    title: 'BOUGHT AT THE PEAK',
    date: 'Oct 2021 (NIFTY 18,600 Peak)',
    asset: 'NIFTY 50 Index',
    initialCapital: 100000,
    finalValue: 84800,
    returnPct: -15.2,
    maxDrawdownPct: 17.8,
    description: 'Buying when euphoria was at an all-time high right before an 8-month global interest rate hike correction.',
    lesson: 'Even if you buy at the absolute worst possible top, maintaining disciplined capital allocation and waiting 24 months returns you to profitability.',
    pricePath: [100000, 97000, 94000, 91000, 87000, 84800, 89000, 93000, 98000, 105000, 118000],
  },
  {
    id: 'sip-vs-lump-sum',
    title: 'SIP VS LUMP SUM',
    date: '2018 – 2023 (Volatile Sideways Market)',
    asset: 'Monthly ₹5,000 SIP vs ₹60,000 Lump',
    initialCapital: 60000,
    finalValue: 89400,
    returnPct: 49.0,
    maxDrawdownPct: 11.5,
    description: 'Rupee-Cost Averaging through market peaks and troughs versus entering all virtual capital in a single order.',
    lesson: 'SIP accumulates more units at lower valuations during dips, lowering aggregate average cost basis and smoothing psychological stress.',
    pricePath: [60000, 61200, 60800, 63500, 66100, 69200, 74500, 79800, 84200, 89400],
  },
  {
    id: 'stop-loss',
    title: 'STOP-LOSS',
    date: 'Intraday Breakdown Breakdown',
    asset: 'High-Beta Equity',
    initialCapital: 100000,
    finalValue: 97000,
    returnPct: -3.0,
    maxDrawdownPct: 3.0,
    description: 'Executing an automatic stop-loss exit at -3% vs holding a declining asset hoping for a rebound that went -28%.',
    lesson: 'A small planned loss of 3% prevents catastrophic drawdown of 30%. In trading, defense wins championships.',
    pricePath: [100000, 99200, 98100, 97000, 97000, 97000, 97000],
  },
];

export default function WhatIfPage() {
  const [selectedId, setSelectedId] = useState('covid-crash');
  const scenario = SCENARIOS.find((s) => s.id === selectedId) || SCENARIOS[0];

  const minPath = Math.min(...scenario.pricePath);
  const maxPath = Math.max(...scenario.pricePath);
  const range = maxPath - minPath || 1;

  return (
    <div style={{ background: '#030807', minHeight: 'calc(100vh - 80px)', color: '#DDFBEA', fontFamily: 'var(--font-mono)', padding: '24px' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ color: '#38D9FF', fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>
            HISTORICAL MARKET LABORATORY
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#39FF88', margin: '4px 0 0 0', textShadow: '0 0 20px rgba(57, 255, 136, 0.3)' }}>
            CHANGE THE PAST.
          </h1>
          <p style={{ color: '#71877B', fontSize: '13px', margin: '4px 0 0 0' }}>
            Select a critical historical scenario to backtest virtual capital against real Indian market shocks.
          </p>
        </div>

        {/* 7 Scenario Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px',
            marginBottom: '32px',
          }}
        >
          {SCENARIOS.map((s) => {
            const isSelected = s.id === selectedId;
            const isUp = s.returnPct >= 0;
            return (
              <div
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                style={{
                  background: isSelected ? '#0B3D2E' : '#07130F',
                  border: isSelected ? '1px solid #39FF88' : '1px solid rgba(57, 255, 136, 0.15)',
                  boxShadow: isSelected ? '0 0 20px rgba(57, 255, 136, 0.3)' : 'none',
                  padding: '16px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', color: '#71877B' }}>{s.date}</span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: isUp ? '#39FF88' : '#FF4D67' }}>
                    {isUp ? '+' : ''}{s.returnPct}%
                  </span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: isSelected ? '#39FF88' : '#DDFBEA', marginBottom: '4px' }}>
                  {s.title}
                </div>
                <div style={{ fontSize: '11px', color: '#94B8A3', lineHeight: 1.4 }}>
                  {s.asset}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Scenario Simulation Breakdown Panel */}
        <div
          style={{
            background: '#07130F',
            border: '1px solid #39FF88',
            boxShadow: '0 0 30px rgba(57, 255, 136, 0.15)',
            borderRadius: '2px',
            padding: '28px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#38D9FF', fontWeight: 800 }}>ACTIVE SIMULATION</div>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#39FF88', margin: '4px 0' }}>
                {scenario.title}
              </h2>
              <div style={{ color: '#71877B', fontSize: '12px' }}>{scenario.date} • {scenario.asset}</div>
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
                  boxShadow: '0 0 15px rgba(57, 255, 136, 0.3)',
                }}
              >
                PRACTICE THIS STRATEGY →
              </Link>
            </div>
          </div>

          {/* 5 Financial Telemetry Metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              background: '#050B09',
              border: '1px solid rgba(57, 255, 136, 0.2)',
              padding: '20px',
              borderRadius: '2px',
              marginBottom: '28px',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#71877B' }}>INITIAL INVESTMENT</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#DDFBEA', marginTop: '4px' }}>
                ₹{scenario.initialCapital.toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#71877B' }}>FINAL VALUE</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#39FF88', marginTop: '4px' }}>
                ₹{scenario.finalValue.toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#71877B' }}>NET RETURN</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: scenario.returnPct >= 0 ? '#39FF88' : '#FF4D67', marginTop: '4px' }}>
                {scenario.returnPct >= 0 ? '+' : ''}{scenario.returnPct}%
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#71877B' }}>MAX DRAWDOWN</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#FF4D67', marginTop: '4px' }}>
                -{scenario.maxDrawdownPct}%
              </div>
            </div>
          </div>

          {/* SVG Price Path Visualization */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '11px', color: '#71877B', fontWeight: 800, marginBottom: '8px' }}>
              HISTORICAL PRICE PATH
            </div>
            <div
              style={{
                height: '180px',
                width: '100%',
                background: '#030807',
                border: '1px solid rgba(57, 255, 136, 0.15)',
                borderRadius: '2px',
                padding: '16px',
                position: 'relative',
              }}
            >
              <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="pathGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#39FF88" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#39FF88" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Connecting Polyline */}
                <polyline
                  fill="none"
                  stroke="#39FF88"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={scenario.pricePath
                    .map((val, idx) => {
                      const x = (idx / (scenario.pricePath.length - 1)) * 100;
                      const y = 100 - ((val - minPath) / range) * 80 - 10;
                      return `${x}%,${y}%`;
                    })
                    .join(' ')}
                />
                {/* Data Points */}
                {scenario.pricePath.map((val, idx) => {
                  const x = `${(idx / (scenario.pricePath.length - 1)) * 100}%`;
                  const y = `${100 - ((val - minPath) / range) * 80 - 10}%`;
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#030807"
                      stroke="#38D9FF"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Key Lesson Box */}
          <div
            style={{
              background: '#050B09',
              border: '1px solid #38D9FF',
              padding: '16px 20px',
              borderRadius: '2px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#38D9FF', marginBottom: '6px' }}>
              MARKET LESSON & RISK PRINCIPLE
            </div>
            <div style={{ fontSize: '13px', color: '#DDFBEA', lineHeight: 1.6 }}>
              {scenario.lesson}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
