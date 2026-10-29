'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePortfolio } from '../../hooks/usePortfolio.js';
import { useMarket } from '../../context/MarketContext.jsx';
import { apiClient } from '../../lib/api/client.js';
import { formatINR, formatPct } from '../../lib/formatters/index.js';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const SECTOR_COLORS = ['#00e5ff', '#6366f1', '#00e676', '#a855f7', '#f59e0b', '#ec4899', '#64748b'];

export default function DashboardPage() {
  const { user } = useAuth();
  const { summary, holdings, loading: portfolioLoading } = usePortfolio();
  const { indices } = useMarket();
  const [allocation, setAllocation] = useState({ bySector: [] });
  const [risk, setRisk] = useState(null);
  const [recommendedLessons, setRecommendedLessons] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    apiClient('/portfolio/allocation').then((a) => setAllocation(a || { bySector: [] })).catch(() => {});
    apiClient('/portfolio/risk').then((r) => setRisk(r || null)).catch(() => {});
    apiClient('/learning/recommended').then((l) => setRecommendedLessons(l || [])).catch(() => {});
    apiClient('/news?limit=4').then((n) => setNews(n || [])).catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Top Welcome & KPI Metrics */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ color: 'var(--accent-cyan)', fontSize: '13px', fontWeight: 600 }}>VIRTUAL TRADING COCKPIT</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Welcome back, {user?.displayName || 'Trader'}</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link
            href="/trade"
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #00e5ff 0%, #00b4d8 100%)',
              color: 'var(--text-inverse)',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            + Place New Order
          </Link>
          <Link
            href="/ai"
            className="glass-panel glass-panel-interactive"
            style={{ padding: '0.65rem 1.25rem', fontSize: '14px', color: 'var(--accent-cyan)', fontWeight: 600 }}
          >
            Ask AI Mentor
          </Link>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Total Portfolio Value</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem' }}>
            {formatINR(summary?.totalValue || 1000000)}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem', fontSize: '13px' }}>
            <span style={{ color: (summary?.totalPnl || 0) >= 0 ? 'var(--color-bullish)' : 'var(--color-bearish)', fontWeight: 600 }}>
              {formatINR(summary?.totalPnl || 0, { showSign: true })} ({formatPct(summary?.totalPnlPct || 0)})
            </span>
            <span style={{ color: 'var(--text-muted)' }}>all-time</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Available Cash Buffer</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--accent-cyan)' }}>
            {formatINR(summary?.funds?.availableCash || 1000000)}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '0.5rem' }}>
            Blocked in orders: {formatINR(summary?.funds?.blockedMargin || 0)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Diversification Health</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem' }}>
            {risk?.diversificationScore ?? 75}
            <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400 }}> / 100</span>
          </div>
          <div style={{ color: 'var(--color-bullish)', fontSize: '13px', marginTop: '0.5rem' }}>
            Risk Level: {risk?.riskLevel || 'MODERATE'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Learning XP & Mastery</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--accent-purple)' }}>
            {user?.xp || 250} XP
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '0.5rem' }}>
            Rank: Level 2 Apprentice
          </div>
        </div>
      </div>

      {/* Main Grid: Holdings & Sector Allocation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Active Holdings Table */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Your Holdings ({holdings.length})</h3>
            <Link href="/portfolio" style={{ fontSize: '13px', color: 'var(--accent-cyan)' }}>View All →</Link>
          </div>

          {holdings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '14px' }}>
              No open holdings yet. <Link href="/trade" style={{ color: 'var(--accent-cyan)' }}>Place your first order</Link>.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {holdings.slice(0, 5).map((h) => {
                const isUp = h.pnl >= 0;
                return (
                  <div
                    key={h.symbol}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{h.symbol}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                        {h.quantity} shares • Avg {formatINR(h.avgPrice)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{formatINR(h.currentValue)}</div>
                      <div style={{ fontSize: '12px', color: isUp ? 'var(--color-bullish)' : 'var(--color-bearish)', fontWeight: 600 }}>
                        {formatINR(h.pnl, { showSign: true })} ({formatPct(h.pnlPct)})
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Lightweight Sector Allocation via Recharts */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Sector Diversification</h3>
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation.bySector || []}
                  dataKey="value"
                  nameKey="key"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {(allocation.bySector || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(13, 17, 26, 0.95)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                  formatter={(val) => formatINR(val)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 'auto', fontSize: '12px' }}>
            {(allocation.bySector || []).slice(0, 5).map((sec, i) => (
              <span key={sec.key} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: SECTOR_COLORS[i % SECTOR_COLORS.length] }} />
                <span style={{ color: 'var(--text-secondary)' }}>{sec.key} ({sec.pct}%)</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Learning Next Steps & Market Wire */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Recommended Lessons */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Personalized Learning Path</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {recommendedLessons.slice(0, 3).map((l) => (
              <Link
                key={l.id}
                href={`/learn/${l.id}`}
                className="glass-panel-interactive"
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'block',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  <span>{l.skillArea?.toUpperCase().replace(/_/g, ' ')}</span>
                  <span>{l.estimatedMinutes || 5} MINS</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '15px', margin: '0.25rem 0' }}>{l.title}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.4 }}>{l.summary}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Live Market Wire */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Indian Financial Wire</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {news.map((item) => (
              <div key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>{item.sourceName || 'Wire'}</span>
                  <span style={{ color: item.sentiment === 'POSITIVE' ? 'var(--color-bullish)' : item.sentiment === 'NEGATIVE' ? 'var(--color-bearish)' : 'var(--text-muted)' }}>
                    {item.sentiment || 'NEUTRAL'}
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '13px', margin: '0.25rem 0', lineHeight: 1.4 }}>{item.title}</div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {(item.symbols || []).map((s) => (
                    <span key={s} style={{ fontSize: '10px', background: 'rgba(255, 255, 255, 0.05)', padding: '1px 5px', borderRadius: '4px', color: 'var(--accent-cyan)' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
