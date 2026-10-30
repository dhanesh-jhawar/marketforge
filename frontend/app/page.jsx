'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import TextType from '../components/react-bits/TextType/index.jsx';
const GradientASCII = dynamic(
  () => import('../components/react-bits/GradientASCII/index.jsx'),
  { ssr: false, loading: () => <div style={{ position: 'absolute', inset: 0, background: '#030807' }} /> }
);
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
  const [replayScrub, setReplayScrub] = useState(4);
  const [activeStep, setActiveStep] = useState(0);
  const [activeNode, setActiveNode] = useState('COMPANY');

    // The 8 Stages of MarketForge for CircularCarousel
  const carouselItems = [
    {
      src: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
      title: '01 • CREATE YOUR PROFILE',
      subtitle: 'Sign up in seconds and establish your educational market identity.',
    },
    {
      src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
      title: '02 • TAKE THE MARKET QUIZ',
      subtitle: 'Assess your starting knowledge level from beginner to advanced.',
    },
    {
      src: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=800&q=80',
      title: '03 • RECEIVE ₹1,00,000 CAPITAL',
      subtitle: 'Risk-free starting balance credited immediately to simulate.',
    },
    {
      src: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&q=80',
      title: '04 • EXPLORE REAL MARKET DATA',
      subtitle: 'Track live NSE tick streaming, charts, depth, and order books.',
    },
    {
      src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
      title: '05 • PLACE VIRTUAL ORDERS',
      subtitle: 'Execute CNC and MIS orders through simulated execution engines.',
    },
    {
      src: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80',
      title: '06 • UNDERSTAND YOUR RISK',
      subtitle: 'Review deterministic position size, sector impact, and drawdown.',
    },
    {
      src: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
      title: '07 • LEARN FROM EVERY ACTION',
      subtitle: 'AI mentor explains every fill, mistake, and victory with clarity.',
    },
    {
      src: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
      title: '08 • BUILD YOUR MARKET SKILL',
      subtitle: 'Track EMA skill progression across 7 essential disciplines.',
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
          background: '#030807',
        }}
      >
        {/* Full Viewport Glowing Green GradientASCII Horizon Background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
            opacity: 0.85,
          }}
        >
          <GradientASCII
            colors={['#031214', '#0A3D2A', '#18B96A', '#39FF88', '#8AFFB9']}
            shape="horizon"
            characters=" =+xX0S8#@"
            cellSize={18}
            density={0.8}
            mouseInteraction={true}
            clickEffect="wave"
            intro={true}
          />
        </div>

        {/* Background Glowing Circle Animation (CrystalizedBall) */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(90vw, 680px)',
            height: 'min(90vw, 680px)',
            zIndex: 1,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.88,
            filter: 'drop-shadow(0 0 40px rgba(57, 255, 136, 0.35))',
          }}
        >
          <CrystalizedBall
            preset="plasma"
            color="#39FF88"
            size={0.82}
            crackle={0.85}
            fill={0.5}
            interactive={false}
          />
        </div>

        {/* Ambient Dark Backdrop Vignette for High Text Contrast */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, rgba(3, 8, 7, 0.2) 0%, rgba(3, 8, 7, 0.75) 70%, #030807 100%)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />

        {/* Hero Foreground Content with High Contrast Typography */}
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
              padding: '8px 20px',
              borderRadius: '2px',
              background: '#071A14',
              border: '1px solid #39FF88',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: '#39FF88',
              fontWeight: 800,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '2rem',
              boxShadow: '0 0 18px rgba(57, 255, 136, 0.25)',
            }}
          >
            <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#39FF88', boxShadow: '0 0 8px #39FF88' }} />
            NEXT-GENERATION MARKET LEARNING PLATFORM
          </motion.div>

          {/* Headline with High Contrast Brilliant White */}
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
              color: '#FFFFFF',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.9), 0 0 35px rgba(57, 255, 136, 0.3)',
            }}
          >
            THE MARKET IS A SYSTEM.
          </motion.h1>

          {/* Supplied TextType Component with High Contrast Glowing Neon Green */}
          <div
            style={{
              fontSize: 'clamp(1.5rem, 3.8vw, 2.75rem)',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: '#39FF88',
              minHeight: '70px',
              marginBottom: '1.75rem',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 0 25px rgba(57, 255, 136, 0.6)',
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
              color: '#DDFBEA',
              fontWeight: 500,
              maxWidth: '740px',
              margin: '0 auto 2.5rem auto',
              lineHeight: 1.6,
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.95)',
            }}
          >
            MarketForge lets you experience the stock market with virtual capital, real market data, intelligent risk analysis, and interactive learning.
          </motion.p>

          {/* High Contrast CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}
          >
            {/* Core Value Badges */}
            <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', fontSize: '11px', color: '#94B8A3', fontFamily: 'var(--font-mono)', marginBottom: '2rem' }}>
              <span style={{ color: '#39FF88', fontWeight: 800 }}>● ₹1,00,000 Virtual Capital</span>
              <span>● Real Market Data</span>
              <span>● Learn Before You Trade</span>
              <span style={{ color: '#38D9FF', fontWeight: 800 }}>● Replay Market History</span>
              <span>● Understand Why Markets Move</span>
            </div>

            <Link
              href="/trade"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 32px',
                background: '#39FF88',
                color: '#030807',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                border: '1px solid #39FF88',
                borderRadius: '2px',
                boxShadow: '0 0 30px rgba(57, 255, 136, 0.5)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span>START SIMULATING</span>
              <ChevronRight size={16} />
            </Link>

            <Link
              href="/markets"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 32px',
                background: '#071A14',
                color: '#FFFFFF',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                border: '1px solid #39FF88',
                borderRadius: '2px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                boxShadow: '0 0 15px rgba(57, 255, 136, 0.15)',
              }}
            >
              <span>EXPLORE MARKETS</span>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator with tech pulse */}
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
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: '#39FF88',
            letterSpacing: '1px',
          }}
        >
          <span>SCROLL TO ENTER THE MARKET</span>
          <div style={{ width: '1px', height: '24px', background: 'linear-gradient(to bottom, #39FF88, transparent)' }} />
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
          NEWS LANDING SECTION: Live Financial Wire Preview (Section 37)
          ========================================================================= */}
      <section
        style={{
          padding: '6rem 1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ color: '#38D9FF', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            [ SECTION 03 // INTELLIGENCE WIRE ]
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
            MARKET NEWS WITH PEDAGOGICAL CONTEXT
          </h2>
          <p style={{ color: '#94B8A3', maxWidth: '640px', margin: '0.75rem auto 0 auto', fontSize: '15px' }}>
            Every headline is connected to real stock movements, verified imagery, and AI breakdowns of the underlying market mechanisms.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '2.5rem' }}>
          {[
            {
              symbol: 'HDFCBANK',
              company: 'HDFC Bank Limited',
              price: '₹1,745.25',
              change: '-0.49%',
              isUp: false,
              sector: 'Banking & Finance',
              headline: 'RBI Monetary Policy maintains repo rate at 6.5%; banking liquidity supported',
              time: '1h ago',
              image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
            },
            {
              symbol: 'TCS',
              company: 'Tata Consultancy Services',
              price: '₹3,890.10',
              change: '+1.18%',
              isUp: true,
              sector: 'Information Technology',
              headline: 'Indian IT exporters post sequential deal wins in generative AI and cloud optimization',
              time: '2h ago',
              image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
            },
            {
              symbol: 'RELIANCE',
              company: 'Reliance Industries',
              price: '₹2,742.50',
              change: '+1.20%',
              isUp: true,
              sector: 'Energy & Telecom',
              headline: 'Crude benchmarks stabilize near $78/bbl as refining margins maintain quarterly floor',
              time: '4h ago',
              image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=800&q=80',
            },
          ].map((n, i) => (
            <Link
              key={i}
              href="/news"
              style={{
                background: '#07130F',
                border: '1px solid rgba(57, 255, 136, 0.15)',
                borderRadius: '2px',
                overflow: 'hidden',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ height: '160px', width: '100%', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={n.image}
                  alt={n.headline}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(3, 8, 7, 0.85)',
                    border: '1px solid rgba(57, 255, 136, 0.3)',
                    padding: '2px 6px',
                    fontSize: '9px',
                    color: '#39FF88',
                    fontWeight: 800,
                  }}
                >
                  {n.symbol}
                </span>
              </div>
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#71877B' }}>
                  <span style={{ color: '#38D9FF', fontWeight: 800 }}>{n.sector}</span>
                  <span>{n.time}</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#DDFBEA', lineHeight: 1.4 }}>
                  {n.headline}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid rgba(57, 255, 136, 0.1)', fontSize: '11px' }}>
                  <span style={{ color: '#94B8A3' }}>LTP: {n.price}</span>
                  <span style={{ color: n.isUp ? '#39FF88' : '#FF4D67', fontWeight: 800 }}>{n.change}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link
            href="/news"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 28px',
              background: '#0B3D2E',
              border: '1px solid #39FF88',
              color: '#39FF88',
              fontWeight: 800,
              fontSize: '12px',
              borderRadius: '2px',
              textDecoration: 'none',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            <span>VIEW ALL NEWS WIRE</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </section>

      {/* =========================================================================
          REPLAY ENGINE LANDING SECTION: Markets Have a Memory (Section 36)
          ========================================================================= */}
      <section
        id="replay-engine"
        style={{
          padding: '6rem 1.5rem',
          background: 'linear-gradient(180deg, #030807 0%, #050E0B 50%, #030807 100%)',
          borderTop: '1px solid rgba(57, 255, 136, 0.1)',
          borderBottom: '1px solid rgba(57, 255, 136, 0.1)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ color: '#38D9FF', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
              [ SECTION 04 // HISTORICAL REPLAY ]
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
              MARKETS HAVE A MEMORY. REPLAY THE MARKET.
            </h2>
            <p style={{ color: '#94B8A3', maxWidth: '680px', margin: '0.75rem auto 0 auto', fontSize: '15px' }}>
              Scrub through historical price action candle-by-candle. Understand why stocks move with verifiable news catalysts and deterministic drivers.
            </p>
          </div>

          {/* Interactive Replay Scrubber Preview */}
          <div
            style={{
              background: '#07130F',
              border: '1px solid #39FF88',
              borderRadius: '2px',
              padding: '28px',
              boxShadow: '0 0 35px rgba(57, 255, 136, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Telemetry Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(57, 255, 136, 0.15)', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#71877B' }}>HISTORICAL REPLAY // DEMO RUN</span>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#39FF88' }}>
                  RELIANCE INDUSTRIES (NSE: RELIANCE)
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#39FF88' }}>
                  {['₹2,420.10', '₹2,465.30', '₹2,510.00', '₹2,485.40', '₹2,590.20', '₹2,640.80', '₹2,710.00', '₹2,742.50'][replayScrub]}
                </div>
                <div style={{ fontSize: '11px', color: '#39FF88', fontWeight: 700 }}>
                  {['+0.0%', '+1.86%', '+3.71%', '+2.69%', '+7.02%', '+9.11%', '+11.98%', '+13.32%'][replayScrub]} SINCE START
                </div>
              </div>
            </div>

            {/* Miniature Progressive Candlesticks & Financial Terminal Chart */}
            <div
              style={{
                background: '#040907',
                border: '1px solid rgba(57, 255, 136, 0.2)',
                borderRadius: '2px',
                padding: '20px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                overflow: 'hidden',
              }}
            >
              {/* Telemetry HUD for active candle */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#07130F',
                  padding: '8px 14px',
                  borderRadius: '2px',
                  border: '1px solid rgba(57, 255, 136, 0.15)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <span>SESSION: <b style={{ color: '#DDFBEA' }}>{[
                    '04 OCT 2024', '18 OCT 2024', '01 NOV 2024', '15 NOV 2024',
                    '29 NOV 2024', '13 DEC 2024', '27 DEC 2024', '10 JAN 2025'
                  ][replayScrub]}</b></span>
                  <span>OPEN: <b style={{ color: '#94B8A3' }}>₹{[2400, 2420, 2465, 2510, 2485, 2590, 2640, 2710][replayScrub]}</b></span>
                  <span>HIGH: <b style={{ color: '#39FF88' }}>₹{[2435, 2480, 2530, 2515, 2610, 2660, 2730, 2760][replayScrub]}</b></span>
                  <span>LOW: <b style={{ color: '#FF4D67' }}>₹{[2390, 2415, 2450, 2470, 2480, 2570, 2630, 2690][replayScrub]}</b></span>
                  <span>CLOSE: <b style={{ color: '#39FF88' }}>₹{[2420, 2465, 2510, 2485, 2590, 2640, 2710, 2742][replayScrub]}</b></span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ color: '#71877B' }}>VOL: <b style={{ color: '#38D9FF' }}>{[
                    '28.4L', '34.1L', '48.9L', '31.2L', '72.4L', '58.1L', '84.3L', '65.2L'
                  ][replayScrub]} SHARES</b></span>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '2px',
                    background: replayScrub === 3 ? 'rgba(255, 77, 103, 0.15)' : 'rgba(57, 255, 136, 0.15)',
                    color: replayScrub === 3 ? '#FF4D67' : '#39FF88',
                    fontWeight: 900,
                  }}>
                    {['+0.83%', '+1.86%', '+1.83%', '-1.00%', '+4.23%', '+1.93%', '+2.65%', '+1.18%'][replayScrub]}
                  </span>
                </div>
              </div>

              {/* High-Fidelity SVG Candlestick & Volume Chart */}
              <div style={{ position: 'relative', width: '100%', height: '240px' }}>
                <svg
                  viewBox="0 0 900 240"
                  style={{ width: '100%', height: '100%', overflow: 'visible' }}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="replayTrendGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38D9FF" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#38D9FF" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="neonPulse" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Horizontal Gridlines & Price Scale */}
                  {[
                    { price: 2750, y: 30 },
                    { price: 2650, y: 70 },
                    { price: 2550, y: 110 },
                    { price: 2450, y: 150 },
                  ].map((grid, idx) => (
                    <g key={idx}>
                      <line
                        x1="30"
                        y1={grid.y}
                        x2="840"
                        y2={grid.y}
                        stroke="rgba(57, 255, 136, 0.08)"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x="845"
                        y={grid.y + 4}
                        fill="#71877B"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        ₹{grid.price}
                      </text>
                    </g>
                  ))}

                  {/* Volume Separator Line */}
                  <line x1="30" y1="180" x2="840" y2="180" stroke="rgba(57, 255, 136, 0.15)" strokeWidth="1" />
                  <text x="32" y="192" fill="#71877B" fontSize="9" fontFamily="monospace">VOLUME TELEMETRY</text>

                  {/* Trendline connecting revealed candles */}
                  {(() => {
                    const samplePoints = [
                      { x: 75, y: 160 },
                      { x: 175, y: 142 },
                      { x: 275, y: 125 },
                      { x: 375, y: 135 },
                      { x: 475, y: 92 },
                      { x: 575, y: 74 },
                      { x: 675, y: 48 },
                      { x: 775, y: 35 },
                    ];
                    const activePoints = samplePoints.slice(0, replayScrub + 1);
                    if (activePoints.length < 2) return null;
                    const pathD = activePoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
                    const fillD = `${pathD} L ${activePoints[activePoints.length - 1].x} 175 L ${activePoints[0].x} 175 Z`;
                    return (
                      <g>
                        <path d={fillD} fill="url(#replayTrendGlow)" />
                        <path d={pathD} fill="none" stroke="#38D9FF" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />
                      </g>
                    );
                  })()}

                  {/* 8 Candlesticks with Wicks, Bodies, Volume & Catalyst Pins */}
                  {[
                    { x: 75, o: 168, c: 160, h: 154, l: 172, vol: 28, isBull: true, date: '04 OCT', catalyst: 'BASE SUPPORT' },
                    { x: 175, o: 160, c: 142, h: 136, l: 162, vol: 34, isBull: true, date: '18 OCT', catalyst: 'Q2 EARNINGS' },
                    { x: 275, o: 142, c: 125, h: 118, l: 148, vol: 49, isBull: true, date: '01 NOV', catalyst: 'BLOCK DEAL' },
                    { x: 375, o: 125, c: 135, h: 122, l: 140, vol: 31, isBull: false, date: '15 NOV', catalyst: 'PROFIT BOOK' },
                    { x: 475, o: 135, c: 92, h: 86, l: 138, vol: 72, isBull: true, date: '29 NOV', catalyst: 'CAPEX EXPANSION' },
                    { x: 575, o: 92, c: 74, h: 68, l: 98, vol: 58, isBull: true, date: '13 DEC', catalyst: 'REFINING SURGE' },
                    { x: 675, o: 74, c: 48, h: 42, l: 78, vol: 84, isBull: true, date: '27 DEC', catalyst: 'INDEX BREAKOUT' },
                    { x: 775, o: 48, c: 35, h: 28, l: 55, vol: 65, isBull: true, date: '10 JAN', catalyst: 'RECORD HIGH' },
                  ].map((c, idx) => {
                    const isRevealed = idx <= replayScrub;
                    const isActive = idx === replayScrub;
                    const candleColor = c.isBull ? '#39FF88' : '#FF4D67';
                    const topY = Math.min(c.o, c.c);
                    const bodyH = Math.max(4, Math.abs(c.o - c.c));
                    const volBarH = (c.vol / 85) * 45;

                    return (
                      <g
                        key={idx}
                        opacity={isRevealed ? 1 : 0.18}
                        style={{ transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
                      >
                        {/* Upper & Lower Wicks */}
                        <line
                          x1={c.x}
                          y1={c.h}
                          x2={c.x}
                          y2={c.l}
                          stroke={candleColor}
                          strokeWidth="2"
                        />

                        {/* Candlestick Body */}
                        <rect
                          x={c.x - 9}
                          y={topY}
                          width="18"
                          height={bodyH}
                          fill={candleColor}
                          rx="1"
                          filter={isActive ? 'url(#neonPulse)' : 'none'}
                          stroke={isActive ? '#FFFFFF' : 'none'}
                          strokeWidth={isActive ? '1' : '0'}
                        />

                        {/* Volume Bar in Sub-Panel */}
                        <rect
                          x={c.x - 7}
                          y={235 - volBarH}
                          width="14"
                          height={volBarH}
                          fill={candleColor}
                          opacity={isRevealed ? 0.45 : 0.1}
                          rx="1"
                        />

                        {/* Catalyst Marker Flag above Candle */}
                        {isRevealed && (
                          <g>
                            <circle cx={c.x} cy={c.h - 12} r="3" fill="#38D9FF" />
                            <line x1={c.x} y1={c.h - 9} x2={c.x} y2={c.h} stroke="#38D9FF" strokeWidth="1" strokeDasharray="1 1" />
                            <text
                              x={c.x}
                              y={c.h - 18}
                              fill="#38D9FF"
                              fontSize="8"
                              fontFamily="monospace"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              {c.catalyst}
                            </text>
                          </g>
                        )}

                        {/* Active Candle Vertical Beam Indicator */}
                        {isActive && (
                          <g>
                            <line
                              x1={c.x}
                              y1={20}
                              x2={c.x}
                              y2={235}
                              stroke="#38D9FF"
                              strokeWidth="1"
                              strokeDasharray="2 2"
                              opacity="0.75"
                            />
                            <rect
                              x={c.x - 22}
                              y="4"
                              width="44"
                              height="14"
                              fill="#07130F"
                              stroke="#38D9FF"
                              strokeWidth="1"
                              rx="2"
                            />
                            <text
                              x={c.x}
                              y="14"
                              fill="#38D9FF"
                              fontSize="8"
                              fontWeight="900"
                              fontFamily="monospace"
                              textAnchor="middle"
                            >
                              DAY {idx + 1}
                            </text>
                          </g>
                        )}

                        {/* Session Date Label */}
                        <text
                          x={c.x}
                          y="245"
                          fill={isActive ? '#39FF88' : '#71877B'}
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight={isActive ? 'bold' : 'normal'}
                          textAnchor="middle"
                        >
                          {c.date}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Interactive Timeline Scrubber */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#71877B' }}>
                <span>DRAG TO SCRUB TIMELINE:</span>
                <span style={{ color: '#39FF88', fontWeight: 800 }}>
                  MILESTONE {replayScrub + 1} OF 8
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="7"
                value={replayScrub}
                onChange={(e) => setReplayScrub(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#39FF88', cursor: 'pointer' }}
              />
            </div>

            {/* Why Did It Move Preview Banner */}
            <div
              style={{
                background: '#050B09',
                border: '1px solid rgba(56, 217, 255, 0.25)',
                padding: '14px 18px',
                borderRadius: '2px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <span style={{ fontSize: '10px', color: '#38D9FF', fontWeight: 800 }}>CATALYST & ATTRIBUTION:</span>
                <div style={{ fontSize: '12px', color: '#DDFBEA', marginTop: '2px' }}>
                  {[
                    'Base formation: Stable institutional support around ₹2,400.',
                    'Q2 Earnings Preview: Margin expansion reported in retail and telecom.',
                    'Institutional block deal: Domestic funds absorb supply.',
                    'Healthy pullback: Minor consolidation amidst broad market pause.',
                    'Capex announcement: Renewable energy investments outlined.',
                    'Refining margin breakout: Global diesel spreads widen.',
                    'Index rally: NIFTY 50 crosses 24,000 benchmark hurdle.',
                    'Closing rally: Full breakout completed with sustained delivery volumes.',
                  ][replayScrub]}
                </div>
              </div>
              <Link
                href="/replay?symbol=RELIANCE"
                style={{
                  padding: '8px 18px',
                  background: '#39FF88',
                  color: '#030807',
                  fontWeight: 900,
                  fontSize: '11px',
                  borderRadius: '2px',
                  textDecoration: 'none',
                }}
              >
                OPEN REPLAY ENGINE ▶
              </Link>
            </div>
          </div>
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
            Rotate through the 3D cylinder below to explore each of the 8 stages of your MarketForge trading journey.
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
