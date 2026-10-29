'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../../../lib/api/client.js';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    apiClient('/admin/analytics')
      .then((data) => setAnalytics(data))
      .catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>← Back to Admin Console</Link>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem' }}>Platform Usage & Engine Analytics</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Total Registered Learners</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>{analytics?.userCount ?? 1}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Total Orders Evaluated</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>{analytics?.orderCount ?? 0}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Matched Executions</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>{analytics?.tradeCount ?? 0}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Active Listed Securities</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px', color: 'var(--accent-cyan)' }}>
            {analytics?.activeSecurities ?? 49}
          </div>
        </div>
      </div>
    </div>
  );
}
