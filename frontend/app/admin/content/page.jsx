'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../../../lib/api/client.js';

export default function AdminContentPage() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    apiClient('/admin/content')
      .then((data) => setContent(data))
      .catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>← Back to Admin Console</Link>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem' }}>Curriculum & Content Management</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Published Lessons</h3>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
            {content?.lessons?.length ?? 0}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '0.5rem' }}>
            Modules spanning market basics, order types, and risk sizing.
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Quizzes</h3>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
            {content?.quizzes?.length ?? 0}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '0.5rem' }}>
            Graded assessments tied to skill tracking.
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Glossary Terms</h3>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-bullish)' }}>
            {content?.glossary?.length ?? 0}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '0.5rem' }}>
            Financial definitions and trading abbreviations.
          </div>
        </div>
      </div>
    </div>
  );
}
