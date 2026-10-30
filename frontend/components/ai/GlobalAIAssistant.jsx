'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext.jsx';
import { useMarket } from '../../context/MarketContext.jsx';
import { usePortfolio } from '../../hooks/usePortfolio.js';
import { apiClient } from '../../lib/api/client.js';

export default function GlobalAIAssistant() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { summary } = usePortfolio();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Greetings Trader. I am your MarketForge AI Intelligence Layer. I can explain order risk, market dynamics, technical patterns, and financial concepts. I will never tell you what to buy.',
    },
  ]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, loading, isOpen]);

  const handleScrollWheel = (e) => {
    if (messagesContainerRef.current) {
      e.stopPropagation();
      messagesContainerRef.current.scrollTop += e.deltaY;
    }
  };

  // Context-aware suggested prompts based on current route
  const getContextualPrompts = () => {
    if (pathname.startsWith('/trade')) {
      return ['Explain my order risk', 'What is CNC vs MIS?', 'How should I size my position?'];
    }
    if (pathname.startsWith('/markets/')) {
      const symbol = pathname.split('/')[2] || 'RELIANCE';
      return [`Explain ${symbol}'s business model`, `What are key risk factors for ${symbol}?`, 'Explain P/E ratio and valuation'];
    }
    if (pathname === '/markets') {
      return ['What drives NIFTY 50 today?', 'Explain market capitalization tiers', 'How do sectors rotate?'];
    }
    if (pathname === '/portfolio') {
      return ['Why is my portfolio concentrated?', 'How can I hedge downside risk?', 'What is max drawdown?'];
    }
    if (pathname.startsWith('/learn')) {
      return ['Explain stop-loss discipline', 'How do candlesticks work?', 'What is risk-to-reward ratio?'];
    }
    if (pathname === '/what-if') {
      return ['Explain the COVID-19 liquidity shock', 'Why does SIP beat lump-sum in bear markets?', 'What is sequence of returns risk?'];
    }
    return ['How does virtual order matching work?', 'Explain market orders vs limit orders', 'What are good risk guidelines?'];
  };

  const handleSendMessage = async (msgText) => {
    const query = msgText || inputMessage;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      // Send grounded context payload
      const res = await apiClient('/ai/chat', {
        method: 'POST',
        body: {
          message: query,
          context: {
            route: pathname,
            userLevel: user?.level || 'Beginner',
            userXp: user?.xp || 150,
            portfolioValue: summary?.totalValue || 100000,
            availableCash: summary?.funds?.availableCash || 100000,
            holdingsCount: summary?.positionsCount || 0,
            lastAction: `Navigated to ${pathname}`,
          },
        },
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res?.message || res?.reply || res?.explanation || res?.text || 'MarketForge Intelligence: Keep in mind that capital preservation and risk sizing are paramount in equity trading.',
        },
      ]);
    } catch {
      // Pedagogical fallback
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `MarketForge Intelligence: Based on your current route (${pathname}), remember that virtual capital allows you to test hypotheses safely. Focus on position sizing (max 10-20% per trade) and predefined stop-loss boundaries rather than chasing short-term price momentum.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open AI Market Intelligence"
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '2px',
            background: 'linear-gradient(135deg, #07130F 0%, #0B3D2E 100%)',
            border: '1px solid #39FF88',
            boxShadow: isOpen
              ? '0 0 25px rgba(57, 255, 136, 0.6), inset 0 0 10px rgba(57, 255, 136, 0.3)'
              : '0 0 15px rgba(57, 255, 136, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span
              style={{
                fontSize: '18px',
                color: '#39FF88',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                textShadow: '0 0 8px #39FF88',
              }}
            >
              AI
            </span>
            <span
              style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#38D9FF',
                boxShadow: '0 0 8px #38D9FF',
              }}
            />
          </div>
        </button>
      </div>

      {/* Slide-out Intelligence Terminal Drawer */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '88px',
            right: '24px',
            width: '420px',
            maxWidth: 'calc(100vw - 32px)',
            height: '600px',
            maxHeight: 'calc(100vh - 120px)',
            background: '#050B09',
            border: '1px solid #39FF88',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.9), 0 0 20px rgba(57, 255, 136, 0.2)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '2px',
            fontFamily: 'var(--font-mono)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              background: '#07130F',
              borderBottom: '1px solid rgba(57, 255, 136, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#39FF88', boxShadow: '0 0 8px #39FF88' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#39FF88', letterSpacing: '0.5px' }}>
                  AI MARKET INTELLIGENCE
                </div>
                <div style={{ fontSize: '10px', color: '#71877B' }}>
                  ROUTE: {pathname.toUpperCase()} • GROUNDED PEDAGOGY
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#71877B',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages Stream */}
          <div
            ref={messagesContainerRef}
            onWheel={handleScrollWheel}
            style={{
              flex: 1,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: '12px',
              lineHeight: 1.5,
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                  background: m.role === 'user' ? 'rgba(57, 255, 136, 0.12)' : '#07130F',
                  border: m.role === 'user' ? '1px solid rgba(57, 255, 136, 0.4)' : '1px solid rgba(57, 255, 136, 0.15)',
                  color: m.role === 'user' ? '#DDFBEA' : '#94B8A3',
                  padding: '10px 14px',
                  borderRadius: '2px',
                }}
              >
                <div style={{ fontSize: '10px', color: m.role === 'user' ? '#39FF88' : '#38D9FF', marginBottom: '4px', fontWeight: 700 }}>
                  {m.role === 'user' ? 'YOU' : 'MARKETFORGE AI'}
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
              </div>
            ))}
            {loading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '8px 12px',
                  background: '#07130F',
                  border: '1px solid rgba(57, 255, 136, 0.2)',
                  color: '#39FF88',
                  fontSize: '11px',
                }}
              >
                Analyzing market telemetry & risk factors...
              </div>
            )}
          </div>

          {/* Contextual Suggestions */}
          <div
            style={{
              padding: '8px 12px',
              background: '#030807',
              borderTop: '1px solid rgba(57, 255, 136, 0.1)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            {getContextualPrompts().map((p, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(p)}
                style={{
                  padding: '4px 8px',
                  background: 'rgba(57, 255, 136, 0.05)',
                  border: '1px solid rgba(57, 255, 136, 0.2)',
                  color: '#39FF88',
                  fontSize: '10px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                ⚡ {p}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: '12px',
              background: '#07130F',
              borderTop: '1px solid rgba(57, 255, 136, 0.2)',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              type="text"
              placeholder="Ask about this page or financial concept..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              style={{
                flex: 1,
                background: '#030807',
                border: '1px solid rgba(57, 255, 136, 0.25)',
                color: '#DDFBEA',
                padding: '8px 12px',
                fontSize: '12px',
                borderRadius: '2px',
                fontFamily: 'var(--font-mono)',
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMessage.trim()}
              style={{
                padding: '8px 14px',
                background: '#39FF88',
                color: '#030807',
                border: '1px solid #39FF88',
                fontWeight: 800,
                fontSize: '12px',
                borderRadius: '2px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              SEND
            </button>
          </div>
        </div>
      )}
    </>
  );
}
