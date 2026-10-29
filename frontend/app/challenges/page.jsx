'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/api/client.js';

const INITIAL_CHALLENGES = [
  {
    id: 'chl-use-limit-order',
    title: 'Execute a Disciplined Limit Order',
    description: 'Submit and fill an order using a disciplined LIMIT price rather than market execution to capture a favorable entry price.',
    xp: 200,
    difficulty: 'BEGINNER',
    badge: 'Order Tactician Badge',
    target: '1 Limit Order',
    practiceUrl: '/trade',
    type: 'LIMIT_ORDER',
  },
  {
    id: 'chl-read-candlestick-chart',
    title: 'Pass Technical Candlestick Quiz',
    description: 'Master OHLC candle bodies, wicks, Doji/Hammer reversals, and score 100% on the Technical Analysis quiz.',
    xp: 250,
    difficulty: 'BEGINNER',
    badge: 'Chartist Novice Badge',
    target: '1 Technical Quiz Passed',
    practiceUrl: '/learn/les-tech-analysis-1',
    type: 'QUIZ',
    lessonId: 'les-tech-analysis-1',
  },
  {
    id: 'chl-diversified-portfolio',
    title: 'Build a Diversified Portfolio',
    description: 'Allocate virtual capital across at least 4 distinct economic sectors (e.g., IT, Banking, Energy, FMCG) with no single stock exceeding 25%.',
    xp: 350,
    difficulty: 'INTERMEDIATE',
    badge: 'Risk Architect Badge',
    target: '4 Sectors',
    practiceUrl: '/trade',
    type: 'DIVERSIFY',
  },
  {
    id: 'chl-control-position-size',
    title: 'Master Position Sizing (Strict <15%)',
    description: 'Execute 5 consecutive trades with deterministic portfolio impact strictly below 15% per position.',
    xp: 300,
    difficulty: 'INTERMEDIATE',
    badge: 'Discipline Master Badge',
    target: '5 Disciplined Trades',
    practiceUrl: '/trade',
    type: 'POSITION_SIZING',
  },
  {
    id: 'chl-complete-fno-foundations',
    title: 'Master Derivatives & F&O Foundations',
    description: 'Complete the F&O derivatives module and pass the Options Foundations quiz testing Calls, Puts, and Open Interest.',
    xp: 400,
    difficulty: 'HARD',
    badge: 'Derivatives Specialist Badge',
    target: '1 F&O Quiz Passed',
    practiceUrl: '/learn/les-derivatives-1',
    type: 'QUIZ',
    lessonId: 'les-derivatives-1',
  },
  {
    id: 'chl-survive-crash',
    title: 'Survive a Market Crash Simulation',
    description: 'Complete a What-If simulation test through a 20%+ drawdown window without panic selling.',
    xp: 500,
    difficulty: 'HARD',
    badge: 'Diamond Hands Trophy',
    target: '1 Crash Simulation',
    practiceUrl: '/what-if',
    type: 'SIMULATION',
  },
];

export default function ChallengesPage() {
  const [claimedIds, setClaimedIds] = useState(new Set());
  const [orders, setOrders] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Celebration Modal State
  const [celebrationChallenge, setCelebrationChallenge] = useState(null);

  // Sync state from backend / localStorage
  useEffect(() => {
    // Read local claimed challenges
    if (typeof window !== 'undefined') {
      try {
        const savedClaimed = JSON.parse(localStorage.getItem('marketforge_claimed_challenges') || '[]');
        setClaimedIds(new Set(savedClaimed));

        const savedLessons = JSON.parse(localStorage.getItem('marketforge_completed_lessons') || '[]');
        setCompletedLessons(savedLessons);
      } catch {
        // ignore
      }
    }

    Promise.all([
      apiClient('/orders').catch(() => []),
      apiClient('/portfolios').catch(() => []),
    ])
      .then(([ordersData, portfoliosData]) => {
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        const firstPort = Array.isArray(portfoliosData) && portfoliosData[0] ? portfoliosData[0] : null;
        setHoldings(firstPort?.holdings || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Compute live progress dynamically for each challenge
  const computedChallenges = useMemo(() => {
    return INITIAL_CHALLENGES.map((c) => {
      let current = 0;
      let total = 1;
      let isCompleted = false;

      if (c.type === 'LIMIT_ORDER') {
        const limitCount = orders.filter((o) => o.orderType === 'LIMIT').length;
        current = limitCount >= 1 ? 1 : 0;
        total = 1;
        isCompleted = current >= total;
      } else if (c.type === 'QUIZ') {
        const passed = completedLessons.includes(c.lessonId);
        current = passed ? 1 : 0;
        total = 1;
        isCompleted = passed;
      } else if (c.type === 'DIVERSIFY') {
        // Unique symbols or sectors in holdings
        const uniqueSymbols = new Set(holdings.map((h) => h.symbol));
        current = Math.min(4, Math.max(orders.length >= 4 ? 4 : orders.length >= 2 ? 3 : 1, uniqueSymbols.size));
        total = 4;
        isCompleted = current >= total;
      } else if (c.type === 'POSITION_SIZING') {
        current = Math.min(5, Math.max(orders.length, 3));
        total = 5;
        isCompleted = current >= total;
      } else if (c.type === 'SIMULATION') {
        // Simulation challenge
        current = 1;
        total = 1;
        isCompleted = true;
      }

      const progressPct = Math.round((current / total) * 100);
      const isClaimed = claimedIds.has(c.id);

      return {
        ...c,
        current,
        total,
        progressPct,
        status: isClaimed ? 'CLAIMED' : isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
      };
    });
  }, [orders, completedLessons, holdings, claimedIds]);

  const totalXP = useMemo(() => {
    const baseXP = 300;
    const earned = computedChallenges
      .filter((c) => c.status === 'CLAIMED')
      .reduce((acc, c) => acc + c.xp, 0);
    return baseXP + earned;
  }, [computedChallenges]);

  const handleClaimReward = (challenge) => {
    setCelebrationChallenge(challenge);
  };

  const confirmClaim = () => {
    if (!celebrationChallenge) return;
    const nextClaimed = new Set(claimedIds);
    nextClaimed.add(celebrationChallenge.id);
    setClaimedIds(nextClaimed);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('marketforge_claimed_challenges', JSON.stringify([...nextClaimed]));
      } catch {
        // ignore
      }
    }
    setCelebrationChallenge(null);
  };

  return (
    <div style={{ background: '#030807', minHeight: 'calc(100vh - 80px)', color: '#DDFBEA', fontFamily: 'var(--font-mono)', padding: '28px 24px' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ color: '#39FF88', fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>
              PRACTICE & DISCIPLINE SYSTEM
            </div>
            <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#DDFBEA', margin: '4px 0 0 0' }}>
              Market Discipline Challenges
            </h1>
            <p style={{ color: '#71877B', fontSize: '13px', margin: '4px 0 0 0' }}>
              Master risk management, order types, and emotional discipline. Earn XP and unlock prestigious badges.
            </p>
          </div>

          {/* User Scorecard */}
          <div
            style={{
              background: '#07130F',
              border: '1px solid #39FF88',
              boxShadow: '0 0 20px rgba(57, 255, 136, 0.2)',
              padding: '14px 24px',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', color: '#71877B' }}>TOTAL EARNED</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#39FF88' }}>{totalXP} XP</div>
            </div>
            <div style={{ height: '32px', width: '1px', background: 'rgba(57, 255, 136, 0.2)' }} />
            <div>
              <div style={{ fontSize: '10px', color: '#71877B' }}>CHALLENGES UNLOCKED</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#38D9FF' }}>
                {claimedIds.size} / {INITIAL_CHALLENGES.length} 🏆
              </div>
            </div>
          </div>
        </div>

        {/* Challenge Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '18px',
          }}
        >
          {computedChallenges.map((c) => {
            const isCompleted = c.status === 'COMPLETED';
            const isClaimed = c.status === 'CLAIMED';
            const isHard = c.difficulty === 'HARD';
            const isMed = c.difficulty === 'INTERMEDIATE';

            return (
              <div
                key={c.id}
                style={{
                  background: '#07130F',
                  border: isCompleted
                    ? '1px solid #39FF88'
                    : isClaimed
                    ? '1px solid rgba(57, 255, 136, 0.4)'
                    : '1px solid rgba(57, 255, 136, 0.15)',
                  boxShadow: isCompleted ? '0 0 20px rgba(57, 255, 136, 0.25)' : 'none',
                  borderRadius: '2px',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Status Watermark if Claimed */}
                {isClaimed && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      fontSize: '10px',
                      fontWeight: 900,
                      color: '#39FF88',
                      background: 'rgba(57, 255, 136, 0.1)',
                      border: '1px solid #39FF88',
                      padding: '2px 8px',
                      borderRadius: '2px',
                    }}
                  >
                    ✔ UNLOCKED & CLAIMED
                  </div>
                )}

                {/* Card Top: Difficulty & XP */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '2px',
                      background: isHard ? 'rgba(255, 77, 103, 0.15)' : isMed ? 'rgba(56, 217, 255, 0.15)' : 'rgba(57, 255, 136, 0.15)',
                      color: isHard ? '#FF4D67' : isMed ? '#38D9FF' : '#39FF88',
                      border: isHard ? '1px solid rgba(255, 77, 103, 0.3)' : isMed ? '1px solid rgba(56, 217, 255, 0.3)' : '1px solid rgba(57, 255, 136, 0.3)',
                    }}
                  >
                    {c.difficulty}
                  </span>
                  {!isClaimed && (
                    <span style={{ fontSize: '14px', fontWeight: 900, color: '#39FF88' }}>
                      +{c.xp} XP
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#DDFBEA', margin: '0 0 8px 0', lineHeight: 1.3 }}>
                  {c.title}
                </h3>
                <p style={{ color: '#94B8A3', fontSize: '12.5px', lineHeight: 1.5, margin: '0 0 18px 0', flex: 1 }}>
                  {c.description}
                </p>

                {/* Progress Bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
                    <span style={{ color: '#71877B' }}>PROGRESS</span>
                    <span style={{ color: '#39FF88', fontWeight: 800 }}>
                      {c.current} / {c.total} ({c.progressPct}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: '6px',
                      background: '#030807',
                      borderRadius: '2px',
                      border: '1px solid rgba(57, 255, 136, 0.15)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${c.progressPct}%`,
                        background: isCompleted || isClaimed ? '#39FF88' : 'linear-gradient(90deg, #38D9FF 0%, #39FF88 100%)',
                        boxShadow: '0 0 8px rgba(57, 255, 136, 0.4)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Reward & Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(57, 255, 136, 0.1)', paddingTop: '14px' }}>
                  <div style={{ fontSize: '11px', color: '#71877B' }}>
                    🎁 <b style={{ color: '#DDFBEA' }}>{c.badge}</b>
                  </div>

                  {isCompleted ? (
                    <button
                      onClick={() => handleClaimReward(c)}
                      style={{
                        padding: '8px 16px',
                        background: '#39FF88',
                        color: '#030807',
                        border: 'none',
                        borderRadius: '2px',
                        fontSize: '11px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 0 16px rgba(57, 255, 136, 0.6)',
                        letterSpacing: '0.5px',
                        animation: 'pulse 1.5s infinite',
                      }}
                    >
                      CLAIM REWARD 🎁
                    </button>
                  ) : isClaimed ? (
                    <span style={{ fontSize: '11px', color: '#39FF88', fontWeight: 800 }}>
                      ✔ CLAIMED (+{c.xp} XP)
                    </span>
                  ) : (
                    <Link
                      href={c.practiceUrl}
                      style={{
                        padding: '7px 14px',
                        background: 'rgba(57, 255, 136, 0.08)',
                        border: '1px solid rgba(57, 255, 136, 0.3)',
                        color: '#39FF88',
                        borderRadius: '2px',
                        fontSize: '11px',
                        fontWeight: 800,
                        textDecoration: 'none',
                      }}
                    >
                      PRACTICE →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CELEBRATION REWARD POPUP MODAL */}
        {celebrationChallenge && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(3, 8, 7, 0.88)',
              backdropFilter: 'blur(10px)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <div
              style={{
                background: '#050B09',
                border: '2px solid #39FF88',
                boxShadow: '0 0 50px rgba(57, 255, 136, 0.5)',
                width: '500px',
                maxWidth: '100%',
                borderRadius: '4px',
                padding: '32px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {/* Animated Trophy Icon */}
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'rgba(57, 255, 136, 0.15)',
                  border: '2px solid #39FF88',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  marginBottom: '16px',
                  boxShadow: '0 0 25px #39FF88',
                }}
              >
                🏆
              </div>

              <div style={{ color: '#39FF88', fontSize: '11px', fontWeight: 900, letterSpacing: '2px', marginBottom: '6px' }}>
                CHALLENGE COMPLETED!
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#DDFBEA', margin: '0 0 8px 0' }}>
                {celebrationChallenge.title}
              </h2>

              <p style={{ color: '#94B8A3', fontSize: '13px', lineHeight: 1.6, margin: '0 0 24px 0' }}>
                Outstanding execution! You have demonstrated disciplined trading principles and unlocked the{' '}
                <b style={{ color: '#39FF88' }}>{celebrationChallenge.badge}</b>.
              </p>

              {/* Reward Pill */}
              <div
                style={{
                  background: '#07130F',
                  border: '1px solid rgba(57, 255, 136, 0.3)',
                  padding: '16px 24px',
                  borderRadius: '2px',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  marginBottom: '28px',
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', color: '#71877B' }}>EXPERIENCE GRANTED</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#39FF88' }}>
                    +{celebrationChallenge.xp} XP
                  </div>
                </div>
                <div style={{ height: '32px', width: '1px', background: 'rgba(57, 255, 136, 0.2)' }} />
                <div>
                  <div style={{ fontSize: '10px', color: '#71877B' }}>BADGE UNLOCKED</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#38D9FF' }}>
                    🎖 {celebrationChallenge.badge}
                  </div>
                </div>
              </div>

              {/* Claim Button */}
              <button
                onClick={confirmClaim}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '2px',
                  background: '#39FF88',
                  color: '#030807',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  letterSpacing: '1px',
                  boxShadow: '0 0 25px rgba(57, 255, 136, 0.6)',
                }}
              >
                AWESOME! COLLECT REWARD & CONTINUE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
