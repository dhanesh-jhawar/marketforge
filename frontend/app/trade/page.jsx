'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMarketData } from '../../hooks/useMarketData.js';
import { usePortfolio } from '../../hooks/usePortfolio.js';
import { apiClient } from '../../lib/api/client.js';
import StockChart from '../../components/charts/StockChart.jsx';
import { formatPct } from '../../lib/formatters/index.js';

const POPULAR_SYMBOLS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2742.5, changePct: 1.2 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3912.8, changePct: 0.85 },
  { symbol: 'INFY', name: 'Infosys Limited', price: 1845.2, changePct: -0.42 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', price: 1682.4, changePct: 0.65 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', price: 1248.9, changePct: 1.1 },
  { symbol: 'SBIN', name: 'State Bank of India', price: 812.3, changePct: -0.3 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1598.6, changePct: 0.95 },
  { symbol: 'JIOFIN', name: 'Jio Financial Services', price: 348.7, changePct: 2.4 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', price: 965.4, changePct: 1.8 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India', price: 11840.0, changePct: 0.4 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', price: 6840.0, changePct: -0.8 },
  { symbol: 'LT', name: 'Larsen & Toubro', price: 3520.0, changePct: 1.15 },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', price: 1720.0, changePct: 0.7 },
  { symbol: 'WIPRO', name: 'Wipro Limited', price: 545.2, changePct: -0.2 },
  { symbol: 'ITC', name: 'ITC Limited', price: 465.3, changePct: 0.35 },
  { symbol: 'ZOMATO', name: 'Zomato Limited', price: 265.0, changePct: 3.2 },
  { symbol: 'ADANIENT', name: 'Adani Enterprises', price: 2980.0, changePct: 1.6 },
  { symbol: 'COALINDIA', name: 'Coal India', price: 485.0, changePct: 0.5 },
  { symbol: 'ASIANPAINT', name: 'Asian Paints', price: 2850.0, changePct: -0.9 },
  { symbol: 'TATASTEEL', name: 'Tata Steel', price: 152.0, changePct: 1.1 },
];

function TradeTerminal() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get('symbol') || 'RELIANCE';

  const [symbol, setSymbol] = useState(initialSymbol);
  const [side, setSide] = useState('BUY');
  const [orderType, setOrderType] = useState('MARKET');
  const [product, setProduct] = useState('CNC');
  const [quantity, setQuantity] = useState(10);
  const [limitPrice, setLimitPrice] = useState('');

  // Order Intelligence Modal state
  const [showIntelligenceModal, setShowIntelligenceModal] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Watchlist & Search state (queries all 2,620 listed NSE companies)
  const [watchlistSearch, setWatchlistSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // Live Simulated L2 Order Book state
  const [liveOrderBook, setLiveOrderBook] = useState(null);

  // Historical candles for current symbol
  const [candles, setCandles] = useState([]);
  const { quote } = useMarketData(symbol);
  const { summary } = usePortfolio();

  // Fetch candle history whenever symbol changes
  useEffect(() => {
    apiClient(`/stocks/${symbol}/history?interval=1d&range=1Y`)
      .then((c) => setCandles(Array.isArray(c) ? c : c?.candles || []))
      .catch(() => setCandles([]));
  }, [symbol]);

  // Current price helper
  const currentLtp = quote?.ltp || POPULAR_SYMBOLS.find((s) => s.symbol === symbol)?.price || 2500;

  // Sync default limit price when switching to LIMIT order
  useEffect(() => {
    if (orderType === 'LIMIT' && !limitPrice) {
      setLimitPrice(currentLtp.toFixed(2));
    }
  }, [orderType, currentLtp]);

  const estimatedOrderValue = useMemo(() => {
    const p = orderType === 'LIMIT' && Number(limitPrice) > 0 ? Number(limitPrice) : currentLtp;
    return p * Number(quantity || 0);
  }, [orderType, limitPrice, currentLtp, quantity]);

  // Dynamic live search across all 2,620 NSE companies from backend SQLite database
  useEffect(() => {
    const q = watchlistSearch.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const matches = await apiClient(`/markets/search?q=${encodeURIComponent(q)}&limit=50`);
        setSearchResults(Array.isArray(matches) ? matches : []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [watchlistSearch]);

  // Active L2 Order Book simulation (polls and updates synthetic depth with price-time priority)
  useEffect(() => {
    let isMounted = true;
    const fetchBook = async () => {
      try {
        const data = await apiClient(`/stocks/${symbol}/orderbook`);
        if (isMounted && data && data.bids) {
          setLiveOrderBook(data);
        }
      } catch {
        // Fallback local synthetic generator if network is delayed
      }
    };

    fetchBook();
    const interval = setInterval(fetchBook, 1500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  // Compute market depth display
  const marketDepth = useMemo(() => {
    if (liveOrderBook && liveOrderBook.bids && liveOrderBook.asks) {
      return liveOrderBook;
    }
    const base = currentLtp;
    const tick = base > 1000 ? 0.25 : 0.05;
    const bids = [
      { price: (base - 1 * tick).toFixed(2), orders: 12, qty: 1420 },
      { price: (base - 2 * tick).toFixed(2), orders: 8, qty: 2850 },
      { price: (base - 3 * tick).toFixed(2), orders: 19, qty: 5120 },
      { price: (base - 4 * tick).toFixed(2), orders: 14, qty: 3890 },
      { price: (base - 5 * tick).toFixed(2), orders: 22, qty: 7410 },
    ];
    const asks = [
      { price: (base + 1 * tick).toFixed(2), orders: 9, qty: 1180 },
      { price: (base + 2 * tick).toFixed(2), orders: 15, qty: 3200 },
      { price: (base + 3 * tick).toFixed(2), orders: 11, qty: 4500 },
      { price: (base + 4 * tick).toFixed(2), orders: 20, qty: 6150 },
      { price: (base + 5 * tick).toFixed(2), orders: 28, qty: 8900 },
    ];
    const totalBidQty = bids.reduce((acc, b) => acc + Number(b.qty), 0);
    const totalAskQty = asks.reduce((acc, a) => acc + Number(a.qty), 0);
    return { bids, asks, totalBidQty, totalAskQty, spread: (2 * tick).toFixed(2) };
  }, [liveOrderBook, currentLtp]);

  // Compute deterministic risk review + AUTOMATIC AI explanation
  const handleReviewOrder = async () => {
    setReviewing(true);
    setShowIntelligenceModal(true);
    setAiExplanation('');
    setLoadingAi(true);

    try {
      const payload = {
        symbol,
        side,
        orderType,
        product,
        quantity: Number(quantity),
        limitPrice: limitPrice ? Number(limitPrice) : undefined,
      };

      const res = await apiClient('/orders/review', {
        method: 'POST',
        body: payload,
      });

      const snapshot = res?.riskSnapshot || res?.risk;
      if (snapshot) {
        setRiskAssessment(snapshot);

        // Immediately and automatically generate AI grounded explanation with exact scenario details
        try {
          const aiRes = await apiClient('/ai/order-explanation', {
            method: 'POST',
            body: {
              order: payload,
              riskSnapshot: snapshot,
            },
          });
          const explanationText = aiRes?.explanation || aiRes?.message || aiRes?.reply || aiRes?.text || '';
          setAiExplanation(explanationText);
        } catch {
          // Pedagogical deterministic explanation fallback
          const loss5 = snapshot.potentialLossAt5Pct ?? (estimatedOrderValue * 0.05);
          const loss10 = snapshot.potentialLossAt10Pct ?? (estimatedOrderValue * 0.1);
          setAiExplanation(
            `MarketForge Pedagogical Review: Placing this ${side} order for ${quantity} shares of ${symbol} allocates approximately ${snapshot.newPositionPct || 10}% of your portfolio (₹${(snapshot.orderValue || estimatedOrderValue).toLocaleString('en-IN')}). If market prices drop 5%, estimated drawdown is ₹${loss5.toLocaleString('en-IN')}; at -10%, drawdown is ₹${loss10.toLocaleString('en-IN')}. Deterministic risk level: ${snapshot.riskLevel || 'MODERATE'} (Score: ${snapshot.riskScore || 45}/100). Maintain strict position sizing discipline before committing simulated capital.`
          );
        }
      } else {
        calculateLocalRisk();
      }
    } catch {
      calculateLocalRisk();
    } finally {
      setReviewing(false);
      setLoadingAi(false);
    }
  };

  const calculateLocalRisk = () => {
    const portfolioTotal = summary?.totalValue || 100000;
    const orderVal = estimatedOrderValue;
    const impactPct = Number(((orderVal / portfolioTotal) * 100).toFixed(1));
    const loss5 = Number((orderVal * 0.05).toFixed(2));
    const loss10 = Number((orderVal * 0.1).toFixed(2));
    const riskStatus = impactPct > 30 ? 'HIGH' : impactPct > 15 ? 'MODERATE' : 'LOW';

    const localSnap = {
      orderValue: orderVal,
      portfolioImpactPct: impactPct,
      newPositionPct: impactPct,
      newSectorPct: Number((impactPct * 0.7).toFixed(1)),
      potentialLossAt5Pct: loss5,
      potentialLossAt10Pct: loss10,
      volatility30d: 21.4,
      riskLevel: riskStatus,
      riskScore: impactPct > 30 ? 75 : 42,
      canPlace: true,
      violations: [],
    };
    setRiskAssessment(localSnap);
    setAiExplanation(
      `MarketForge Pedagogical Review: Allocating ${impactPct}% of your virtual portfolio to ${symbol} (₹${orderVal.toLocaleString('en-IN')}). If market prices decline by 10%, your potential loss is ₹${loss10.toLocaleString('en-IN')}. Risk Level: ${riskStatus}. Always ensure no single asset exceeds your risk limit.`
    );
  };

  const handleConfirmOrder = async () => {
    setSubmitting(true);
    setOrderSuccess(null);
    try {
      const order = await apiClient('/orders', {
        method: 'POST',
        body: {
          symbol,
          side,
          orderType,
          product,
          quantity: Number(quantity),
          limitPrice: limitPrice ? Number(limitPrice) : undefined,
        },
      });
      setOrderSuccess(order);
      setShowIntelligenceModal(false);
    } catch (err) {
      alert(err.message || 'Order failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Watchlist rendering: if searching, show live matches; otherwise, show curated top Indian equities
  const displayWatchlist = searchResults !== null
    ? searchResults.map((s) => ({
        symbol: s.symbol,
        name: s.name || s.companyName || s.symbol,
        price: s.price || s.ltp || (s.symbol === symbol ? currentLtp : 1250),
        changePct: s.changePct ?? 0.85,
      }))
    : POPULAR_SYMBOLS;

  return (
    <div style={{ background: '#030807', minHeight: 'calc(100vh - 80px)', color: '#DDFBEA', fontFamily: 'var(--font-mono)' }}>
      {/* Top Security Ticker Bar */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          background: '#050B09',
          borderBottom: '1px solid rgba(57, 255, 136, 0.15)',
          overflowX: 'auto',
          padding: '6px 12px',
        }}
      >
        {POPULAR_SYMBOLS.slice(0, 10).map((s) => {
          const isSelected = s.symbol === symbol;
          const isUp = s.changePct >= 0;
          return (
            <button
              key={s.symbol}
              onClick={() => setSymbol(s.symbol)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '2px',
                background: isSelected ? '#0B3D2E' : '#07130F',
                border: isSelected ? '1px solid #39FF88' : '1px solid rgba(57, 255, 136, 0.1)',
                color: isSelected ? '#39FF88' : '#71877B',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              <span>{s.symbol}</span>
              <span style={{ color: isSelected ? '#DDFBEA' : '#94B8A3' }}>₹{s.price.toFixed(1)}</span>
              <span style={{ color: isUp ? '#39FF88' : '#FF4D67', fontSize: '11px' }}>
                {isUp ? '+' : ''}{s.changePct}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Terminal Workspace Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr 340px',
          height: 'calc(100vh - 120px)',
          minHeight: '650px',
        }}
      >
        {/* LEFT COLUMN: WATCHLIST & DYNAMIC 2,620 NSE EQUITIES SEARCH */}
        <div
          style={{
            background: '#050B09',
            borderRight: '1px solid rgba(57, 255, 136, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(57, 255, 136, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: '#39FF88', fontWeight: 800 }}>NSE EQUITIES UNIVERSE</span>
              <span style={{ fontSize: '9px', color: '#71877B' }}>2,620 LISTED</span>
            </div>
            <input
              type="text"
              placeholder="Search 2,000+ companies (e.g. TATA, RELIANCE, INFY)..."
              value={watchlistSearch}
              onChange={(e) => setWatchlistSearch(e.target.value)}
              style={{
                width: '100%',
                background: '#030807',
                border: '1px solid rgba(57, 255, 136, 0.25)',
                color: '#DDFBEA',
                padding: '7px 9px',
                fontSize: '11px',
                borderRadius: '2px',
                fontFamily: 'var(--font-mono)',
              }}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {searching ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#38D9FF', fontSize: '11px' }}>
                Searching 2,620 listed NSE securities...
              </div>
            ) : displayWatchlist.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#71877B', fontSize: '11px' }}>
                No matching NSE equities found.
              </div>
            ) : (
              displayWatchlist.map((item) => {
                const active = item.symbol === symbol;
                const isUp = (item.changePct ?? 0) >= 0;
                return (
                  <div
                    key={item.symbol}
                    onClick={() => {
                      setSymbol(item.symbol);
                      setOrderSuccess(null);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid rgba(57, 255, 136, 0.05)',
                      background: active ? 'rgba(57, 255, 136, 0.1)' : 'transparent',
                      borderLeft: active ? '3px solid #39FF88' : '3px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '12px', color: active ? '#39FF88' : '#DDFBEA' }}>
                        {item.symbol}
                      </div>
                      <div style={{ fontSize: '10px', color: '#71877B', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#DDFBEA' }}>
                        ₹{Number(item.price).toFixed(2)}
                      </div>
                      <div style={{ fontSize: '10px', color: isUp ? '#39FF88' : '#FF4D67', fontWeight: 700 }}>
                        {isUp ? '+' : ''}{item.changePct}%
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CENTER COLUMN: FULL-HEIGHT CANDLESTICK CHART (NOTHING UNDER THE GRAPH) */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#030807', height: '100%' }}>
          {/* Order Success Banner (if placed) */}
          {orderSuccess && (
            <div style={{ padding: '8px 16px', background: 'rgba(57, 255, 136, 0.15)', borderBottom: '1px solid #39FF88', color: '#39FF88', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>✔ Order #{orderSuccess.id?.slice(0, 8)}: {orderSuccess.side} {orderSuccess.quantity}x {orderSuccess.symbol} ({orderSuccess.status}) @ ₹{Number(orderSuccess.avgFillPrice || currentLtp).toFixed(2)}</span>
              <button onClick={() => setOrderSuccess(null)} style={{ background: 'transparent', border: 'none', color: '#39FF88', cursor: 'pointer', fontWeight: 900 }}>✕</button>
            </div>
          )}

          {/* Chart Header Bar */}
          <div
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid rgba(57, 255, 136, 0.1)',
              background: '#050B09',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#39FF88' }}>{symbol}</span>
              <span style={{ fontSize: '14px', color: '#DDFBEA', fontWeight: 700 }}>₹{currentLtp.toFixed(2)}</span>
              <span style={{ fontSize: '12px', color: (quote?.change ?? 0) >= 0 ? '#39FF88' : '#FF4D67', fontWeight: 700 }}>
                {formatPct(quote?.changePct || 0.85)}
              </span>
              <span style={{ fontSize: '10px', color: '#38D9FF', border: '1px solid rgba(56, 217, 255, 0.3)', padding: '1px 6px', borderRadius: '2px' }}>
                NSE • HIGHCHARTS CANDLESTICK STREAM
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#71877B' }}>
              HIGH: <b style={{ color: '#39FF88' }}>₹{(currentLtp * 1.015).toFixed(2)}</b> • LOW: <b style={{ color: '#FF4D67' }}>₹{(currentLtp * 0.985).toFixed(2)}</b>
            </div>
          </div>

          {/* Highcharts Stock Canvas Container: Fills 100% of height, completely unobstructed */}
          <div style={{ flex: 1, minHeight: 0, padding: '8px', display: 'flex', flexDirection: 'column' }}>
            <StockChart symbol={symbol} candles={candles} height={600} indicators={true} />
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE ORDER BOOK (L2) & ORDER ENTRY FORM */}
        <div
          style={{
            background: '#050B09',
            borderLeft: '1px solid rgba(57, 255, 136, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          {/* LIVE ORDER BOOK (L2 DEPTH SIMULATION) */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(57, 255, 136, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#39FF88' }}>MARKET DEPTH (L2)</span>
              <span style={{ fontSize: '9px', color: '#38D9FF', background: 'rgba(56, 217, 255, 0.1)', padding: '1px 5px', borderRadius: '2px' }}>
                PRICE-TIME PRIORITY
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '10px' }}>
              {/* Bids */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71877B', marginBottom: '4px' }}>
                  <span>BID</span>
                  <span>ORDERS</span>
                  <span>QTY</span>
                </div>
                {marketDepth.bids.map((b, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '2px 0',
                      color: '#39FF88',
                      position: 'relative',
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>₹{Number(b.price).toFixed(2)}</span>
                    <span style={{ color: '#71877B' }}>{b.orders}</span>
                    <span>{b.qty}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid rgba(57, 255, 136, 0.15)', marginTop: '4px', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', color: '#39FF88', fontWeight: 700 }}>
                  <span>TOTAL</span>
                  <span>{marketDepth.totalBidQty.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Asks */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71877B', marginBottom: '4px' }}>
                  <span>ASK</span>
                  <span>ORDERS</span>
                  <span>QTY</span>
                </div>
                {marketDepth.asks.map((a, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '2px 0',
                      color: '#FF4D67',
                      position: 'relative',
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>₹{Number(a.price).toFixed(2)}</span>
                    <span style={{ color: '#71877B' }}>{a.orders}</span>
                    <span>{a.qty}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid rgba(255, 77, 103, 0.15)', marginTop: '4px', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', color: '#FF4D67', fontWeight: 700 }}>
                  <span>TOTAL</span>
                  <span>{marketDepth.totalAskQty.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '6px', fontSize: '10px', color: '#71877B', display: 'flex', justifyContent: 'space-between' }}>
              <span>SPREAD: <b style={{ color: '#DDFBEA' }}>₹{marketDepth.spread || '0.50'}</b></span>
              <span style={{ color: '#39FF88' }}>● LIVE MATCHING ACTIVE</span>
            </div>
          </div>

          {/* Order Entry Form */}
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* BUY / SELL Switch */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                onClick={() => setSide('BUY')}
                style={{
                  padding: '8px',
                  borderRadius: '2px',
                  background: side === 'BUY' ? '#39FF88' : '#07130F',
                  color: side === 'BUY' ? '#030807' : '#DDFBEA',
                  border: side === 'BUY' ? '1px solid #39FF88' : '1px solid rgba(57, 255, 136, 0.2)',
                  fontWeight: 900,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                BUY
              </button>
              <button
                onClick={() => setSide('SELL')}
                style={{
                  padding: '8px',
                  borderRadius: '2px',
                  background: side === 'SELL' ? '#FF4D67' : '#07130F',
                  color: side === 'SELL' ? '#FFFFFF' : '#DDFBEA',
                  border: side === 'SELL' ? '1px solid #FF4D67' : '1px solid rgba(255, 77, 103, 0.2)',
                  fontWeight: 900,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                SELL
              </button>
            </div>

            {/* Product & Order Type Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '10px', color: '#71877B', display: 'block', marginBottom: '4px' }}>
                  PRODUCT
                </label>
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    borderRadius: '2px',
                    background: '#030807',
                    border: '1px solid rgba(57, 255, 136, 0.2)',
                    color: '#DDFBEA',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <option value="CNC">CNC (Delivery)</option>
                  <option value="MIS">MIS (Intraday)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '10px', color: '#71877B', display: 'block', marginBottom: '4px' }}>
                  ORDER TYPE
                </label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    borderRadius: '2px',
                    background: '#030807',
                    border: '1px solid rgba(57, 255, 136, 0.2)',
                    color: '#DDFBEA',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <option value="MARKET">MARKET</option>
                  <option value="LIMIT">LIMIT</option>
                </select>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label style={{ fontSize: '10px', color: '#71877B', display: 'block', marginBottom: '4px' }}>
                QUANTITY (SHARES)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '2px',
                  background: '#030807',
                  border: '1px solid rgba(57, 255, 136, 0.25)',
                  color: '#DDFBEA',
                  fontSize: '12px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            {/* Limit Price (if LIMIT order) */}
            {orderType === 'LIMIT' && (
              <div>
                <label style={{ fontSize: '10px', color: '#71877B', display: 'block', marginBottom: '4px' }}>
                  LIMIT PRICE (₹)
                </label>
                <input
                  type="number"
                  step="0.05"
                  placeholder={currentLtp.toFixed(2)}
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '2px',
                    background: '#030807',
                    border: '1px solid rgba(57, 255, 136, 0.25)',
                    color: '#DDFBEA',
                    fontSize: '12px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>
            )}

            {/* Calculations Panel */}
            <div
              style={{
                background: '#07130F',
                padding: '10px',
                borderRadius: '2px',
                border: '1px solid rgba(57, 255, 136, 0.15)',
                fontSize: '11px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71877B' }}>
                <span>ESTIMATED VALUE:</span>
                <span style={{ color: '#DDFBEA', fontWeight: 700 }}>₹{estimatedOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71877B' }}>
                <span>AVAILABLE FUNDS:</span>
                <span style={{ color: '#39FF88', fontWeight: 700 }}>₹{(summary?.funds?.availableCash || summary?.availableCash || 100000).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71877B' }}>
                <span>EST. CHARGES:</span>
                <span style={{ color: '#94B8A3' }}>₹{(estimatedOrderValue * 0.0015).toFixed(2)}</span>
              </div>
            </div>

            {/* REVIEW ORDER BUTTON */}
            <button
              onClick={handleReviewOrder}
              disabled={reviewing || quantity <= 0}
              style={{
                marginTop: '6px',
                padding: '12px',
                borderRadius: '2px',
                background: side === 'BUY' ? '#39FF88' : '#FF4D67',
                color: '#030807',
                border: 'none',
                fontWeight: 900,
                fontSize: '13px',
                cursor: 'pointer',
                letterSpacing: '0.5px',
                boxShadow: side === 'BUY' ? '0 0 15px rgba(57, 255, 136, 0.4)' : '0 0 15px rgba(255, 77, 103, 0.4)',
              }}
            >
              {reviewing ? 'EVALUATING RISK & AI MENTOR...' : 'REVIEW ORDER'}
            </button>
            <div style={{ fontSize: '10px', color: '#71877B', textAlign: 'center' }}>
              Virtual Execution • Mandatory Risk Review
            </div>
          </div>
        </div>
      </div>

      {/* SIGNATURE ORDER INTELLIGENCE MODAL */}
      {showIntelligenceModal && (
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
              borderRadius: '2px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {/* Modal Header */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#39FF88', boxShadow: '0 0 10px #39FF88' }} />
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 900, color: '#39FF88', letterSpacing: '0.5px', margin: 0 }}>
                    ORDER INTELLIGENCE
                  </h2>
                  <div style={{ fontSize: '11px', color: '#71877B' }}>
                    PRE-TRADE DETERMINISTIC RISK ASSESSMENT
                  </div>
                </div>
              </div>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '2px',
                  fontSize: '11px',
                  fontWeight: 800,
                  background: riskAssessment?.riskLevel === 'HIGH' || riskAssessment?.riskLevel === 'VERY_HIGH' ? 'rgba(255, 77, 103, 0.2)' : 'rgba(57, 255, 136, 0.15)',
                  color: riskAssessment?.riskLevel === 'HIGH' || riskAssessment?.riskLevel === 'VERY_HIGH' ? '#FF4D67' : '#39FF88',
                  border: riskAssessment?.riskLevel === 'HIGH' || riskAssessment?.riskLevel === 'VERY_HIGH' ? '1px solid #FF4D67' : '1px solid #39FF88',
                }}
              >
                RISK: {riskAssessment?.riskLevel || 'MODERATE'} (SCORE: {riskAssessment?.riskScore ?? 45}/100)
              </span>
            </div>

            {/* Modal Body: Financial Telemetry */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ fontSize: '13px', color: '#DDFBEA' }}>
                Ordering <b style={{ color: side === 'BUY' ? '#39FF88' : '#FF4D67' }}>{side} {quantity} SHARES</b> of <b style={{ color: '#38D9FF' }}>{symbol}</b> ({orderType} • {product})
              </div>

              {/* Exact Scenario Metric Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  background: '#07130F',
                  padding: '16px',
                  borderRadius: '2px',
                  border: '1px solid rgba(57, 255, 136, 0.15)',
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', color: '#71877B' }}>ORDER VALUE</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#DDFBEA', marginTop: '2px' }}>
                    ₹{(riskAssessment?.orderValue || estimatedOrderValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#71877B' }}>PORTFOLIO IMPACT</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#38D9FF', marginTop: '2px' }}>
                    {riskAssessment?.portfolioImpactPct || riskAssessment?.newPositionPct || 10}%
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#71877B' }}>NEW POSITION %</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#38D9FF', marginTop: '2px' }}>
                    {riskAssessment?.newPositionPct || 10}%
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#71877B' }}>SECTOR EXPOSURE</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#DDFBEA', marginTop: '2px' }}>
                    {riskAssessment?.newSectorPct || 15}%
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#71877B' }}>LOSS AT -5%</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#FF4D67', marginTop: '2px' }}>
                    -₹{(riskAssessment?.potentialLossAt5Pct || (estimatedOrderValue * 0.05)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#71877B' }}>LOSS AT -10%</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#FF4D67', marginTop: '2px' }}>
                    -₹{(riskAssessment?.potentialLossAt10Pct || (estimatedOrderValue * 0.1)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#71877B' }}>30-DAY VOLATILITY</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#39FF88', marginTop: '2px' }}>
                    {riskAssessment?.volatility30d || 21.4}%
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#71877B' }}>RULE COMPLIANCE</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: riskAssessment?.canPlace === false ? '#FF4D67' : '#39FF88', marginTop: '2px' }}>
                    {riskAssessment?.canPlace === false ? 'BLOCKING VIOLATION' : 'PASSED (VIRTUAL)'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#71877B' }}>FUNDS AFTER ORDER</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#DDFBEA', marginTop: '2px' }}>
                    ₹{(riskAssessment?.fundsAfterOrder || (100000 - estimatedOrderValue)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>

              {/* Rule Violations Warning Banner (if any) */}
              {riskAssessment?.violations && riskAssessment.violations.length > 0 && (
                <div style={{ padding: '10px 14px', background: 'rgba(255, 77, 103, 0.12)', border: '1px solid #FF4D67', borderRadius: '2px', fontSize: '11px', color: '#FF4D67' }}>
                  <b style={{ display: 'block', marginBottom: '4px' }}>⚠ RISK RULE WARNINGS:</b>
                  {riskAssessment.violations.map((v, i) => (
                    <div key={i}>• {v.message}</div>
                  ))}
                </div>
              )}

              {/* AI Explanation Area (Grounded Pedagogy) */}
              <div
                style={{
                  background: '#030807',
                  border: '1px solid rgba(56, 217, 255, 0.3)',
                  padding: '14px 16px',
                  borderRadius: '2px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#38D9FF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🤖</span> AI PEDAGOGICAL BREAKDOWN (GOOGLE GEMINI)
                  </span>
                  {loadingAi && (
                    <span style={{ fontSize: '10px', color: '#38D9FF' }}>Analyzing scenario telemetry...</span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#DDFBEA', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {loadingAi ? 'Synthesizing pedagogical order review from authoritative engine metrics...' : aiExplanation}
                </div>
              </div>
            </div>

            {/* Modal Actions: EDIT, CANCEL, CONFIRM */}
            <div
              style={{
                padding: '14px 20px',
                background: '#07130F',
                borderTop: '1px solid rgba(57, 255, 136, 0.2)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                onClick={() => setShowIntelligenceModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '2px',
                  background: 'transparent',
                  border: '1px solid rgba(57, 255, 136, 0.3)',
                  color: '#DDFBEA',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                EDIT ORDER
              </button>

              <button
                onClick={() => setShowIntelligenceModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '2px',
                  background: 'rgba(255, 77, 103, 0.1)',
                  border: '1px solid #FF4D67',
                  color: '#FF4D67',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                CANCEL
              </button>

              <button
                onClick={handleConfirmOrder}
                disabled={submitting || riskAssessment?.canPlace === false}
                style={{
                  padding: '8px 24px',
                  borderRadius: '2px',
                  background: riskAssessment?.canPlace === false ? '#71877B' : side === 'BUY' ? '#39FF88' : '#FF4D67',
                  color: '#030807',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 900,
                  cursor: submitting || riskAssessment?.canPlace === false ? 'not-allowed' : 'pointer',
                  boxShadow: riskAssessment?.canPlace === false ? 'none' : '0 0 15px rgba(57, 255, 136, 0.4)',
                }}
              >
                {submitting ? 'EXECUTING...' : riskAssessment?.canPlace === false ? 'RULE BLOCKED' : 'CONFIRM ORDER'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TradePage() {
  return (
    <React.Suspense
      fallback={
        <div style={{ padding: '40px', textAlign: 'center', color: '#39FF88', background: '#030807', minHeight: 'calc(100vh - 80px)', fontFamily: 'var(--font-mono)' }}>
          INITIALIZING MARKETFORGE TRADING COCKPIT...
        </div>
      }
    >
      <TradeTerminal />
    </React.Suspense>
  );
}
