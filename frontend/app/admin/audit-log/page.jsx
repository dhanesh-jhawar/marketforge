'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../../../lib/api/client.js';

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    apiClient('/admin/audit-log')
      .then((data) => setLogs(data || []))
      .catch(() => setLogs([]));
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>← Back to Admin Console</Link>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem' }}>Administrative Audit Trail</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '0.25rem' }}>
          Tamper-evident record of all system configuration and risk rule changes.
        </p>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '12px' }}>
              <th style={{ padding: '1rem 1.25rem' }}>TIMESTAMP</th>
              <th style={{ padding: '1rem 1.25rem' }}>ACTION</th>
              <th style={{ padding: '1rem 1.25rem' }}>ENTITY</th>
              <th style={{ padding: '1rem 1.25rem' }}>BEFORE</th>
              <th style={{ padding: '1rem 1.25rem' }}>AFTER</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '12px' }}>
                  {new Date(log.createdAt).toLocaleString('en-IN')}
                </td>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {log.action}
                </td>
                <td style={{ padding: '1rem 1.25rem' }}>{log.entityId}</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '12px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {JSON.stringify(log.before || {})}
                </td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '12px', color: 'var(--color-bullish)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {JSON.stringify(log.after || {})}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No audit logs recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
