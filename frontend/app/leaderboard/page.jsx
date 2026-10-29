'use client';
import { formatINR, formatPct } from '../../lib/formatters/index.js';

const DEMO_LEADERBOARD = [
  { rank: 1, name: 'Aarav Patel', xp: 2450, pnlPct: 18.4, winRate: 72, badge: 'Market Wizard' },
  { rank: 2, name: 'Priya Sundaram', xp: 2180, pnlPct: 15.2, winRate: 68, badge: 'Risk Disciplinarian' },
  { rank: 3, name: 'Vikram Sengupta', xp: 1940, pnlPct: 12.8, winRate: 64, badge: 'Sector Specialist' },
  { rank: 4, name: 'Ananya Sharma', xp: 1720, pnlPct: 9.6, winRate: 59, badge: 'Disciplined Learner' },
  { rank: 5, name: 'Kabir Mehta', xp: 1550, pnlPct: 8.1, winRate: 58, badge: 'Apprentice' },
];

export default function LeaderboardPage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Simulator Leaderboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '0.25rem' }}>
          Rankings are weighted heavily by risk management scores and educational milestones, not reckless leverage.
        </p>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '12px' }}>
              <th style={{ padding: '1rem 1.25rem' }}>RANK</th>
              <th style={{ padding: '1rem 1.25rem' }}>TRADER</th>
              <th style={{ padding: '1rem 1.25rem' }}>HONORARY BADGE</th>
              <th style={{ padding: '1rem 1.25rem' }}>XP</th>
              <th style={{ padding: '1rem 1.25rem' }}>VIRTUAL RETURN</th>
              <th style={{ padding: '1rem 1.25rem' }}>WIN RATE</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_LEADERBOARD.map((trader) => (
              <tr key={trader.rank} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: trader.rank <= 3 ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                  #{trader.rank}
                </td>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>{trader.name}</td>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)' }}>
                    {trader.badge}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--accent-purple)' }}>{trader.xp} XP</td>
                <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--color-bullish)' }}>{formatPct(trader.pnlPct)}</td>
                <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>{trader.winRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
