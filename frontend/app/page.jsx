'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import TextType from '../components/react-bits/TextType/index.jsx';
import GradientASCII from '../components/react-bits/GradientASCII/index.jsx';
import CircularCarousel from '../components/react-bits/CircularCarousel/index.jsx';
import StockChart from '../components/charts/StockChart.jsx';
import {
  TrendingUp,
  ShieldCheck,
  BrainCircuit,
  BookOpen,
  History,
  Activity,
  Layers,
  Award,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  DollarSign,
  Zap,
} from 'lucide-react';

// Dynamically import CrystalizedBall for high performance WebGL loading
const CrystalizedBall = dynamic(
  () => import('../components/react-bits/CrystalizedBall/index.jsx'),
  { ssr: false, loading: () => <div style={{ height: '420px', width: '100%', background: '#050B09' }} /> }
);

export default function LandingPage() {
  const [selectedStock, setSelectedStock] = useState('RELIANCE');
  const [activeStep, setActiveStep] = useState(0);
  const [activeNode, setActiveNode] = useState('COMPANY');

  // Carousel items as requested by specification
  const carouselItems = [
    {
      src: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
      title: 'Market',
      subtitle: 'Live Indian market data',
    },
    {
      src: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
      title: 'Trade',
      subtitle: 'Practice virtual orders',
    },
    {
      src: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&q=80',
      title: 'Risk',
      subtitle: 'Understand position risk',
    },
    {
      src: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80',
      title: 'Learn',
      subtitle: 'Build market knowledge',
    },
    {
      src: 'https://images.unsplash.com/photo-1642543492500-1c319c5c2901?w=800&q=80',
      title: 'What-If',
      subtitle: 'Explore historical outcomes',
    },
    {
      src: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
      title: 'News',
      subtitle: 'Understand market events',
    },
    {
      src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
      title: 'AI',
      subtitle: 'Ask and understand',
    },
  ];

  const steps = [
    { num: '01', title: 'CREATE YOUR PROFILE', desc: 'Sign up in seconds and establish your educational market identity.' },
    { num: '02', title: 'TAKE THE MARKET QUIZ', desc: 'Assess your starting knowledge level from beginner to advanced.' },
    { num: '03', title: 'RECEIVE ₹1,00,000 VIRTUAL CAPITAL', desc: 'Risk-free starting balance credited immediately to simulate.' },
    { num: '04', title: 'EXPLORE REAL MARKET DATA', desc: 'Track live NSE tick streaming, charts, depth, and order books.' },
    { num: '05', title: 'PLACE VIRTUAL ORDERS', desc: 'Execute CNC and MIS orders through simulated execution engines.' },
    { num: '06', title: 'UNDERSTAND YOUR RISK', desc: 'Review deterministic position size, sector impact, and drawdown.' },
    { num: '07', title: 'LEARN FROM EVERY ACTION', desc: 'AI mentor explains every fill, mistake, and victory with clarity.' },
    { num: '08', title: 'BUILD YOUR MARKET SKILL', desc: 'Track EMA skill progression across 7 essential disciplines.' },
  ];

  return (
    <div style={{ background: '#030807', color: '#DDFBEA', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* =========================================================================
          1. HERO SECTION: Full Viewport with GradientASCII Background
          ========================================================================= */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '4rem 1.5rem',
          overflow: 'hidden',
        }}
      >
        {/* Supplied GradientASCII Background with MarketForge green glowing palette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0.75,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          <GradientASCII
            colors={['#071A14', '#0B3D2E', '#1F8F5F', '#39FF88']}
            shape="horizon"
            characters=" =+xX0S8#@"
            cellSize={18}
            density={0.8}
            glyphOpacity={0.85}
            glow={0.25}
          />
        </div>

        {/* Hero Foreground Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: '1080px',
            textAlign: 'center',
            margin: '0 auto',
          }}
        >
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '2px',
              background: 'rgba(11, 61, 46, 0.6)',
              border: '1px solid rgba(57, 255, 136, 0.35)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: '#39FF88',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '2rem',
            }}
          >
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#39FF88', boxShadow: '0 0 8px #39FF88' }} />
            NEXT-GENERATION MARKET LEARNING PLATFORM
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            style={{
              fontSize: 'clamp(2.5rem, 6.5vw, 5rem)',
              fontWeight: 900,
              letterSpacing: '-1.5px',
              lineHeight: 1.05,
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
              color: '#DDFBEA',
              textShadow: '0 0 30px rgba(57, 255, 136, 0.2)',
            }}
          >
            THE MARKET IS A SYSTEM.
          </motion.h1>

          {/* Supplied TextType Component Configuration */}
          <div
            style={{
              fontSize: 'clamp(1.5rem, 3.8vw, 2.75rem)',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: '#39FF88',
              minHeight: '70px',
              marginBottom: '1.75rem',
              textShadow: '0 0 20px rgba(57, 255, 136, 0.45)',
            }}
          >
            <TextType
              text={[
                'Learn the Market.',
                'Simulate the Market.',
                'Understand Risk.',
                'Trade With Intelligence.',
                'Build Market Confidence.',
              ]}
              typingSpeed={75}
              pauseDuration={1500}
              deletingSpeed={50}
              deleteMode="backspace"
              typeEffect="fade"
              mistakes={0.2}
              cursorStyle="bar"
              cursorGlide
              showCursor
              cursorColor="#39FF88"
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
              color: '#94B8A3',
              maxWidth: '720px',
              margin: '0 auto 2.5rem auto',
              lineHeight: 1.6,
            }}
          >
            MarketForge lets you experience the stock market with virtual capital, real market data, intelligent risk analysis, and interactive learning.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}
          >
            <Link
              href="/signup"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                background: '#39FF88',
                color: '#030807',
                fontWeight: 'bold',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                border: '1px solid #39FF88',
                borderRadius: '2px',
                boxShadow: '0 0 25px rgba(57, 255, 136, 0.4)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span>ENTER MARKET • ₹1,00,000</span>
              <ChevronRight size={16} />
            </Link>

            <a
              href="#market-core"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                background: 'rgba(7, 19, 15, 0.8)',
                color: '#DDFBEA',
                fontWeight: '600',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                border: '1px solid rgba(57, 255, 136, 0.3)',
                borderRadius: '2px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span>EXPLORE HOW IT WORKS</span>
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute',
            bottom: '24px',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            color: '#71877B',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          <span>SCROLL TO ENTER THE MARKET</span>
          <div style={{ width: '1px', height: '32px', background: 'linear-gradient(to bottom, #39FF88, transparent)' }} />
        </motion.div>
      </section>

      {/* =========================================================================
          2. MARKET CORE VISUALIZATION: Central Live Exchange Data Network
          ========================================================================= */}
      <section
        id="market-core"
        style={{
          padding: '6rem 1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ color: '#38D9FF', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            [ SECTION 02 // ARCHITECTURE ]
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
            THE CENTRAL MARKET CORE
          </h2>
          <p style={{ color: '#94B8A3', maxWidth: '640px', margin: '0.75rem auto 0 auto', fontSize: '15px' }}>
            Live normalized data feeds connect with strict deterministic risk engines before any order touches simulation.
          </p>
        </div>

        {/* Live Exchange Rings & Node Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {[
            { symbol: 'NIFTY 50', price: '24,315.80', change: '+142.30', pct: '+0.59%', isUp: true, desc: 'Benchmark 50 Bluechip Index' },
            { symbol: 'SENSEX', price: '79,942.20', change: '+482.15', pct: '+0.61%', isUp: true, desc: 'BSE Top 30 Universe' },
            { symbol: 'BANK NIFTY', price: '51,840.40', change: '-128.50', pct: '-0.25%', isUp: false, desc: 'Banking Sector Index' },
            { symbol: 'RELIANCE', price: '₹2,742.50', change: '+32.40', pct: '+1.20%', isUp: true, desc: 'Energy & Retail Giant' },
            { symbol: 'TCS', price: '₹3,890.10', change: '+45.20', pct: '+1.18%', isUp: true, desc: 'IT Services Leader' },
            { symbol: 'HDFCBANK', price: '₹1,745.25', change: '-8.60', pct: '-0.49%', isUp: false, desc: 'Private Banking Pillar' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#07130F',
                border: '1px solid rgba(57, 255, 136, 0.15)',
                padding: '20px',
                borderRadius: '2px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'border-color 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 'bold', color: '#DDFBEA' }}>
                    {item.symbol}
                  </div>
                  <div style={{ fontSize: '11px', color: '#71877B' }}>{item.desc}</div>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '2px',
                    background: item.isUp ? 'rgba(57, 255, 136, 0.1)' : 'rgba(255, 77, 103, 0.1)',
                    color: item.isUp ? '#39FF88' : '#FF4D67',
                    fontWeight: 'bold',
                  }}
                >
                  {item.pct}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 'bold', color: '#DDFBEA' }}>
                  {item.price}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: item.isUp ? '#39FF88' : '#FF4D67' }}>
                  {item.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          3. "WHAT EXACTLY ARE YOU BUYING?" Interactive Node Visualization
          ========================================================================= */}
      <section
        style={{
          padding: '6rem 1.5rem',
          background: 'linear-gradient(180deg, #030807 0%, #050B09 50%, #030807 100%)',
          borderTop: '1px solid rgba(57, 255, 136, 0.08)',
          borderBottom: '1px solid rgba(57, 255, 136, 0.08)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#38D9FF', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                [ OWNERSHIP ENGINE ]
              </div>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.15, marginBottom: '1.25rem' }}>
                What exactly are you buying?
              </h2>
              <p style={{ color: '#94B8A3', fontSize: '15px', lineHeight: 1.7, marginBottom: '2rem' }}>
                Stock trading is not playing numbers on a screen. Every share represents fractional ownership of an operating business with revenues, cash flows, and balance sheet assets.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['COMPANY', 'SHARES', 'OWNERSHIP', 'MARKET PRICE', 'YOUR POSITION'].map((node, i) => (
                  <div
                    key={node}
                    onClick={() => setActiveNode(node)}
                    style={{
                      padding: '12px 18px',
                      background: activeNode === node ? '#0B3D2E' : '#07130F',
                      border: activeNode === node ? '1px solid #39FF88' : '1px solid rgba(57, 255, 136, 0.15)',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      color: activeNode === node ? '#39FF88' : '#DDFBEA',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>0{i + 1}. {node}</span>
                    <span style={{ fontSize: '11px', color: '#71877B' }}>[CLICK TO INSPECT]</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Node Explanation Panel */}
            <div
              style={{
                background: '#07130F',
                border: '1px solid rgba(57, 255, 136, 0.25)',
                padding: '36px',
                borderRadius: '2px',
                boxShadow: '0 0 40px rgba(0, 0, 0, 0.6)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', color: '#38D9FF', fontSize: '12px', marginBottom: '12px' }}>
                SYSTEM NODE // {activeNode}
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#39FF88', marginBottom: '16px' }}>
                {activeNode === 'COMPANY' && 'The Operating Business'}
                {activeNode === 'SHARES' && 'Total Outstanding Units'}
                {activeNode === 'OWNERSHIP' && 'Your Legal Claim'}
                {activeNode === 'MARKET PRICE' && 'The Settlement Consensus'}
                {activeNode === 'YOUR POSITION' && 'Portfolio Concentration'}
              </h3>
              <p style={{ color: '#DDFBEA', fontSize: '15px', lineHeight: 1.7, marginBottom: '24px' }}>
                {activeNode === 'COMPANY' && 'A registered enterprise generating revenue, profits, and hiring talent across India. Example: Reliance Industries operates energy, telecommunications, and retail networks.'}
                {activeNode === 'SHARES' && 'Total capital divided into fungible units. Reliance has 6.76 billion shares outstanding listed on the National Stock Exchange.'}
                {activeNode === 'OWNERSHIP' && 'Buying 100 shares gives you 100 / 6,765,000,000 fractional title to the enterprise profits, dividends, and shareholder voting rights.'}
                {activeNode === 'MARKET PRICE' && 'The last executed price between buyers and sellers. It fluctuates based on collective expectations of future earnings and broader economic liquidity.'}
                {activeNode === 'YOUR POSITION' && 'How much capital you expose to this single entity. MarketForge monitors this in real-time to alert you before high concentration creates ruin risk.'}
              </p>
              <div style={{ padding: '16px', background: '#030807', border: '1px solid rgba(57, 255, 136, 0.1)', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#51AF7B' }}>
                Deterministic Rule: Position &gt; 20% of net portfolio triggers WARNING; single order &gt; 25% triggers review.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. "START WITH ₹1,00,000": Interactive Portfolio Allocation Simulation
          ========================================================================= */}
      <section
        style={{
          padding: '6rem 1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ color: '#38D9FF', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            [ SECTION 04 // VIRTUAL CAPITAL ]
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, textTransform: 'uppercase' }}>
            START WITH ₹1,00,000 VIRTUAL CAPITAL
          </h2>
          <p style={{ color: '#94B8A3', maxWidth: '640px', margin: '0.75rem auto 0 auto', fontSize: '15px' }}>
            Experience real Indian market tick movements without putting real savings on the line.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div style={{ background: '#07130F', border: '1px solid rgba(57, 255, 136, 0.2)', padding: '24px', borderRadius: '2px' }}>
            <div style={{ fontSize: '11px', color: '#71877B', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Available Funds</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#39FF88', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>₹1,00,000</div>
            <div style={{ fontSize: '11px', color: '#51AF7B', marginTop: '4px' }}>Uncommitted cash buffer</div>
          </div>
          <div style={{ background: '#07130F', border: '1px solid rgba(57, 255, 136, 0.2)', padding: '24px', borderRadius: '2px' }}>
            <div style={{ fontSize: '11px', color: '#71877B', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Portfolio Value</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#DDFBEA', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>₹1,00,000</div>
            <div style={{ fontSize: '11px', color: '#71877B', marginTop: '4px' }}>Holdings + Cash balance</div>
          </div>
          <div style={{ background: '#07130F', border: '1px solid rgba(57, 255, 136, 0.2)', padding: '24px', borderRadius: '2px' }}>
            <div style={{ fontSize: '11px', color: '#71877B', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Today&apos;s P&amp;L</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#39FF88', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>+₹0.00</div>
            <div style={{ fontSize: '11px', color: '#51AF7B', marginTop: '4px' }}>0.00% Realized &amp; Unrealized</div>
          </div>
          <div style={{ background: '#07130F', border: '1px solid rgba(57, 255, 136, 0.2)', padding: '24px', borderRadius: '2px' }}>
            <div style={{ fontSize: '11px', color: '#71877B', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Open Positions</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#38D9FF', fontFamily: 'var(--font-mono)', marginTop: '8px' }}>0</div>
            <div style={{ fontSize: '11px', color: '#71877B', marginTop: '4px' }}>Ready for execution</div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. HIGHCHARTS STOCK CANDLESTICK TERMINAL SECTION
          ========================================================================= */}
      <section
        style={{
          padding: '6rem 1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ color: '#38D9FF', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
              [ SECTION 05 // TERMINAL CORE ]
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, textTransform: 'uppercase' }}>
              THE MARKET NEVER STOPS MOVING
            </h2>
            <p style={{ color: '#94B8A3', fontSize: '14px', marginTop: '4px' }}>
              Highcharts Stock Candlestick + Volume terminal powered by normalized real market tick data.
            </p>
          </div>

          {/* Quick Stock Selector Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN'].map((sym) => (
              <button
                key={sym}
                onClick={() => setSelectedStock(sym)}
                style={{
                  padding: '6px 14px',
                  background: selectedStock === sym ? '#0B3D2E' : '#07130F',
                  border: selectedStock === sym ? '1px solid #39FF88' : '1px solid rgba(57, 255, 136, 0.15)',
                  color: selectedStock === sym ? '#39FF88' : '#71877B',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Highcharts Stock Chart Component */}
        <StockChart symbol={selectedStock} height={520} />
      </section>

      {/* =========================================================================
          6. CRYSTALIZED BALL: AI Market Intelligence Layer
          ========================================================================= */}
      <section
        style={{
          padding: '6rem 1.5rem',
          background: 'linear-gradient(180deg, #030807 0%, #050B09 50%, #030807 100%)',
          borderTop: '1px solid rgba(57, 255, 136, 0.1)',
          borderBottom: '1px solid rgba(57, 255, 136, 0.1)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ color: '#38D9FF', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
              [ SECTION 06 // AI MENTOR ]
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, textTransform: 'uppercase' }}>
              YOU DON&apos;T HAVE TO UNDERSTAND THE MARKET ALONE
            </h2>
            <p style={{ color: '#94B8A3', maxWidth: '640px', margin: '0.75rem auto 0 auto', fontSize: '15px' }}>
              Meet your Market Intelligence Layer. Deterministic engines compute risk numbers; Google Gemini explains them in plain language.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            {/* Left: Supplied CrystalizedBall with MarketForge neon green color */}
            <div
              style={{
                position: 'relative',
                height: '420px',
                width: '100%',
                background: '#07130F',
                border: '1px solid rgba(57, 255, 136, 0.2)',
                borderRadius: '2px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CrystalizedBall
                preset="plasma"
                color="#39FF88"
                size={0.7}
                crackle={0.85}
                fill={0.5}
                interactive
                hoverStrength={0.7}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: '#39FF88',
                  letterSpacing: '1px',
                  pointerEvents: 'none',
                }}
              >
                ● AI COGNITIVE CORE ACTIVE
              </div>
            </div>

            {/* Right: Simulated Real-Time AI Dialogue */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: '#07130F',
                  border: '1px solid rgba(57, 255, 136, 0.2)',
                  padding: '20px',
                  borderRadius: '2px',
                }}
              >
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#71877B', marginBottom: '8px' }}>USER INQUIRY</div>
                <div style={{ fontSize: '15px', color: '#DDFBEA', fontWeight: '500' }}>
                  &quot;Why did the risk engine flag my order on Reliance as a warning?&quot;
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(11, 61, 46, 0.4)',
                  border: '1px solid rgba(57, 255, 136, 0.35)',
                  padding: '20px',
                  borderRadius: '2px',
                }}
              >
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#39FF88', marginBottom: '8px' }}>AI MARKET INTELLIGENCE</div>
                <div style={{ fontSize: '14px', color: '#DDFBEA', lineHeight: 1.6 }}>
                  &quot;Your proposed order represents <strong>27.4%</strong> of your total portfolio, exceeding the 20% concentration threshold. If the stock experiences a 10% drawdown, your total portfolio will drop by <strong>₹2,742</strong>. Consider sizing this order closer to 10% to preserve capital buffer.&quot;
                </div>
              </div>

              {/* Four Illuminated Indicators */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div style={{ padding: '12px', background: '#07130F', border: '1px solid #39FF88', borderRadius: '2px' }}>
                  <div style={{ fontSize: '10px', color: '#71877B', fontFamily: 'var(--font-mono)' }}>METRIC 01</div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#39FF88' }}>POSITION SIZE: 27.4%</div>
                </div>
                <div style={{ padding: '12px', background: '#07130F', border: '1px solid #38D9FF', borderRadius: '2px' }}>
                  <div style={{ fontSize: '10px', color: '#71877B', fontFamily: 'var(--font-mono)' }}>METRIC 02</div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#38D9FF' }}>SECTOR EXPOSURE: 18.2%</div>
                </div>
                <div style={{ padding: '12px', background: '#07130F', border: '1px solid #F59E0B', borderRadius: '2px' }}>
                  <div style={{ fontSize: '10px', color: '#71877B', fontFamily: 'var(--font-mono)' }}>METRIC 03</div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#F59E0B' }}>LOSS AT -10%: ₹2,742</div>
                </div>
                <div style={{ padding: '12px', background: '#07130F', border: '1px solid #51AF7B', borderRadius: '2px' }}>
                  <div style={{ fontSize: '10px', color: '#71877B', fontFamily: 'var(--font-mono)' }}>METRIC 04</div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#51AF7B' }}>30D VOLATILITY: 18.4%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. CIRCULAR CAROUSEL: MarketForge Capabilities Showcase
          ========================================================================= */}
      <section
        style={{
          padding: '6rem 1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ color: '#38D9FF', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            [ SECTION 07 // CAPABILITIES ]
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, textTransform: 'uppercase' }}>
            ENGINEERED FOR SERIOUS MARKET LEARNERS
          </h2>
          <p style={{ color: '#94B8A3', maxWidth: '640px', margin: '0.75rem auto 0 auto', fontSize: '15px' }}>
            Interact with the 3D cylinder below to explore the seven pillars of MarketForge.
          </p>
        </div>

        {/* Supplied CircularCarousel Component */}
        <div style={{ height: '480px', width: '100%', position: 'relative' }}>
          <CircularCarousel
            items={carouselItems}
            preset="cylinder"
            intro="rise"
            cardWidth={220}
            aspectRatio={1}
            speed={14}
            captions
          />
        </div>
      </section>

      {/* =========================================================================
          8. HORIZONTAL STORYTELLING: 8 Steps to Market Mastery
          ========================================================================= */}
      <section
        style={{
          padding: '6rem 1.5rem',
          background: 'linear-gradient(180deg, #030807 0%, #050B09 50%, #030807 100%)',
          borderTop: '1px solid rgba(57, 255, 136, 0.1)',
          borderBottom: '1px solid rgba(57, 255, 136, 0.1)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ color: '#38D9FF', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
              [ SECTION 08 // PROGRESSION PATH ]
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, textTransform: 'uppercase' }}>
              THE 8 STAGES OF MARKETFORGE
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
            }}
          >
            {steps.map((st, idx) => (
              <div
                key={st.num}
                style={{
                  background: '#07130F',
                  border: '1px solid rgba(57, 255, 136, 0.15)',
                  padding: '24px',
                  borderRadius: '2px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 'bold', color: '#39FF88' }}>
                  {st.num}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#DDFBEA' }}>
                  {st.title}
                </div>
                <div style={{ fontSize: '13px', color: '#71877B', lineHeight: 1.6 }}>
                  {st.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. "BEFORE YOU TRADE, UNDERSTAND THE TRADE": Order Intelligence Review
          ========================================================================= */}
      <section
        style={{
          padding: '6rem 1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ color: '#38D9FF', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            [ SECTION 09 // PRE-TRADE INTELLIGENCE ]
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, textTransform: 'uppercase' }}>
            BEFORE YOU TRADE, UNDERSTAND THE TRADE
          </h2>
          <p style={{ color: '#94B8A3', maxWidth: '640px', margin: '0.75rem auto 0 auto', fontSize: '15px' }}>
            See exactly how a proposed order impacts your overall capital safety net before execution.
          </p>
        </div>

        {/* Visual Order Intelligence Modal / Dashboard Preview */}
        <div
          style={{
            maxWidth: '820px',
            margin: '0 auto',
            background: '#07130F',
            border: '1px solid #39FF88',
            padding: '32px',
            borderRadius: '2px',
            boxShadow: '0 0 50px rgba(57, 255, 136, 0.15)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(57, 255, 136, 0.15)', paddingBottom: '16px', marginBottom: '24px' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#39FF88', fontWeight: 'bold' }}>ORDER INTELLIGENCE REPORT</span>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#DDFBEA', marginTop: '4px' }}>BUY RELIANCE • 10 SHARES @ ₹2,742.50</div>
            </div>
            <span style={{ padding: '4px 10px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #F59E0B', color: '#F59E0B', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', borderRadius: '2px' }}>
              MODERATE RISK
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#030807', padding: '16px', border: '1px solid rgba(57, 255, 136, 0.1)' }}>
              <div style={{ fontSize: '11px', color: '#71877B', fontFamily: 'var(--font-mono)' }}>ORDER VALUE</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#DDFBEA', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>₹27,425.00</div>
            </div>
            <div style={{ background: '#030807', padding: '16px', border: '1px solid rgba(57, 255, 136, 0.1)' }}>
              <div style={{ fontSize: '11px', color: '#71877B', fontFamily: 'var(--font-mono)' }}>PORTFOLIO IMPACT</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#39FF88', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>27.4%</div>
            </div>
            <div style={{ background: '#030807', padding: '16px', border: '1px solid rgba(57, 255, 136, 0.1)' }}>
              <div style={{ fontSize: '11px', color: '#71877B', fontFamily: 'var(--font-mono)' }}>SECTOR EXPOSURE</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#38D9FF', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>18.2%</div>
            </div>
            <div style={{ background: '#030807', padding: '16px', border: '1px solid rgba(57, 255, 136, 0.1)' }}>
              <div style={{ fontSize: '11px', color: '#71877B', fontFamily: 'var(--font-mono)' }}>LOSS AT -5%</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FF4D67', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>₹1,371.25</div>
            </div>
            <div style={{ background: '#030807', padding: '16px', border: '1px solid rgba(57, 255, 136, 0.1)' }}>
              <div style={{ fontSize: '11px', color: '#71877B', fontFamily: 'var(--font-mono)' }}>LOSS AT -10%</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FF4D67', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>₹2,742.50</div>
            </div>
            <div style={{ background: '#030807', padding: '16px', border: '1px solid rgba(57, 255, 136, 0.1)' }}>
              <div style={{ fontSize: '11px', color: '#71877B', fontFamily: 'var(--font-mono)' }}>30D VOLATILITY</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#DDFBEA', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>18.4%</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', color: '#39FF88', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 'bold' }}>
            NOW YOU KNOW WHAT THE ORDER MEANS BEFORE YOU CLICK CONFIRM.
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. FINAL CTA: Return to GradientASCII Atmosphere
          ========================================================================= */}
      <section
        style={{
          position: 'relative',
          padding: '8rem 1.5rem',
          textAlign: 'center',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #030807 0%, #050B09 100%)',
          borderTop: '1px solid rgba(57, 255, 136, 0.2)',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <h2
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 900,
              letterSpacing: '-1px',
              textTransform: 'uppercase',
              marginBottom: '1rem',
              color: '#DDFBEA',
            }}
          >
            BUILD YOUR MARKET INTUITION.
          </h2>
          <p
            style={{
              fontSize: '1.2rem',
              color: '#94B8A3',
              lineHeight: 1.6,
              marginBottom: '2.5rem',
            }}
          >
            Not a brokerage. Not a guessing game. A simulated Indian stock market you can actually learn.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/signup"
              style={{
                padding: '16px 36px',
                background: '#39FF88',
                color: '#030807',
                fontWeight: 'bold',
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                border: '1px solid #39FF88',
                borderRadius: '2px',
                boxShadow: '0 0 30px rgba(57, 255, 136, 0.5)',
                textDecoration: 'none',
              }}
            >
              ENTER MARKET • ₹1,00,000
            </Link>
            <Link
              href="/markets"
              style={{
                padding: '16px 36px',
                background: '#07130F',
                color: '#DDFBEA',
                fontWeight: 'bold',
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                border: '1px solid rgba(57, 255, 136, 0.3)',
                borderRadius: '2px',
                textDecoration: 'none',
              }}
            >
              EXPLORE PLATFORM
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
