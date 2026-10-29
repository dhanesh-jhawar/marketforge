'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/api/client.js';

const CATEGORIES = [
  { id: 'ALL', label: 'All Modules' },
  { id: 'market_basics', label: 'Market Basics' },
  { id: 'order_types', label: 'Order Execution' },
  { id: 'risk_management', label: 'Risk Management' },
  { id: 'technical_analysis', label: 'Technical Analysis' },
  { id: 'fundamental_analysis', label: 'Fundamental Analysis' },
  { id: 'derivatives', label: 'Derivatives (F&O)' },
  { id: 'trading_psychology', label: 'Trading Psychology' },
];

export default function LearnPage() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());

  useEffect(() => {
    // Load lessons and user progress
    Promise.all([
      apiClient('/learning/lessons').catch(() => []),
      apiClient('/learning/progress').catch(() => ({ skills: [] })),
    ])
      .then(([lessonsData, progressData]) => {
        setLessons(Array.isArray(lessonsData) ? lessonsData : []);
        // Check localStorage or progress
        if (typeof window !== 'undefined') {
          try {
            const localCompleted = JSON.parse(localStorage.getItem('marketforge_completed_lessons') || '[]');
            setCompletedLessonIds(new Set(localCompleted));
          } catch {
            // ignore
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredLessons = useMemo(() => {
    return lessons.filter((l) => {
      const matchesCategory = selectedCategory === 'ALL' || l.skillArea === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        l.title?.toLowerCase().includes(q) ||
        l.summary?.toLowerCase().includes(q) ||
        l.skillArea?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [lessons, selectedCategory, searchQuery]);

  return (
    <div style={{ background: '#030807', minHeight: 'calc(100vh - 80px)', color: '#DDFBEA', fontFamily: 'var(--font-mono)', padding: '28px 24px' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {/* Top Curriculum Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ color: '#39FF88', fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>
              INDIAN FINANCIAL MARKETS ACADEMY
            </div>
            <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#DDFBEA', margin: '4px 0 0 0' }}>
              Financial Curriculum & Skill Tree
            </h1>
            <p style={{ color: '#71877B', fontSize: '13px', margin: '4px 0 0 0' }}>
              Comprehensive syllabus covering Indian stock exchanges, order mechanics, valuation, F&O derivatives, and risk discipline.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div
            style={{
              background: '#07130F',
              border: '1px solid #39FF88',
              padding: '12px 20px',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', color: '#71877B' }}>TOTAL MODULES</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#39FF88' }}>{lessons.length} LESSONS</div>
            </div>
            <div style={{ height: '28px', width: '1px', background: 'rgba(57, 255, 136, 0.2)' }} />
            <div>
              <div style={{ fontSize: '10px', color: '#71877B' }}>INTERACTIVE QUIZZES</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#38D9FF' }}>8 MCQ TESTS</div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
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
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
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
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <input
            type="text"
            placeholder="Search topics (e.g., Candlesticks, Derivatives, P/E)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '2px',
              background: '#07130F',
              border: '1px solid rgba(57, 255, 136, 0.25)',
              color: '#DDFBEA',
              fontSize: '12px',
              minWidth: '280px',
              fontFamily: 'var(--font-mono)',
            }}
          />
        </div>

        {/* Modules Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#39FF88' }}>
            LOADING FINANCIAL CURRICULUM...
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '18px',
            }}
          >
            {filteredLessons.map((l) => {
              const isCompleted = completedLessonIds.has(l.id);
              return (
                <Link
                  key={l.id}
                  href={`/learn/${l.id}`}
                  style={{
                    textDecoration: 'none',
                    background: '#07130F',
                    border: isCompleted ? '1px solid #39FF88' : '1px solid rgba(57, 255, 136, 0.15)',
                    boxShadow: isCompleted ? '0 0 15px rgba(57, 255, 136, 0.15)' : 'none',
                    borderRadius: '2px',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'border 0.2s ease, transform 0.2s ease',
                  }}
                >
                  {/* Card Header: Category & Estimated Time */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: '#38D9FF',
                        background: 'rgba(56, 217, 255, 0.12)',
                        border: '1px solid rgba(56, 217, 255, 0.3)',
                        padding: '3px 8px',
                        borderRadius: '2px',
                      }}
                    >
                      {l.skillArea?.replace(/_/g, ' ')}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isCompleted && (
                        <span style={{ fontSize: '10px', color: '#39FF88', fontWeight: 800 }}>✔ COMPLETED</span>
                      )}
                      <span style={{ fontSize: '11px', color: '#71877B' }}>
                        ⏱ {l.estimatedMinutes || 8} MINS
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#DDFBEA', margin: '0 0 10px 0', lineHeight: 1.3 }}>
                    {l.title}
                  </h3>

                  {/* Summary */}
                  <p style={{ color: '#94B8A3', fontSize: '13px', lineHeight: 1.6, margin: '0 0 20px 0', flex: 1 }}>
                    {l.summary}
                  </p>

                  {/* Footer: Quiz & Action */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid rgba(57, 255, 136, 0.1)',
                      paddingTop: '14px',
                      fontSize: '12px',
                    }}
                  >
                    <span style={{ color: '#71877B' }}>
                      Difficulty: Level {l.difficulty || 1} • 📝 MCQ Quiz Included
                    </span>
                    <span style={{ color: '#39FF88', fontWeight: 800, letterSpacing: '0.5px' }}>
                      {isCompleted ? 'REVIEW MODULE →' : 'START LESSON →'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
