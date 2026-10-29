'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../../../lib/api/client.js';

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    apiClient('/admin/challenges')
      .then((data) => setChallenges(data || []))
      .catch(() => setChallenges([]));
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>← Back to Admin Console</Link>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem' }}>Challenges & Quests Editor</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {challenges.map((c) => (
          <div key={c.id} className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 700 }}>{c.type}</span>
              <span style={{ fontSize: '12px', color: 'var(--accent-purple)', fontWeight: 700 }}>+{c.rewardXp} XP</span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>{c.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.4 }}>{c.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
