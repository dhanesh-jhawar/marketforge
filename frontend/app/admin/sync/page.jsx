'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../../../lib/api/client.js';

export default function AdminSyncPage() {
  const [events, setEvents] = useState([]);
  const [syncing, setSyncing] = useState(false);

  const fetchSync = () => {
    apiClient('/admin/sync')
      .then((data) => setEvents(data || []))
      .catch(() => setEvents([]));
  };

  useEffect(() => {
    fetchSync();
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>← Back to Admin Console</Link>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem' }}>Market Data & Security Master Sync</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '0.25rem' }}>
          Real-time status of data pipeline workers (NSE Security Master, FYERS quotes, News feeds).
        </p>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '12px' }}>
              <th style={{ padding: '1rem 1.25rem' }}>JOB NAME</th>
              <th style={{ padding: '1rem 1.25rem' }}>PROVIDER</th>
              <th style={{ padding: '1rem 1.25rem' }}>STATUS</th>
              <th style={{ padding: '1rem 1.25rem' }}>RECORDS</th>
              <th style={{ padding: '1rem 1.25rem' }}>STARTED AT</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>{ev.job}</td>
                <td style={{ padding: '1rem 1.25rem', color: 'var(--accent-cyan)' }}>{ev.provider}</td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: ev.status === 'SUCCESS' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 51, 102, 0.15)',
                      color: ev.status === 'SUCCESS' ? 'var(--color-bullish)' : 'var(--color-bearish)',
                    }}
                  >
                    {ev.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>{ev.records}</td>
                <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '12px' }}>
                  {new Date(ev.startedAt).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {events.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No recent synchronization events logged.
          </div>
        )}
      </div>
    </div>
  );
}
