'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const DATA_PROVIDERS = [
  { name: 'TEJHQ', type: 'Primary Equities', status: 'ONLINE', latency: '42ms', lastSync: '10s ago', records: '2,620 Symbols', errors: 0 },
  { name: 'FYERS', type: 'WebSocket Streaming', status: 'ONLINE', latency: '68ms', lastSync: '1s ago', records: 'Tick Stream', errors: 0 },
  { name: 'TWELVE DATA', type: 'Global Fallback', status: 'STANDBY', latency: '124ms', lastSync: '5m ago', records: 'Global Master', errors: 0 },
  { name: 'GNEWS', type: 'Financial News Feed', status: 'ONLINE', latency: '210ms', lastSync: '2m ago', records: '142 Articles', errors: 0 },
  { name: 'NEWSAPI', type: 'News Fallback', status: 'STANDBY', latency: '185ms', lastSync: '15m ago', records: 'Backup Wire', errors: 0 },
  { name: 'NSE', type: 'Regulatory Master', status: 'SYNCED', latency: '85ms', lastSync: 'Daily', records: '2,620 Equities', errors: 0 },
];

const AUDIT_LOGS = [
  { timestamp: '2026-10-29 22:45:10', admin: 'sysadmin@marketforge.io', action: 'UPDATE_RULE', resource: 'MAX_POSITION_PCT', before: '30%', after: '25%', ip: '10.0.4.12', status: 'SUCCESS' },
  { timestamp: '2026-10-29 21:12:04', admin: 'quant@marketforge.io', action: 'SYNC_EQUITIES', resource: 'SECURITY_MASTER', before: '2,580', after: '2,620', ip: '10.0.4.15', status: 'SUCCESS' },
  { timestamp: '2026-10-29 19:30:00', admin: 'system_cron', action: 'DAILY_PORTFOLIO_SNAPSHOT', resource: 'PORTFOLIO_ACCOUNTS', before: '-', after: '1,248 accounts', ip: '127.0.0.1', status: 'SUCCESS' },
  { timestamp: '2026-10-29 18:05:42', admin: 'risk_officer@marketforge.io', action: 'TOGGLE_MARKET', resource: 'SIMULATION_CLOCK', before: 'OPEN', after: 'NORMAL_SIM', ip: '10.0.4.22', status: 'SUCCESS' },
];

export default function AdminPage() {
  const [marketStatus, setMarketStatus] = useState('OPEN');
  const [simulationSpeed, setSimulationSpeed] = useState('1x');
  const [maxPositionPct, setMaxPositionPct] = useState(25);
  const [maxOrderValue, setMaxOrderValue] = useState(500000);
  const [tradingHoursOnly, setTradingHoursOnly] = useState(false);

  return (
    <div style={{ background: '#030807', minHeight: 'calc(100vh - 80px)', color: '#DDFBEA', fontFamily: 'var(--font-mono)', padding: '24px' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ color: '#FF4D67', fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>
              RESTRICTED OPERATIONS TERMINAL • LEVEL 4 AUTHORIZED
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#DDFBEA', margin: '4px 0 0 0' }}>
              MarketForge Mission Control
            </h1>
            <p style={{ color: '#71877B', fontSize: '12px', margin: '4px 0 0 0' }}>
              Real-time exchange telemetry, market simulation switches, data provider feeds, and risk rule controls.
            </p>
          </div>

          {/* Quick Simulation State Toggle */}
          <div style={{ display: 'flex', gap: '8px', background: '#07130F', padding: '6px', borderRadius: '2px', border: '1px solid rgba(57, 255, 136, 0.2)' }}>
            {['OPEN', 'PAUSED', 'CLOSED'].map((st) => (
              <button
                key={st}
                onClick={() => setMarketStatus(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '2px',
                  background: marketStatus === st ? (st === 'OPEN' ? '#39FF88' : st === 'PAUSED' ? '#38D9FF' : '#FF4D67') : 'transparent',
                  color: marketStatus === st ? '#030807' : '#71877B',
                  fontWeight: 900,
                  fontSize: '11px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* 1. Operational KPI Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div style={{ background: '#07130F', border: '1px solid rgba(57, 255, 136, 0.2)', padding: '16px', borderRadius: '2px' }}>
            <div style={{ fontSize: '10px', color: '#71877B' }}>ACTIVE LEARNERS</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#39FF88', marginTop: '4px' }}>1,482</div>
            <div style={{ fontSize: '10px', color: '#94B8A3', marginTop: '2px' }}>+12% this week</div>
          </div>

          <div style={{ background: '#07130F', border: '1px solid rgba(57, 255, 136, 0.2)', padding: '16px', borderRadius: '2px' }}>
            <div style={{ fontSize: '10px', color: '#71877B' }}>VIRTUAL CAPITAL DEPLOYED</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#38D9FF', marginTop: '4px' }}>₹14.8 Cr</div>
            <div style={{ fontSize: '10px', color: '#94B8A3', marginTop: '2px' }}>₹1,00,000 / account</div>
          </div>

          <div style={{ background: '#07130F', border: '1px solid rgba(57, 255, 136, 0.2)', padding: '16px', borderRadius: '2px' }}>
            <div style={{ fontSize: '10px', color: '#71877B' }}>ORDERS MATCHED TODAY</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#DDFBEA', marginTop: '4px' }}>8,914</div>
            <div style={{ fontSize: '10px', color: '#39FF88', marginTop: '2px' }}>100% Deterministic</div>
          </div>

          <div style={{ background: '#07130F', border: '1px solid rgba(57, 255, 136, 0.2)', padding: '16px', borderRadius: '2px' }}>
            <div style={{ fontSize: '10px', color: '#71877B' }}>NSE SECURITIES MASTER</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#39FF88', marginTop: '4px' }}>2,620</div>
            <div style={{ fontSize: '10px', color: '#94B8A3', marginTop: '2px' }}>SQLite Persistence</div>
          </div>

          <div style={{ background: '#07130F', border: '1px solid rgba(57, 255, 136, 0.2)', padding: '16px', borderRadius: '2px' }}>
            <div style={{ fontSize: '10px', color: '#71877B' }}>RISK WARNINGS GENERATED</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#FF4D67', marginTop: '4px' }}>342</div>
            <div style={{ fontSize: '10px', color: '#71877B', marginTop: '2px' }}>Oversized orders caught</div>
          </div>
        </div>

        {/* 2. Market Controls & Risk Rule Adjustments */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
          {/* Market Simulation Controls */}
          <div style={{ background: '#07130F', border: '1px solid rgba(57, 255, 136, 0.2)', padding: '20px', borderRadius: '2px' }}>
            <div style={{ fontSize: '13px', fontWeight: 900, color: '#39FF88', marginBottom: '14px' }}>
              EXCHANGE SIMULATION CONTROLS
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#DDFBEA' }}>Simulation Clock Speed</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['1x', '2x', '5x', '10x'].map((sp) => (
                    <button
                      key={sp}
                      onClick={() => setSimulationSpeed(sp)}
                      style={{
                        padding: '4px 10px',
                        background: simulationSpeed === sp ? '#0B3D2E' : '#030807',
                        border: simulationSpeed === sp ? '1px solid #39FF88' : '1px solid rgba(57, 255, 136, 0.15)',
                        color: simulationSpeed === sp ? '#39FF88' : '#71877B',
                        borderRadius: '2px',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#DDFBEA' }}>Trading Hours Enforcement</span>
                <button
                  onClick={() => setTradingHoursOnly(!tradingHoursOnly)}
                  style={{
                    padding: '4px 14px',
                    background: tradingHoursOnly ? '#0B3D2E' : 'rgba(255, 77, 103, 0.1)',
                    border: tradingHoursOnly ? '1px solid #39FF88' : '1px solid #FF4D67',
                    color: tradingHoursOnly ? '#39FF88' : '#FF4D67',
                    borderRadius: '2px',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {tradingHoursOnly ? 'ENFORCE 09:15 - 15:30 IST' : '24/7 SANDBOX MODE'}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#DDFBEA' }}>Matching Engine Latency</span>
                <span style={{ color: '#39FF88', fontWeight: 800 }}>0.85ms (Local in-memory)</span>
              </div>
            </div>
          </div>

          {/* Risk Rule Engine Parameters */}
          <div style={{ background: '#07130F', border: '1px solid rgba(57, 255, 136, 0.2)', padding: '20px', borderRadius: '2px' }}>
            <div style={{ fontSize: '13px', fontWeight: 900, color: '#38D9FF', marginBottom: '14px' }}>
              DETERMINISTIC RISK RULE THRESHOLDS
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#DDFBEA' }}>Max Single Position Concentration:</span>
                  <span style={{ color: '#39FF88', fontWeight: 800 }}>{maxPositionPct}% of Portfolio</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={maxPositionPct}
                  onChange={(e) => setMaxPositionPct(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#39FF88' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#DDFBEA' }}>Max Order Value Cap:</span>
                  <span style={{ color: '#38D9FF', fontWeight: 800 }}>₹{maxOrderValue.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="1000000"
                  step="50000"
                  value={maxOrderValue}
                  onChange={(e) => setMaxOrderValue(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#38D9FF' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                <span style={{ color: '#71877B' }}>Rule Sync State:</span>
                <span style={{ color: '#39FF88', fontWeight: 800 }}>ACTIVE IN DATABASE</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Data Providers Health Table */}
        <div style={{ background: '#07130F', border: '1px solid rgba(57, 255, 136, 0.2)', padding: '20px', borderRadius: '2px', marginBottom: '28px' }}>
          <div style={{ fontSize: '13px', fontWeight: 900, color: '#39FF88', marginBottom: '12px' }}>
            EXTERNAL DATA PROVIDER SYNC MONITOR
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11px' }}>
              <thead>
                <tr style={{ color: '#71877B', borderBottom: '1px solid rgba(57, 255, 136, 0.15)', background: '#050B09' }}>
                  <th style={{ padding: '8px 12px' }}>PROVIDER</th>
                  <th style={{ padding: '8px 12px' }}>PURPOSE</th>
                  <th style={{ padding: '8px 12px' }}>STATUS</th>
                  <th style={{ padding: '8px 12px' }}>LATENCY</th>
                  <th style={{ padding: '8px 12px' }}>LAST SYNC</th>
                  <th style={{ padding: '8px 12px' }}>RECORDS LOADED</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>ERRORS</th>
                </tr>
              </thead>
              <tbody>
                {DATA_PROVIDERS.map((p) => (
                  <tr key={p.name} style={{ borderBottom: '1px solid rgba(57, 255, 136, 0.05)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: '#38D9FF' }}>{p.name}</td>
                    <td style={{ padding: '10px 12px', color: '#DDFBEA' }}>{p.type}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '2px',
                          fontSize: '10px',
                          fontWeight: 800,
                          background: p.status === 'ONLINE' || p.status === 'SYNCED' ? 'rgba(57, 255, 136, 0.15)' : 'rgba(56, 217, 255, 0.15)',
                          color: p.status === 'ONLINE' || p.status === 'SYNCED' ? '#39FF88' : '#38D9FF',
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#94B8A3' }}>{p.latency}</td>
                    <td style={{ padding: '10px 12px', color: '#71877B' }}>{p.lastSync}</td>
                    <td style={{ padding: '10px 12px', color: '#DDFBEA', fontWeight: 700 }}>{p.records}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: p.errors === 0 ? '#39FF88' : '#FF4D67', fontWeight: 800 }}>
                      {p.errors}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Immutable Audit Trail */}
        <div style={{ background: '#07130F', border: '1px solid rgba(57, 255, 136, 0.2)', padding: '20px', borderRadius: '2px' }}>
          <div style={{ fontSize: '13px', fontWeight: 900, color: '#38D9FF', marginBottom: '12px' }}>
            IMMUTABLE ADMINISTRATIVE AUDIT LOG
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11px' }}>
              <thead>
                <tr style={{ color: '#71877B', borderBottom: '1px solid rgba(57, 255, 136, 0.15)', background: '#050B09' }}>
                  <th style={{ padding: '8px 12px' }}>TIMESTAMP</th>
                  <th style={{ padding: '8px 12px' }}>ADMIN</th>
                  <th style={{ padding: '8px 12px' }}>ACTION</th>
                  <th style={{ padding: '8px 12px' }}>RESOURCE</th>
                  <th style={{ padding: '8px 12px' }}>BEFORE</th>
                  <th style={{ padding: '8px 12px' }}>AFTER</th>
                  <th style={{ padding: '8px 12px' }}>IP ADDRESS</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {AUDIT_LOGS.map((log, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(57, 255, 136, 0.05)' }}>
                    <td style={{ padding: '8px 12px', color: '#71877B' }}>{log.timestamp}</td>
                    <td style={{ padding: '8px 12px', color: '#38D9FF', fontWeight: 700 }}>{log.admin}</td>
                    <td style={{ padding: '8px 12px', color: '#DDFBEA' }}>{log.action}</td>
                    <td style={{ padding: '8px 12px', color: '#94B8A3' }}>{log.resource}</td>
                    <td style={{ padding: '8px 12px', color: '#71877B' }}>{log.before}</td>
                    <td style={{ padding: '8px 12px', color: '#39FF88', fontWeight: 700 }}>{log.after}</td>
                    <td style={{ padding: '8px 12px', color: '#71877B' }}>{log.ip}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: '#39FF88', fontWeight: 800 }}>
                      {log.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
