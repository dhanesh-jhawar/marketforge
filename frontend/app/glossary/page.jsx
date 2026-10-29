'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api/client.js';

export default function GlossaryPage() {
  const [terms, setTerms] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient('/glossary')
      .then((data) => setTerms(data || []))
      .catch(() => setTerms([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = terms.filter(
    (t) =>
      t.term?.toLowerCase().includes(search.toLowerCase()) ||
      t.definition?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Financial Glossary & Dictionary</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '0.25rem' }}>
            Authoritative definitions of Indian financial terminology (LTP, CNC, MIS, Circuit Filters, STT).
          </p>
        </div>

        <input
          type="text"
          placeholder="Search terms (e.g. LTP, circuit)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            minWidth: '260px',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {filtered.map((t) => (
          <div key={t.id || t.term} className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{t.term}</h3>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {t.category || 'Trading'}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
              {t.definition}
            </p>
            {t.example && (
              <div style={{ marginTop: '0.75rem', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Eg: {t.example}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No glossary terms match your search.
          </div>
        )}
      </div>
    </div>
  );
}
