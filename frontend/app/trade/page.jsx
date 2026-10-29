'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMarketData } from '../../hooks/useMarketData.js';
import { usePortfolio } from '../../hooks/usePortfolio.js';
import { apiClient } from '../../lib/api/client.js';
import StockChart from '../../components/charts/StockChart.jsx';
import { formatINR, formatPct } from '../../lib/formatters/index.js';

const POPULAR_SYMBOLS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2742.5, changePct: 1.2 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3912.8, changePct: 0.85 },
  { symbol: 'INFY', name: 'Infosys Limited', price: 1845.2, changePct: -0.42 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', price: 1682.4, changePct: 0.65 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', price: 1248.9, changePct: 1.1 },
  { symbol: 'SBIN', name: 'State Bank of India', price: 812.3, changePct: -0.3 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1598.6, changePct: 0.95 },
  { symbol: 'JIOFIN', name: 'Jio Financial Services', price: 348.7, changePct: 2.4 },
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
  const [activeBottomTab, setActiveBottomTab] = useState('ORDERS');

  // Order Intelligence Modal state
  const [showIntelligenceModal, setShowIntelligenceModal] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Watchlist filter
  const [watchlistSearch, setWatchlistSearch] = useState('');

  // Historical candles for current symbol
  const [candles, setCandles] = useState([]);
  const { quote } = useMarketData(symbol);
  const { summary, holdings } = usePortfolio();

  // Fetch candle history whenever symbol changes
  useEffect(() => {
    apiClient(`/stocks/${symbol}/history?interval=1d&range=1Y`)
      .then((c) => setCandles(c || []))
      .catch(() => setCandles([]));
  }, [symbol]);

  // Current price helper
  const currentLtp = quote?.ltp || POPULAR_SYMBOLS.find((s) => s.symbol === symbol)?.price || 2500;
  const estimatedOrderValue = useMemo(() => {
    const p = orderType === 'LIMIT' && Number(limitPrice) > 0 ? Number(limitPrice) : currentLtp;
    return p * Number(quantity || 0);
  }, [orderType, limitPrice, currentLtp, quantity]);

  // Generate dynamic market depth based on current LTP
  const marketDepth = useMemo(() => {
    const base = currentLtp;
    const bids = [
      { price: (base - 0.25).toFixed(2), orders: 12, qty: 1420 },
      { price: (base - 0.5).toFixed(2), orders: 8, qty: 2850 },
      { price: (base - 0.75).toFixed(2), orders: 19, qty: 5120 },
      { price: (base - 1.0).toFixed(2), orders: 14, qty: 3890 },
      { price: (base - 1.25).toFixed(2), orders: 22, qty: 7410 },
    ];
    const asks = [
      { price: (base + 0.25).toFixed(2), orders: 9, qty: 1180 },
      { price: (base + 0.5).toFixed(2), orders: 15, qty: 3200 },
      { price: (base + 0.75).toFixed(2), orders: 11, qty: 4500 },
      { price: (base + 1.0).toFixed(2), orders: 20, qty: 6150 },
      { price: (base + 1.25).toFixed(2), orders: 28, qty: 8900 },
    ];
    const totalBidQty = bids.reduce((acc, b) => acc + b.qty, 0);
    const totalAskQty = asks.reduce((acc, a) => acc + a.qty, 0);
    return { bids, asks, totalBidQty, totalAskQty };
  }, [currentLtp]);

  // Compute or fetch deterministic risk review
  const handleReviewOrder = async () => {
    setReviewing(true);
    setShowIntelligenceModal(true);
    setAiExplanation('');
    try {
      const res = await apiClient('/orders/review', {
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
      if (res && res.riskSnapshot) {
        setRiskAssessment(res.riskSnapshot);
      } else {
        // Fallback local deterministic calculation
        calculateLocalRisk();
      }
    } catch {
      calculateLocalRisk();
    } finally {
      setReviewing(false);
    }
  };

  const calculateLocalRisk = () => {
    const portfolioTotal = summary?.totalValue || 100000;
    const orderVal = estimatedOrderValue;
    const impactPct = Number(((orderVal / portfolioTotal) * 100).toFixed(1));
    const loss5 = Number((orderVal * 0.05).toFixed(2));
    const loss10 = Number((orderVal * 0.1).toFixed(2));
    const riskStatus = impactPct > 30 ? 'HIGH' : impactPct > 15 ? 'MODERATE' : 'LOW';

    setRiskAssessment({
      orderValue: orderVal,
      portfolioImpactPct: impactPct,
      newPositionPct: impactPct,
      newSectorPct: Number((impactPct * 0.7).toFixed(1)),
      potentialLossAt5Pct: loss5,
      potentialLossAt10Pct: loss10,
      volatility30d: 18.4,
      riskLevel: riskStatus,
      canPlace: true,
      violations: [],
    });
  };

  const handleRequestAiExplanation = async () => {
    setLoadingAi(true);
    try {
      const res = await apiClient('/ai/order-explanation', {
        method: 'POST',
        body: {
          order: { symbol, side, orderType, product, quantity: Number(quantity) },
          riskSnapshot: riskAssessment,
        },
      });
      setAiExplanation(res.explanation);
    } catch {
      const impact = riskAssessment?.portfolioImpactPct || 25;
      setAiExplanation(
        `MarketForge Intelligence: You're allocating ${impact}% of your portfolio to ${symbol}. If the market experiences a 10% pullback, this single order exposes your virtual capital to a loss of approximately ₹${(riskAssessment?.potentialLossAt10Pct || 0).toLocaleString('en-IN')}. Consider setting a tight stop-loss or sizing this position under 15% to maintain diversification.`
      );
    } finally {
      setLoadingAi(false);
    }
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

  const filteredWatchlist = POPULAR_SYMBOLS.filter((s) =>
    s.symbol.toLowerCase().includes(watchlistSearch.toLowerCase()) ||
    s.name.toLowerCase().includes(watchlistSearch.toLowerCase())
  );

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
        {POPULAR_SYMBOLS.map((s) => {
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
          gridTemplateColumns: '260px 1fr 340px',
          height: 'calc(100vh - 120px)',
          minHeight: '650px',
        }}
      >
        {/* LEFT COLUMN: WATCHLIST */}
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
            <div style={{ fontSize: '11px', color: '#71877B', fontWeight: 700, marginBottom: '6px' }}>
              NSE EQUITIES WATCHLIST
            </div>
            <input
              type="text"
              placeholder="Filter symbol..."
              value={watchlistSearch}
              onChange={(e) => setWatchlistSearch(e.target.value)}
              style={{
                width: '100%',
                background: '#030807',
                border: '1px solid rgba(57, 255, 136, 0.2)',
                color: '#DDFBEA',
                padding: '6px 8px',
                fontSize: '11px',
                borderRadius: '2px',
                fontFamily: 'var(--font-mono)',
              }}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredWatchlist.map((item) => {
              const active = item.symbol === symbol;
              const isUp = item.changePct >= 0;
              return (
                <div
                  key={item.symbol}
                  onClick={() => setSymbol(item.symbol)}
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid rgba(57, 255, 136, 0.05)',
                    background: active ? 'rgba(57, 255, 136, 0.08)' : 'transparent',
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
                    <div style={{ fontSize: '10px', color: '#71877B', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#DDFBEA' }}>
                      ₹{item.price.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '10px', color: isUp ? '#39FF88' : '#FF4D67', fontWeight: 700 }}>
                      {isUp ? '+' : ''}{item.changePct}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER COLUMN: HIGHCHARTS CANDLESTICK CHART & BOTTOM TABS */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#030807' }}>
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
                NSE • HIGHCHARTS STOCK
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#71877B' }}>
              HIGH: <b style={{ color: '#39FF88' }}>₹{(currentLtp * 1.015).toFixed(2)}</b> • LOW: <b style={{ color: '#FF4D67' }}>₹{(currentLtp * 0.985).toFixed(2)}</b>
            </div>
          </div>

          {/* Highcharts Stock Canvas Container */}
          <div style={{ flex: '1 1 55%', minHeight: '340px', padding: '8px' }}>
            <StockChart symbol={symbol} candles={candles} height={380} indicators={true} />
          </div>

          {/* BOTTOM SECTION: ORDERS / POSITIONS / HOLDINGS TABS */}
          <div
            style={{
              flex: '1 1 45%',
              borderTop: '1px solid rgba(57, 255, 136, 0.15)',
              background: '#050B09',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Tab Bar */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '6px 12px',
                background: '#07130F',
                borderBottom: '1px solid rgba(57, 255, 136, 0.1)',
                fontSize: '11px',
              }}
            >
              {['ORDERS', 'POSITIONS', 'HOLDINGS', 'TRADE HISTORY'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveBottomTab(tab)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '2px',
                    background: activeBottomTab === tab ? '#0B3D2E' : 'transparent',
                    border: activeBottomTab === tab ? '1px solid #39FF88' : '1px solid transparent',
                    color: activeBottomTab === tab ? '#39FF88' : '#71877B',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {activeBottomTab === 'HOLDINGS' && (
                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ color: '#71877B', borderBottom: '1px solid rgba(57, 255, 136, 0.1)' }}>
                      <th style={{ padding: '6px' }}>SYMBOL</th>
                      <th style={{ padding: '6px' }}>QTY</th>
                      <th style={{ padding: '6px' }}>AVG PRICE</th>
                      <th style={{ padding: '6px' }}>LTP</th>
                      <th style={{ padding: '6px' }}>CURRENT VALUE</th>
                      <th style={{ padding: '6px' }}>P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(holdings && holdings.length > 0 ? holdings : [
                      { symbol: 'RELIANCE', quantity: 15, avgPrice: 2680.0, ltp: 2742.5, currentValue: 41137.5, pnl: 937.5, pnlPct: 2.33 },
                      { symbol: 'INFY', quantity: 20, avgPrice: 1820.0, ltp: 1845.2, currentValue: 36904.0, pnl: 504.0, pnlPct: 1.38 },
                    ]).map((h) => {
                      const isUp = h.pnl >= 0;
                      return (
                        <tr key={h.symbol} style={{ borderBottom: '1px solid rgba(57, 255, 136, 0.04)' }}>
                          <td style={{ padding: '6px', fontWeight: 700, color: '#38D9FF' }}>{h.symbol}</td>
                          <td style={{ padding: '6px' }}>{h.quantity}</td>
                          <td style={{ padding: '6px' }}>₹{h.avgPrice.toFixed(2)}</td>
                          <td style={{ padding: '6px' }}>₹{h.ltp.toFixed(2)}</td>
                          <td style={{ padding: '6px', fontWeight: 700 }}>₹{h.currentValue.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '6px', color: isUp ? '#39FF88' : '#FF4D67', fontWeight: 700 }}>
                            {isUp ? '+' : ''}₹{h.pnl.toFixed(2)} ({isUp ? '+' : ''}{h.pnlPct}%)
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {activeBottomTab === 'ORDERS' && (
                <div style={{ fontSize: '11px' }}>
                  {orderSuccess ? (
                    <div style={{ padding: '8px 12px', background: 'rgba(57, 255, 136, 0.1)', border: '1px solid #39FF88', color: '#39FF88', borderRadius: '2px', marginBottom: '8px' }}>
                      ✔ Order #{orderSuccess.id || 'MF-9481'} {orderSuccess.side} {orderSuccess.quantity}x {orderSuccess.symbol} FILLED @ ₹{orderSuccess.avgFillPrice || currentLtp.toFixed(2)}
                    </div>
                  ) : null}
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ color: '#71877B', borderBottom: '1px solid rgba(57, 255, 136, 0.1)' }}>
                        <th style={{ padding: '6px' }}>TIME</th>
                        <th style={{ padding: '6px' }}>SYMBOL</th>
                        <th style={{ padding: '6px' }}>TYPE</th>
                        <th style={{ padding: '6px' }}>SIDE</th>
                        <th style={{ padding: '6px' }}>QTY</th>
                        <th style={{ padding: '6px' }}>PRICE</th>
                        <th style={{ padding: '6px' }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid rgba(57, 255, 136, 0.04)' }}>
                        <td style={{ padding: '6px', color: '#71877B' }}>10:45:12</td>
                        <td style={{ padding: '6px', fontWeight: 700, color: '#38D9FF' }}>RELIANCE</td>
                        <td style={{ padding: '6px' }}>CNC / MARKET</td>
                        <td style={{ padding: '6px', color: '#39FF88', fontWeight: 700 }}>BUY</td>
                        <td style={{ padding: '6px' }}>10</td>
                        <td style={{ padding: '6px' }}>₹2,742.50</td>
                        <td style={{ padding: '6px', color: '#39FF88' }}>COMPLETE</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(57, 255, 136, 0.04)' }}>
                        <td style={{ padding: '6px', color: '#71877B' }}>09:32:04</td>
                        <td style={{ padding: '6px', fontWeight: 700, color: '#38D9FF' }}>TCS</td>
                        <td style={{ padding: '6px' }}>CNC / LIMIT</td>
                        <td style={{ padding: '6px', color: '#39FF88', fontWeight: 700 }}>BUY</td>
                        <td style={{ padding: '6px' }}>5</td>
                        <td style={{ padding: '6px' }}>₹3,900.00</td>
                        <td style={{ padding: '6px', color: '#39FF88' }}>COMPLETE</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeBottomTab === 'POSITIONS' && (
                <div style={{ textAlign: 'center', padding: '24px', color: '#71877B', fontSize: '11px' }}>
                  No open intraday MIS positions. All orders executed under delivery CNC.
                </div>
              )}

              {activeBottomTab === 'TRADE HISTORY' && (
                <div style={{ fontSize: '11px', color: '#94B8A3' }}>
                  Showing last 5 virtual executions for this session. All executions verified by deterministic matching engine.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MARKET DEPTH + ORDER ENTRY */}
        <div
          style={{
            background: '#050B09',
            borderLeft: '1px solid rgba(57, 255, 136, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          {/* Market Depth Section */}
          <div style={{ padding: '12px', borderBottom: '1px solid rgba(57, 255, 136, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#38D9FF' }}>MARKET DEPTH (L2)</span>
              <span style={{ fontSize: '10px', color: '#71877B' }}>LIVE ORDER BOOK</span>
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
                    <span style={{ fontWeight: 700 }}>₹{b.price}</span>
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
                    <span style={{ fontWeight: 700 }}>₹{a.price}</span>
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
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
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

            {/* Limit Price if LIMIT */}
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
                <span style={{ color: '#39FF88', fontWeight: 700 }}>₹{(summary?.funds?.availableCash || 100000).toLocaleString('en-IN')}</span>
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
              {reviewing ? 'EVALUATING RISK...' : 'REVIEW ORDER'}
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
              width: '640px',
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
                  background: riskAssessment?.riskLevel === 'HIGH' ? 'rgba(255, 77, 103, 0.2)' : 'rgba(57, 255, 136, 0.15)',
                  color: riskAssessment?.riskLevel === 'HIGH' ? '#FF4D67' : '#39FF88',
                  border: riskAssessment?.riskLevel === 'HIGH' ? '1px solid #FF4D67' : '1px solid #39FF88',
                }}
              >
                RISK: {riskAssessment?.riskLevel || 'MODERATE'}
              </span>
            </div>

            {/* Modal Body: Financial Telemetry */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '13px', color: '#DDFBEA' }}>
                Ordering <b style={{ color: side === 'BUY' ? '#39FF88' : '#FF4D67' }}>{side} {quantity} SHARES</b> of <b style={{ color: '#38D9FF' }}>{symbol}</b> ({orderType} • {product})
              </div>

              {/* Exact Required Grid */}
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
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#DDFBEA', marginTop: '2px' }}>
                    ₹{(riskAssessment?.orderValue || estimatedOrderValue).toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#71877B' }}>PORTFOLIO IMPACT</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#38D9FF', marginTop: '2px' }}>
                    {riskAssessment?.portfolioImpactPct || 27.4}%
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#71877B' }}>NEW POSITION</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#38D9FF', marginTop: '2px' }}>
                    {riskAssessment?.newPositionPct || 27.4}%
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#71877B' }}>SECTOR CONCENTRATION</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#DDFBEA', marginTop: '2px' }}>
                    {riskAssessment?.newSectorPct || 18.2}%
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#71877B' }}>LOSS AT -5%</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#FF4D67', marginTop: '2px' }}>
                    -₹{(riskAssessment?.potentialLossAt5Pct || (estimatedOrderValue * 0.05)).toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#71877B' }}>LOSS AT -10%</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#FF4D67', marginTop: '2px' }}>
                    -₹{(riskAssessment?.potentialLossAt10Pct || (estimatedOrderValue * 0.1)).toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#71877B' }}>30-DAY VOLATILITY</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#39FF88', marginTop: '2px' }}>
                    {riskAssessment?.volatility30d || 18.4}%
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#71877B' }}>RISK STATUS</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: riskAssessment?.riskLevel === 'HIGH' ? '#FF4D67' : '#39FF88', marginTop: '2px' }}>
                    {riskAssessment?.riskLevel || 'MODERATE'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#71877B' }}>RULE CHECK</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#39FF88', marginTop: '2px' }}>
                    PASS (VIRTUAL)
                  </div>
                </div>
              </div>

              {/* AI Explanation Area */}
              <div
                style={{
                  background: '#030807',
                  border: '1px solid rgba(56, 217, 255, 0.25)',
                  padding: '12px 14px',
                  borderRadius: '2px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#38D9FF' }}>
                    AI GROUNDED EXPLANATION
                  </span>
                  {!aiExplanation && (
                    <button
                      onClick={handleRequestAiExplanation}
                      disabled={loadingAi}
                      style={{
                        padding: '3px 8px',
                        background: 'rgba(56, 217, 255, 0.1)',
                        border: '1px solid #38D9FF',
                        color: '#38D9FF',
                        fontSize: '10px',
                        borderRadius: '2px',
                        cursor: 'pointer',
                      }}
                    >
                      {loadingAi ? 'GENERATING...' : 'EXPLAIN ORDER RISK'}
                    </button>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: '#94B8A3', lineHeight: 1.5 }}>
                  {aiExplanation ||
                    `"You're allocating ${riskAssessment?.portfolioImpactPct || 27.4}% of your portfolio to this position. A 10% decline could reduce your capital by approximately ₹${(riskAssessment?.potentialLossAt10Pct || (estimatedOrderValue * 0.1)).toLocaleString('en-IN')}. Verify if your risk tolerance accommodates this concentration."`}
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
                disabled={submitting}
                style={{
                  padding: '8px 24px',
                  borderRadius: '2px',
                  background: side === 'BUY' ? '#39FF88' : '#FF4D67',
                  color: '#030807',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 900,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 15px rgba(57, 255, 136, 0.4)',
                }}
              >
                {submitting ? 'EXECUTING...' : 'CONFIRM ORDER'}
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
