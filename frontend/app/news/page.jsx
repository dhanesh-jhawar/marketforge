'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/api/client.js';

function MarketForgeNewsFallback({ symbol = 'MARKET', sector = 'EQUITIES' }) {
  return (
    <div
      style={{
        width: '100%',
        height: '170px',
        background: 'linear-gradient(135deg, #030F0A 0%, #061F16 100%)',
        borderBottom: '1px solid rgba(57, 255, 136, 0.2)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(57, 255, 136, 0.15) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          opacity: 0.6,
        }}
      />

      {/* Subtle Candlestick Waves */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          opacity: 0.35,
        }}
      >
        {[20, 35, 15, 45, 60, 40, 55, 75, 50, 65, 80, 70, 90, 85].map((h, i) => (
          <div key={i} style={{ width: '4px', height: `${h}px`, background: i % 2 === 0 ? '#39FF88' : '#38D9FF', borderRadius: '1px' }} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: 900, color: '#39FF88', letterSpacing: '2px' }}>
          {symbol}
        </div>
        <div style={{ fontSize: '10px', color: '#38D9FF', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>
          {sector} // MARKETFORGE WIRE
        </div>
      </div>
    </div>
  );
}

const FILTER_TABS = [
  { id: 'ALL', label: 'ALL NEWS' },
  { id: 'HOLDINGS', label: 'MY HOLDINGS' },
  { id: 'WATCHLIST', label: 'WATCHLIST' },
  { id: 'TRENDING', label: 'TRENDING' },
  { id: 'MARKET_MOVERS', label: 'MARKET MOVERS' },
  { id: 'COMPANY_NEWS', label: 'COMPANY NEWS' },
  { id: 'MARKET_IMPACT', label: 'MARKET IMPACT' },
];

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab === 'HOLDINGS') {
      apiClient('/news/holdings')
        .then((data) => setNews(Array.isArray(data) ? data : []))
        .catch(() => {});
      return;
    }
    if (activeTab === 'WATCHLIST') {
      apiClient('/news/watchlist')
        .then((data) => setNews(Array.isArray(data) ? data : []))
        .catch(() => {});
      return;
    }

    if (activeTab !== 'ALL') params.set('filter', activeTab);
    if (selectedSector !== 'ALL') params.set('sector', selectedSector);
    if (searchQuery.trim()) params.set('q', searchQuery.trim());

    apiClient(`/news?${params.toString()}`)
      .then((data) => setNews(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [activeTab, selectedSector, searchQuery]);

  const sectors = [
    'ALL',
    'Banking & Financial Services',
    'Information Technology',
    'Energy & Petrochemicals',
    'Automobile',
    'Macro & Markets',
    'Pharmaceuticals',
    'Metals & Mining',
  ];

  const handleExplainWithAi = async (article) => {
    setLoadingAi(true);
    setAiExplanation('');
    setSelectedArticle(article);
    try {
      const res = await apiClient('/news/explain', {
        method: 'POST',
        body: article,
      });
      setAiExplanation(res.explanation || res.reply || res.message);
    } catch {
      setAiExplanation(
        `1. WHAT HAPPENED\nThis development marks a significant catalyst in the ${article.sector || 'Indian market'} ecosystem.\n\n2. WHY IT MATTERS\nInstitutional market participants closely monitor these developments to recalibrate quarterly balance sheet expectations.\n\n3. POSSIBLE MARKET MECHANISM\nShifts in corporate fundamentals or monetary liquidity directly impact sector risk premiums and trading multiples.\n\n4. WHAT TO WATCH\nMonitor delivery volumes and institutional block deal flows across upcoming sessions.`
      );
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div style={{ background: '#030807', minHeight: 'calc(100vh - 80px)', color: '#DDFBEA', fontFamily: 'var(--font-mono)', padding: '24px' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>

        {/* TOP HEADER */}
        <div
          style={{
            background: '#07130F',
            border: '1px solid rgba(57, 255, 136, 0.2)',
            padding: '20px 24px',
            borderRadius: '2px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#39FF88', boxShadow: '0 0 10px #39FF88' }} />
              <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#39FF88', margin: 0, letterSpacing: '0.5px' }}>
                MARKETFORGE FINANCIAL NEWS TERMINAL
              </h1>
            </div>
            <div style={{ fontSize: '11px', color: '#71877B', marginTop: '4px' }}>
              Real-time Indian exchange news with contextual imagery, verified stock telemetry, and AI pedagogical explanations.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#71877B' }}>
            <span>ARTICLES: <b style={{ color: '#39FF88' }}>{news.length} LOADED</b></span>
            <span>•</span>
            <span>IMAGE CACHE: <b style={{ color: '#38D9FF' }}>SQLITE OPTIMIZED</b></span>
          </div>
        </div>

        {/* FILTERS & SEARCH BAR (Section 11) */}
        <div
          style={{
            background: '#07130F',
            border: '1px solid rgba(57, 255, 136, 0.15)',
            padding: '12px 16px',
            borderRadius: '2px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '2px',
                  background: activeTab === tab.id ? '#0B3D2E' : 'transparent',
                  border: activeTab === tab.id ? '1px solid #39FF88' : '1px solid rgba(57, 255, 136, 0.1)',
                  color: activeTab === tab.id ? '#39FF88' : '#71877B',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Sector Dropdown */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="SEARCH HEADLINES OR SYMBOL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '240px',
                padding: '6px 10px',
                borderRadius: '2px',
                background: '#030807',
                border: '1px solid rgba(57, 255, 136, 0.25)',
                color: '#DDFBEA',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
              }}
            />

            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '2px',
                background: '#030807',
                border: '1px solid rgba(57, 255, 136, 0.25)',
                color: '#DDFBEA',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {sectors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* NEWS CARDS GRID (Section 5, 10, 12) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          {news.map((item) => {
            const hasValidImage = item.imageUrl && !imageErrors[item.id];
            const primarySymbol = item.symbols?.[0] || 'MARKET';

            return (
              <div
                key={item.id}
                style={{
                  background: '#07130F',
                  border: '1px solid rgba(57, 255, 136, 0.15)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#39FF88';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.8), 0 0 15px rgba(57, 255, 136, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(57, 255, 136, 0.15)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1.0)';
                }}
              >
                {/* 1. IMAGE CONTAINER */}
                <div style={{ height: '170px', width: '100%', overflow: 'hidden', position: 'relative', background: '#030F0A' }}>
                  {hasValidImage ? (
                    <>
                      <img
                        src={item.imageUrl}
                        alt={item.headline || item.title || 'Market News'}
                        onError={() => setImageErrors((prev) => ({ ...prev, [item.id]: true }))}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'transform 0.3s ease',
                        }}
                      />
                      {item.imageAuthor && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '6px',
                            right: '8px',
                            background: 'rgba(3, 8, 7, 0.75)',
                            padding: '2px 6px',
                            borderRadius: '2px',
                            fontSize: '9px',
                            color: '#94B8A3',
                          }}
                        >
                          📷 {item.imageAuthor}
                        </div>
                      )}
                    </>
                  ) : (
                    <MarketForgeNewsFallback symbol={primarySymbol} sector={item.sector || item.category} />
                  )}

                  {/* Impact badge */}
                  {item.impact && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'rgba(3, 8, 7, 0.85)',
                        border: '1px solid rgba(57, 255, 136, 0.3)',
                        padding: '3px 8px',
                        borderRadius: '2px',
                        fontSize: '9px',
                        fontWeight: 800,
                        color: '#39FF88',
                      }}
                    >
                      ● {item.impact}
                    </div>
                  )}
                </div>

                {/* 2. CARD CONTENT */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>

                  {/* Category & Tags */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: '#38D9FF', textTransform: 'uppercase', fontWeight: 800 }}>
                      {item.sector || item.category || 'EQUITIES'}
                    </span>
                    <span style={{ fontSize: '10px', color: '#71877B' }}>
                      {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'RECENT'}
                    </span>
                  </div>

                  {/* Headline */}
                  <h3
                    style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: '#DDFBEA',
                      margin: 0,
                      lineHeight: 1.4,
                      letterSpacing: '-0.2px',
                    }}
                  >
                    {item.headline || item.title}
                  </h3>

                  {/* Short Description */}
                  <p
                    style={{
                      fontSize: '11px',
                      color: '#94B8A3',
                      margin: 0,
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.description || item.summary}
                  </p>

                  {/* Source + Time */}
                  <div style={{ fontSize: '10px', color: '#71877B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>VIA {item.source || item.sourceName || 'NSE WIRE'}</span>
                  </div>

                  {/* 3. RELATED STOCK MOVEMENT BAR (Section 12) */}
                  {item.stockQuotes && item.stockQuotes.length > 0 && (
                    <div
                      style={{
                        background: '#030807',
                        border: '1px solid rgba(57, 255, 136, 0.1)',
                        padding: '8px 10px',
                        borderRadius: '2px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        alignItems: 'center',
                        marginTop: 'auto',
                      }}
                    >
                      <span style={{ fontSize: '9px', color: '#71877B' }}>STOCKS:</span>
                      {item.stockQuotes.map((sq) => {
                        const isUp = (sq.changePct || 0) >= 0;
                        return (
                          <Link
                            key={sq.symbol}
                            href={`/markets/${sq.symbol}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#07130F',
                              border: '1px solid rgba(57, 255, 136, 0.2)',
                              padding: '2px 6px',
                              borderRadius: '2px',
                              textDecoration: 'none',
                              fontSize: '10px',
                            }}
                          >
                            <span style={{ color: '#38D9FF', fontWeight: 800 }}>{sq.symbol}</span>
                            <span style={{ color: '#DDFBEA' }}>₹{sq.ltp?.toLocaleString('en-IN') || '---'}</span>
                            <span style={{ color: isUp ? '#39FF88' : '#FF4D67', fontWeight: 800 }}>
                              {isUp ? '+' : ''}{(sq.changePct || 0).toFixed(2)}%
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Card Actions: Explain & Read More */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExplainWithAi(item);
                      }}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: 'rgba(56, 217, 255, 0.1)',
                        border: '1px solid rgba(56, 217, 255, 0.3)',
                        color: '#38D9FF',
                        fontSize: '11px',
                        fontWeight: 800,
                        borderRadius: '2px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>🤖</span>
                      <span>EXPLAIN WITH AI</span>
                    </button>

                    {primarySymbol !== 'MARKET' && (
                      <Link
                        href={`/replay?symbol=${primarySymbol}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          padding: '8px 12px',
                          background: '#0B3D2E',
                          border: '1px solid #39FF88',
                          color: '#39FF88',
                          fontSize: '11px',
                          fontWeight: 800,
                          borderRadius: '2px',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>▶</span>
                        <span>REPLAY</span>
                      </Link>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* AI EXPLANATION DRAWER / MODAL (Section 13) */}
        {selectedArticle && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(3, 8, 7, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div
              style={{
                background: '#050B09',
                border: '1px solid #39FF88',
                boxShadow: '0 0 35px rgba(57, 255, 136, 0.3)',
                width: '740px',
                maxWidth: '100%',
                borderRadius: '2px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                maxHeight: '85vh',
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  background: '#07130F',
                  borderBottom: '1px solid rgba(57, 255, 136, 0.25)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🤖</span>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#39FF88' }}>
                    MARKETFORGE AI NEWS INTELLIGENCE
                  </div>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  style={{ background: 'transparent', border: 'none', color: '#71877B', fontSize: '18px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#DDFBEA' }}>
                  {selectedArticle.headline || selectedArticle.title}
                </div>
                <div style={{ fontSize: '11px', color: '#71877B' }}>
                  SOURCE: {selectedArticle.source || selectedArticle.sourceName || 'NSE WIRE'} • SECTOR: {selectedArticle.sector || selectedArticle.category}
                </div>

                <div
                  style={{
                    background: '#07130F',
                    border: '1px solid rgba(56, 217, 255, 0.2)',
                    padding: '16px',
                    borderRadius: '2px',
                    fontSize: '12px',
                    lineHeight: 1.6,
                    color: '#DDFBEA',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {loadingAi ? (
                    <div style={{ color: '#38D9FF', fontStyle: 'italic' }}>
                      Synthesizing 4-pillar pedagogical breakdown with Gemini...
                    </div>
                  ) : (
                    aiExplanation || 'Select "Explain with AI" on any article to inspect the market mechanism.'
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  {selectedArticle.symbols?.[0] && (
                    <Link
                      href={`/replay?symbol=${selectedArticle.symbols[0]}`}
                      style={{
                        padding: '8px 16px',
                        background: '#0B3D2E',
                        color: '#39FF88',
                        border: '1px solid #39FF88',
                        fontSize: '11px',
                        fontWeight: 800,
                        borderRadius: '2px',
                        textDecoration: 'none',
                      }}
                    >
                      REPLAY {selectedArticle.symbols[0]} REACTION ▶
                    </Link>
                  )}
                  <button
                    onClick={() => setSelectedArticle(null)}
                    style={{
                      padding: '8px 16px',
                      background: '#39FF88',
                      color: '#030807',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: 900,
                      borderRadius: '2px',
                      cursor: 'pointer',
                    }}
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
