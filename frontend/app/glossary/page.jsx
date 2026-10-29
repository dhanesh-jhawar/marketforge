'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../../lib/api/client.js';

const GLOSSARY_CATEGORIES = [
  { id: 'ALL', label: 'All Terms' },
  { id: 'MARKET STRUCTURE', label: 'Market Structure' },
  { id: 'TRADING & ORDERS', label: 'Trading & Orders' },
  { id: 'FUNDAMENTALS', label: 'Fundamentals' },
  { id: 'TECHNICALS', label: 'Technicals' },
  { id: 'DERIVATIVES & RISK', label: 'Derivatives & Risk' },
  { id: 'REGULATORY & ACTIONS', label: 'Regulatory & Actions' },
];

export default function GlossaryPage() {
  const [terms, setTerms] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient('/glossary')
      .then((data) => setTerms(Array.isArray(data) ? data : []))
      .catch(() => setTerms([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return terms.filter((t) => {
      const catMatch =
        selectedCategory === 'ALL' ||
        (t.category && t.category.toUpperCase() === selectedCategory.toUpperCase());

      const q = search.toLowerCase().trim();
      const searchMatch =
        !q ||
        t.term?.toLowerCase().includes(q) ||
        t.definition?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        t.example?.toLowerCase().includes(q);

      return catMatch && searchMatch;
    });
  }, [terms, selectedCategory, search]);

  return (
    <div style={{ background: '#030807', minHeight: 'calc(100vh - 80px)', color: '#DDFBEA', fontFamily: 'var(--font-mono)', padding: '28px 24px' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ color: '#39FF88', fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>
              INDIAN FINANCIAL VOCABULARY & ENCYCLOPEDIA
            </div>
            <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#DDFBEA', margin: '4px 0 0 0' }}>
              Financial Glossary & Dictionary
            </h1>
            <p style={{ color: '#71877B', fontSize: '13px', margin: '4px 0 0 0' }}>
              Authoritative definitions of Indian financial terminology (LTP, CNC, MIS, STT, NSDL/CDSL, P/E, Beta, F&O, Circuit Breakers).
            </p>
          </div>

          <div
            style={{
              background: '#07130F',
              border: '1px solid #39FF88',
              padding: '12px 20px',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', color: '#71877B' }}>TOTAL VOCABULARY</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#39FF88' }}>{terms.length} TERMS</div>
            </div>
            <div style={{ height: '28px', width: '1px', background: 'rgba(57, 255, 136, 0.2)' }} />
            <div>
              <div style={{ fontSize: '10px', color: '#71877B' }}>ACTIVE FILTER</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#38D9FF' }}>{filtered.length} MATCHING</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs and Search Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {GLOSSARY_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              const count = cat.id === 'ALL'
                ? terms.length
                : terms.filter((t) => t.category?.toUpperCase() === cat.id.toUpperCase()).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '2px',
                    background: active ? '#0B3D2E' : '#07130F',
                    border: active ? '1px solid #39FF88' : '1px solid rgba(57, 255, 136, 0.15)',
                    color: active ? '#39FF88' : '#71877B',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{cat.label}</span>
                  <span style={{ fontSize: '10px', opacity: 0.8 }}>({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <input
            type="text"
            placeholder="Search 40+ terms (e.g. LTP, CNC, STT, P/E, Circuit)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '2px',
              background: '#07130F',
              border: '1px solid rgba(57, 255, 136, 0.25)',
              color: '#DDFBEA',
              fontSize: '12px',
              minWidth: '300px',
              fontFamily: 'var(--font-mono)',
            }}
          />
        </div>

        {/* Glossary Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#39FF88' }}>
            INITIALIZING FINANCIAL VOCABULARY...
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '16px',
            }}
          >
            {filtered.map((t) => (
              <div
                key={t.id || t.term}
                style={{
                  background: '#07130F',
                  border: '1px solid rgba(57, 255, 136, 0.15)',
                  borderRadius: '2px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'border 0.2s ease, transform 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#38D9FF', margin: 0 }}>
                    {t.term}
                  </h3>
                  <span
                    style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      color: '#39FF88',
                      background: 'rgba(57, 255, 136, 0.1)',
                      border: '1px solid rgba(57, 255, 136, 0.25)',
                      padding: '2px 8px',
                      borderRadius: '2px',
                      fontWeight: 700,
                    }}
                  >
                    {t.category || 'Trading'}
                  </span>
                </div>

                <p style={{ color: '#DDFBEA', fontSize: '13px', lineHeight: 1.55, margin: '8px 0 14px 0', flex: 1 }}>
                  {t.definition}
                </p>

                {t.example && (
                  <div
                    style={{
                      borderTop: '1px solid rgba(57, 255, 136, 0.1)',
                      paddingTop: '10px',
                      fontSize: '12px',
                      color: '#94B8A3',
                      lineHeight: 1.45,
                    }}
                  >
                    <b style={{ color: '#71877B' }}>Eg:</b> {t.example}
                  </div>
                )}
              </div>
            ))}

            {filtered.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '60px', color: '#71877B', gridColumn: '1 / -1' }}>
                No financial glossary terms match "{search}".
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
