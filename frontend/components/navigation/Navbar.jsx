'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext.jsx';
import { useMarket } from '../../context/MarketContext.jsx';
import { formatPct } from '../../lib/formatters/index.js';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { indices } = useMarket();

  // Active route helper
  const isActive = (route) => pathname === route;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(3, 8, 7, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(57, 255, 136, 0.15)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Real-time Indian Market Ticker Strip */}
      <div
        style={{
          display: 'flex',
          gap: '2.5rem',
          padding: '4px 1.5rem',
          background: '#050B09',
          borderBottom: '1px solid rgba(57, 255, 136, 0.08)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#39FF88', boxShadow: '0 0 6px #39FF88' }} />
          <span style={{ color: '#39FF88', fontWeight: 'bold' }}>NSE LIVE</span>
        </div>

        {(indices && indices.length > 0 ? indices : [
          { symbol: 'NIFTY 50', value: 24315.80, changePct: 0.59 },
          { symbol: 'SENSEX', value: 79942.20, changePct: 0.61 },
          { symbol: 'BANK NIFTY', value: 51840.40, changePct: -0.25 },
          { symbol: 'NIFTY IT', value: 38740.10, changePct: 1.15 },
        ]).map((idx) => {
          const isUp = (idx.changePct ?? 0) >= 0;
          return (
            <div key={idx.symbol} style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ color: '#71877B' }}>{idx.name || idx.symbol}:</span>
              <span style={{ fontWeight: 'bold', color: '#DDFBEA' }}>
                {idx.value?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span style={{ color: isUp ? '#39FF88' : '#FF4D67', fontWeight: 'bold' }}>
                {formatPct(idx.changePct)}
              </span>
            </div>
          );
        })}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', color: '#71877B' }}>
          <span>VIRTUAL BALANCE: <b style={{ color: '#39FF88' }}>₹1,00,000</b></span>
          <span>MARKET: <b style={{ color: '#38D9FF' }}>OPEN (SIM)</b></span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                letterSpacing: '-0.5px',
                color: '#39FF88',
                textShadow: '0 0 15px rgba(57, 255, 136, 0.4)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              MARKETFORGE
            </span>
            <span
              style={{
                fontSize: '9px',
                textTransform: 'uppercase',
                padding: '2px 5px',
                borderRadius: '2px',
                background: 'rgba(57, 255, 136, 0.12)',
                color: '#39FF88',
                border: '1px solid rgba(57, 255, 136, 0.3)',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
              }}
            >
              VIRTUAL
            </span>
          </Link>

          <nav style={{ display: 'flex', gap: '1.25rem', fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            {[
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'Markets', path: '/markets' },
              { label: 'Trade', path: '/trade' },
              { label: 'Portfolio', path: '/portfolio' },
              { label: 'Orders', path: '/orders' },
              { label: 'News', path: '/news' },
              { label: 'Learn', path: '/learn' },
              { label: 'What-If', path: '/what-if' },
              { label: 'Challenges', path: '/challenges' },
              { label: 'AI Mentor', path: '/ai' },
              { label: 'Glossary', path: '/glossary' },
            ].map((item) => (
              <Link
                key={item.path}
                href={item.path}
                style={{
                  color: isActive(item.path) ? '#39FF88' : '#94B8A3',
                  borderBottom: isActive(item.path) ? '2px solid #39FF88' : '2px solid transparent',
                  paddingBottom: '4px',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                  textTransform: 'uppercase',
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                <div style={{ fontWeight: 'bold', color: '#DDFBEA' }}>{user.displayName || 'Trader'}</div>
                <div style={{ color: '#38D9FF', fontSize: '10px' }}>{user.xp || 150} XP • LEVEL 1</div>
              </div>
              <button
                onClick={logout}
                style={{
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: '#FF4D67',
                  border: '1px solid rgba(255, 77, 103, 0.3)',
                  background: 'rgba(255, 77, 103, 0.08)',
                  borderRadius: '2px',
                }}
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link
                href="/login"
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  color: '#DDFBEA',
                  border: '1px solid rgba(57, 255, 136, 0.25)',
                  background: '#07130F',
                  borderRadius: '2px',
                  textDecoration: 'none',
                }}
              >
                SIGN IN
              </Link>
              <Link
                href="/signup"
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 'bold',
                  borderRadius: '2px',
                  background: '#39FF88',
                  color: '#030807',
                  border: '1px solid #39FF88',
                  textDecoration: 'none',
                  boxShadow: '0 0 15px rgba(57, 255, 136, 0.3)',
                }}
              >
                START ₹1,00,000
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
