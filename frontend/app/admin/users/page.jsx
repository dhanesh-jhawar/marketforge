'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../../../lib/api/client.js';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient('/admin/users')
      .then((data) => setUsers(data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>← Back to Admin Console</Link>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem' }}>User & Learner Management</h1>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '12px' }}>
              <th style={{ padding: '1rem 1.25rem' }}>NAME</th>
              <th style={{ padding: '1rem 1.25rem' }}>EMAIL</th>
              <th style={{ padding: '1rem 1.25rem' }}>EXPERIENCE</th>
              <th style={{ padding: '1rem 1.25rem' }}>XP</th>
              <th style={{ padding: '1rem 1.25rem' }}>ONBOARDED</th>
              <th style={{ padding: '1rem 1.25rem' }}>JOINED</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>{u.displayName}</td>
                <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', background: 'rgba(0, 229, 255, 0.08)', color: 'var(--accent-cyan)' }}>
                    {u.experienceLevel || 'BEGINNER'}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--accent-purple)' }}>{u.xp || 0}</td>
                <td style={{ padding: '1rem 1.25rem' }}>{u.onboardingComplete ? '✔ Yes' : 'Pending'}</td>
                <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '12px' }}>
                  {new Date(u.createdAt).toLocaleDateString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
