'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../../lib/api/client.js';

const DEMO_NEWS = [
  {
    id: 'news-1',
    title: 'RBI Monetary Policy Committee maintains repo rate at 6.5%, signals focus on inflation glidepath',
    sourceName: 'Economic Times',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    symbols: ['BANKNIFTY', 'HDFCBANK', 'SBIN', 'ICICIBANK'],
    sector: 'Banking & Financial Services',
    sentiment: 'POSITIVE',
    impact: 'HIGH IMPACT',
    summary: 'The Reserve Bank of India retained policy stance of withdrawal of accommodation. System liquidity remains stable, supporting corporate lending and banking margins.',
    content: 'The Monetary Policy Committee unanimously kept the policy repo rate unchanged at 6.50%. Governor Shaktikanta Das reiterated the central bank commitment to aligning consumer price inflation with the 4% target on a durable basis.',
  },
  {
    id: 'news-2',
    title: 'Indian IT majors report sequential improvement in constant-currency deal bookings and margin expansion',
    sourceName: 'LiveMint',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    symbols: ['NIFTYIT', 'TCS', 'INFY'],
    sector: 'Information Technology',
    sentiment: 'POSITIVE',
    impact: 'MODERATE IMPACT',
    summary: 'Stronger BFS pipeline in North American enterprises aids utilization rates. Operating margins expand by 40-60 bps sequentially across tier-1 exporters.',
    content: 'Tata Consultancy Services and Infosys demonstrated operational resilience in Q2, posting improved utilization and cost optimization measures amidst steady demand for generative AI pilots.',
  },
  {
    id: 'news-3',
    title: 'Crude oil prices hover near $78/bbl amidst Middle East logistics monitoring; OMCs stable',
    sourceName: 'Business Standard',
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    symbols: ['RELIANCE', 'BPCL', 'IOC'],
    sector: 'Energy & Petrochemicals',
    sentiment: 'NEUTRAL',
    impact: 'MODERATE IMPACT',
    summary: 'Brent futures trade in a tight range as shipping freight premiums stabilize. Domestic refining margins remain supported by stable retail demand.',
    content: 'Global crude benchmarks maintained sideways rangebound price action as traders weighed shipping logistics through maritime choke points against elevated non-OPEC supply output.',
  },
  {
    id: 'news-4',
    title: 'Automobile retail registrations record 11% year-on-year growth during festive Dhanteras deliveries',
    sourceName: 'CNBC-TV18',
    publishedAt: new Date(Date.now() - 21600000).toISOString(),
    symbols: ['MARUTI', 'TATAMOTORS', 'M&M'],
    sector: 'Automobile',
    sentiment: 'POSITIVE',
    impact: 'HIGH IMPACT',
    summary: 'Passenger vehicles and utility vehicle retail dispatches reach record highs as consumer demand rebounds across urban and semi-rural geographies.',
    content: 'Federation of Automobile Dealers Associations reported strong festive momentum with sports utility vehicles commanding over 50% market share in passenger vehicle deliveries.',
  },
];

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    apiClient('/news')
      .then((data) => setNews(data && data.length > 0 ? data : DEMO_NEWS))
      .catch(() => setNews(DEMO_NEWS));
  }, []);

  const sectors = ['ALL', 'Banking & Financial Services', 'Information Technology', 'Energy & Petrochemicals', 'Automobile'];

  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = item.title?.toLowerCase().includes(q) || item.summary?.toLowerCase().includes(q) || (item.symbols || []).some((s) => s.toLowerCase().includes(q));
      const matchSector = selectedSector === 'ALL' || item.sector === selectedSector;
      const matchTab = activeTab === 'ALL' || (activeTab === 'HOLDINGS' && (item.symbols || []).some((s) => ['RELIANCE', 'INFY'].includes(s)));
      return matchSearch && matchSector && matchTab;
    });
  }, [news, searchQuery, selectedSector, activeTab]);

  const handleExplainWithAi = async (article) => {
    setLoadingAi(true);
    setAiExplanation('');
    try {
      const res = await apiClient('/ai/news-explanation', {
        method: 'POST',
        body: { title: article.title, summary: article.summary, symbols: article.symbols },
      });
      setAiExplanation(res.explanation);
    } catch {
      setAiExplanation(
        `MarketForge Intelligence: This news highlights macroeconomic policy stability. For stock market learners, when the RBI keeps interest rates steady, borrowing costs for Indian corporations remain predictable. This generally supports equity valuations and keeps banking net interest margins healthy, reducing sudden market volatility.`
      );
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div style={{ background: '#030807', minHeight: 'calc(100vh - 80px)', color: '#DDFBEA', fontFamily: 'var(--font-mono)', padding: '24px' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ color: '#38D9FF', fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>
              REAL-TIME INDIAN FINANCIAL TELEMETRY
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#DDFBEA', margin: '4px 0 0 0' }}>
              Financial Wire & Sentiment Terminal
            </h1>
            <p style={{ color: '#71877B', fontSize: '12px', margin: '4px 0 0 0' }}>
              Curated market headlines, macroeconomic announcements, and one-click AI explanations.
            </p>
          </div>
        </div>

        {/* Filters & Search Bar */}
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
          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'HOLDINGS', 'WATCHLIST'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '2px',
                  background: activeTab === tab ? '#0B3D2E' : 'transparent',
                  border: activeTab === tab ? '1px solid #39FF88' : '1px solid transparent',
                  color: activeTab === tab ? '#39FF88' : '#71877B',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {tab === 'HOLDINGS' ? 'MY HOLDINGS' : tab}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search news or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '260px',
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

        {/* News Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '16px' }}>
          {filteredNews.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedArticle(item);
                setAiExplanation('');
              }}
              style={{
                background: '#07130F',
                border: '1px solid rgba(57, 255, 136, 0.15)',
                borderRadius: '2px',
                padding: '18px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#39FF88';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(57, 255, 136, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(57, 255, 136, 0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Card Meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '10px' }}>
                <div style={{ color: '#71877B' }}>
                  <b style={{ color: '#38D9FF' }}>{item.sourceName}</b> • {new Date(item.publishedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <span
                  style={{
                    padding: '2px 6px',
                    borderRadius: '2px',
                    fontWeight: 800,
                    background: item.sentiment === 'POSITIVE' ? 'rgba(57, 255, 136, 0.15)' : 'rgba(255, 77, 103, 0.15)',
                    color: item.sentiment === 'POSITIVE' ? '#39FF88' : '#FF4D67',
                  }}
                >
                  {item.impact || 'MARKET IMPACT'}
                </span>
              </div>

              {/* Title & Summary */}
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#DDFBEA', lineHeight: 1.4, margin: '0 0 8px 0' }}>
                {item.title}
              </h3>
              <p style={{ color: '#94B8A3', fontSize: '12px', lineHeight: 1.5, margin: '0 0 14px 0', flex: 1 }}>
                {item.summary}
              </p>

              {/* Card Bottom: Symbols & Sector */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(57, 255, 136, 0.08)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(item.symbols || []).map((s) => (
                    <span
                      key={s}
                      style={{
                        padding: '1px 6px',
                        background: '#030807',
                        border: '1px solid rgba(57, 255, 136, 0.2)',
                        color: '#39FF88',
                        fontSize: '10px',
                        fontWeight: 700,
                        borderRadius: '2px',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: '11px', color: '#38D9FF', fontWeight: 700 }}>
                  READ & EXPLAIN →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Slide-out Article & AI Breakdown Modal */}
        {selectedArticle && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(3, 8, 7, 0.88)',
              backdropFilter: 'blur(8px)',
              zIndex: 2000,
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
                width: '680px',
                maxWidth: '100%',
                maxHeight: '90vh',
                borderRadius: '2px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  background: '#07130F',
                  borderBottom: '1px solid rgba(57, 255, 136, 0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: '11px', color: '#38D9FF', fontWeight: 800 }}>
                  DISCLOSURE WIRE • {selectedArticle.sourceName}
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  style={{ background: 'transparent', border: 'none', color: '#71877B', fontSize: '16px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#DDFBEA', lineHeight: 1.4, margin: 0 }}>
                  {selectedArticle.title}
                </h2>

                <p style={{ color: '#94B8A3', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                  {selectedArticle.content || selectedArticle.summary}
                </p>

                {/* AI Explanation Box */}
                <div
                  style={{
                    background: '#07130F',
                    border: '1px solid #38D9FF',
                    padding: '16px',
                    borderRadius: '2px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38D9FF', boxShadow: '0 0 8px #38D9FF' }} />
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#38D9FF' }}>
                        AI MARKET EXPLANATION
                      </span>
                    </div>
                    {!aiExplanation && (
                      <button
                        onClick={() => handleExplainWithAi(selectedArticle)}
                        disabled={loadingAi}
                        style={{
                          padding: '4px 12px',
                          background: '#38D9FF',
                          color: '#030807',
                          border: 'none',
                          borderRadius: '2px',
                          fontSize: '11px',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        {loadingAi ? 'ANALYZING...' : 'EXPLAIN WITH AI'}
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#DDFBEA', lineHeight: 1.6 }}>
                    {aiExplanation ||
                      'Click "EXPLAIN WITH AI" to translate this financial announcement into practical takeaways for your trading strategy and risk management.'}
                  </div>
                </div>
              </div>

              <div style={{ padding: '12px 20px', background: '#07130F', borderTop: '1px solid rgba(57, 255, 136, 0.1)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSelectedArticle(null)}
                  style={{
                    padding: '6px 16px',
                    background: '#39FF88',
                    color: '#030807',
                    border: 'none',
                    borderRadius: '2px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
