'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/api/client.js';

export default function LearnPage() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient('/learning/lessons')
      .then((data) => setLessons(data || []))
      .catch(() => setLessons([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Financial Curriculum & Skill Tree</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '0.25rem' }}>
          Interactive modules covering Indian market structures, risk rules, and order execution.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {lessons.map((l) => (
          <Link
            key={l.id}
            href={`/learn/${l.id}`}
            className="glass-panel glass-panel-interactive"
            style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--accent-cyan)',
                  background: 'rgba(0, 229, 255, 0.08)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {l.skillArea?.replace(/_/g, ' ')}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {l.estimatedMinutes || 5} MINS
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3 }}>
              {l.title}
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5, marginBottom: '1.5rem', flex: 1 }}>
              {l.summary}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Difficulty: Level {l.difficulty || 1}</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Start Lesson →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
