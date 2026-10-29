'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminMarketControlsPage() {
  const [halted, setHalted] = useState(false);
  const [slippage, setSlippage] = useState(5);
  const [brokerage, setBrokerage] = useState(20);

  const handleToggleHalt = () => {
    const next = !halted;
    setHalted(next);
    alert(`Market simulation ${next ? 'HALTED' : 'RESUMED'}.`);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>← Back to Admin Console</Link>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem' }}>Market Simulation Controls</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '0.25rem' }}>
          Global controls for simulated market trading hours, fee schedules, and matching parameters.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Emergency Kill-Switch */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: halted ? 'var(--color-bearish)' : 'var(--text-primary)' }}>
              Simulation Kill-Switch: {halted ? 'HALTED' : 'ACTIVE'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
              Instantly pause order matching and freeze prices across all user desks.
            </p>
          </div>
          <button
            onClick={handleToggleHalt}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: halted ? 'var(--color-bullish)' : 'var(--color-bearish)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '13px',
            }}
          >
            {halted ? 'Resume Trading' : 'Halt Simulation'}
          </button>
        </div>

        {/* Slippage & Fee Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Simulated Slippage (Basis Points)
            </label>
            <input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              style={{
                width: '120px',
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Flat Virtual Brokerage per Order (₹)
            </label>
            <input
              type="number"
              value={brokerage}
              onChange={(e) => setBrokerage(e.target.value)}
              style={{
                width: '120px',
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
