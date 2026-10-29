'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const CHALLENGES_LIST = [
  {
    id: 'diversified-portfolio',
    title: 'Build a Diversified Portfolio',
    description: 'Allocate virtual capital across at least 4 distinct economic sectors (e.g., IT, Banking, Energy, FMCG) with no single stock exceeding 25%.',
    xp: 350,
    difficulty: 'INTERMEDIATE',
    progress: 75,
    target: '4/4 Sectors',
    reward: 'Risk Architect Badge + 350 XP',
    status: 'IN_PROGRESS',
  },
  {
    id: 'survive-crash',
    title: 'Survive a Market Crash',
    description: 'Complete a What-If simulation test without panic-selling during a 20%+ drawdown window.',
    xp: 500,
    difficulty: 'HARD',
    progress: 100,
    target: '1/1 Simulation',
    reward: 'Diamond Hands Trophy + 500 XP',
    status: 'COMPLETED',
  },
  {
    id: 'use-limit-order',
    title: 'Use a Limit Order',
    description: 'Submit and fill an order using a disciplined LIMIT price rather than market execution to capture a favorable entry price.',
    xp: 200,
    difficulty: 'BEGINNER',
    progress: 100,
    target: '1/1 Order',
    reward: 'Order Tactician Badge + 200 XP',
    status: 'COMPLETED',
  },
  {
    id: 'control-position-size',
    title: 'Control Position Size',
    description: 'Execute 5 consecutive trades with deterministic portfolio impact strictly below 15% per position.',
    xp: 300,
    difficulty: 'INTERMEDIATE',
    progress: 60,
    target: '3/5 Trades',
    reward: 'Discipline Master Badge + 300 XP',
    status: 'IN_PROGRESS',
  },
  {
    id: 'read-candlestick-chart',
    title: 'Read a Candlestick Chart',
    description: 'Analyze OHLC bodies, identify support/resistance wicks, and complete the technical candlestick quiz.',
    xp: 250,
    difficulty: 'BEGINNER',
    progress: 40,
    target: '2/5 Lessons',
    reward: 'Chartist Novice + 250 XP',
    status: 'IN_PROGRESS',
  },
  {
    id: 'seven-day-streak',
    title: 'Complete a 7-Day Learning Streak',
    description: 'Review market news, analyze portfolio health, and complete 1 lesson daily for 7 consecutive calendar days.',
    xp: 600,
    difficulty: 'HARD',
    progress: 71,
    target: '5/7 Days',
    reward: 'Master Trader Streak + 600 XP',
    status: 'IN_PROGRESS',
  },
];

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState(CHALLENGES_LIST);

  const handleClaim = (id) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'CLAIMED' } : c))
    );
  };

  const totalXP = challenges.filter((c) => c.status === 'COMPLETED' || c.status === 'CLAIMED').reduce((acc, c) => acc + c.xp, 0);

  return (
    <div style={{ background: '#030807', minHeight: 'calc(100vh - 80px)', color: '#DDFBEA', fontFamily: 'var(--font-mono)', padding: '24px' }}>
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
              Master risk management, order types, and emotional discipline. Earn XP to unlock higher simulator levels.
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
              <div style={{ fontSize: '10px', color: '#71877B' }}>TOTAL EARNED</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#39FF88' }}>{totalXP} XP</div>
            </div>
            <div style={{ height: '28px', width: '1px', background: 'rgba(57, 255, 136, 0.2)' }} />
            <div>
              <div style={{ fontSize: '10px', color: '#71877B' }}>ACTIVE STREAK</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#38D9FF' }}>5 DAYS 🔥</div>
            </div>
          </div>
        </div>

        {/* Challenge Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '16px',
          }}
        >
          {challenges.map((c) => {
            const isCompleted = c.status === 'COMPLETED';
            const isClaimed = c.status === 'CLAIMED';
            const isHard = c.difficulty === 'HARD';
            const isMed = c.difficulty === 'INTERMEDIATE';

            return (
              <div
                key={c.id}
                style={{
                  background: '#07130F',
                  border: isCompleted ? '1px solid #39FF88' : '1px solid rgba(57, 255, 136, 0.15)',
                  boxShadow: isCompleted ? '0 0 15px rgba(57, 255, 136, 0.15)' : 'none',
                  borderRadius: '2px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Card Top: Difficulty & XP */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '2px',
                      background: isHard ? 'rgba(255, 77, 103, 0.15)' : isMed ? 'rgba(56, 217, 255, 0.15)' : 'rgba(57, 255, 136, 0.15)',
                      color: isHard ? '#FF4D67' : isMed ? '#38D9FF' : '#39FF88',
                      border: isHard ? '1px solid rgba(255, 77, 103, 0.3)' : isMed ? '1px solid rgba(56, 217, 255, 0.3)' : '1px solid rgba(57, 255, 136, 0.3)',
                    }}
                  >
                    {c.difficulty}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#39FF88' }}>
                    +{c.xp} XP
                  </span>
                </div>

                {/* Title & Description */}
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#DDFBEA', margin: '0 0 8px 0' }}>
                  {c.title}
                </h3>
                <p style={{ color: '#94B8A3', fontSize: '12px', lineHeight: 1.5, margin: '0 0 16px 0', flex: 1 }}>
                  {c.description}
                </p>

                {/* Progress Bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
                    <span style={{ color: '#71877B' }}>PROGRESS</span>
                    <span style={{ color: '#39FF88', fontWeight: 800 }}>{c.target} ({c.progress}%)</span>
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
                        width: `${c.progress}%`,
                        background: isCompleted ? '#39FF88' : 'linear-gradient(90deg, #38D9FF 0%, #39FF88 100%)',
                        boxShadow: '0 0 8px rgba(57, 255, 136, 0.4)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Reward & Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(57, 255, 136, 0.1)', paddingTop: '12px' }}>
                  <div style={{ fontSize: '10px', color: '#71877B', maxWidth: '180px' }}>
                    🎁 {c.reward}
                  </div>
                  {isCompleted ? (
                    <button
                      onClick={() => handleClaim(c.id)}
                      style={{
                        padding: '6px 14px',
                        background: '#39FF88',
                        color: '#030807',
                        border: 'none',
                        borderRadius: '2px',
                        fontSize: '11px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 0 12px rgba(57, 255, 136, 0.4)',
                      }}
                    >
                      CLAIM REWARD
                    </button>
                  ) : isClaimed ? (
                    <span style={{ fontSize: '11px', color: '#39FF88', fontWeight: 800 }}>✔ CLAIMED</span>
                  ) : (
                    <Link
                      href="/trade"
                      style={{
                        padding: '6px 14px',
                        background: 'rgba(57, 255, 136, 0.08)',
                        border: '1px solid rgba(57, 255, 136, 0.25)',
                        color: '#39FF88',
                        borderRadius: '2px',
                        fontSize: '11px',
                        fontWeight: 700,
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
      </div>
    </div>
  );
}
