'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { replayApi } from '../../lib/api/replayApi.js';
import { formatCurrency, formatPct } from '../../lib/formatters/index.js';

const POPULAR_SYMBOLS = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'TATAMOTORS', 'SBIN', 'SUNPHARMA', 'TATASTEEL'];
const SPEEDS = [0.25, 0.5, 1, 2, 5, 10, 25, 50];

function ReplayEngineContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSymbol = searchParams.get('symbol') || 'RELIANCE';

  const [symbol, setSymbol] = useState(initialSymbol.toUpperCase());
  const [searchInput, setSearchInput] = useState('');
  const [meta, setMeta] = useState(null);
  const [candles, setCandles] = useState([]);
  const [events, setEvents] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  // Replay playback state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState('INSIGHTS'); // 'INSIGHTS' | 'WHY_DID_IT_MOVE'
  const [selectedEvent, setSelectedEvent] = useState(null);

  // AI explanation state
  const [aiExplanation, setAiExplanation] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Canvas ref for chart
  const canvasRef = useRef(null);
  const playTimerRef = useRef(null);

  // Load symbol data and historical candles
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setIsPlaying(false);

    Promise.all([
      replayApi.getStockMeta(symbol).catch(() => null),
      replayApi.getHistory(symbol).catch(() => []),
      replayApi.getEvents(symbol).catch(() => []),
      replayApi.analyze({ symbol }).catch(() => null),
    ]).then(([stockMeta, historyData, eventList, analysisData]) => {
      if (isCancelled) return;
      setMeta(stockMeta);
      setCandles(historyData);
      setEvents(eventList);
      setAnalysis(analysisData);
      setCurrentIndex(historyData.length > 0 ? Math.min(10, historyData.length - 1) : 0);
      setLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [symbol]);

  // Handle Play/Pause timer
  useEffect(() => {
    if (!isPlaying) {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      return;
    }

    const intervalMs = Math.max(20, Math.floor(600 / speed));
    playTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= candles.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, speed, candles.length]);

  // Current replayed slice of candles
  const visibleCandles = useMemo(() => {
    return candles.slice(0, currentIndex + 1);
  }, [candles, currentIndex]);

  const currentCandle = visibleCandles[visibleCandles.length - 1] || null;
  const prevCandle = visibleCandles.length > 1 ? visibleCandles[visibleCandles.length - 2] : currentCandle;
  const currentPrice = currentCandle ? currentCandle.close : 0;
  const dayChange = currentCandle && prevCandle ? currentCandle.close - prevCandle.close : 0;
  const dayChangePct = prevCandle && prevCandle.close ? (dayChange / prevCandle.close) * 100 : 0;

  // Render glowing Canvas chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || visibleCandles.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear background
    ctx.fillStyle = '#050B09';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(57, 255, 136, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 30; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Min & Max calculations
    const prices = visibleCandles.flatMap((c) => [c.low, c.high]);
    let minPrice = Math.min(...prices) * 0.995;
    let maxPrice = Math.max(...prices) * 1.005;
    if (minPrice === maxPrice) {
      minPrice -= 10;
      maxPrice += 10;
    }

    const priceRange = maxPrice - minPrice;
    const chartHeight = height * 0.75;
    const volumeHeight = height * 0.2;
    const volumeTop = chartHeight + 10;

    const maxVolume = Math.max(...visibleCandles.map((c) => c.volume || 10000), 100000);

    const candleWidth = Math.max(3, Math.min(18, (width - 40) / Math.max(visibleCandles.length, 20)));
    const spacing = candleWidth * 1.4;

    // Draw horizontal price gridlines with labels on the right
    const numPriceSteps = 5;
    for (let i = 0; i <= numPriceSteps; i++) {
      const p = minPrice + (priceRange * (i / numPriceSteps));
      const y = chartHeight - ((p - minPrice) / priceRange) * chartHeight;
      ctx.strokeStyle = 'rgba(57, 255, 136, 0.08)';
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(width - 65, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#71877B';
      ctx.font = '10px monospace';
      ctx.fillText(`₹${p.toFixed(1)}`, width - 60, y + 3);
    }

    // Volume pane separator
    ctx.strokeStyle = 'rgba(57, 255, 136, 0.15)';
    ctx.beginPath();
    ctx.moveTo(30, chartHeight);
    ctx.lineTo(width - 65, chartHeight);
    ctx.stroke();

    ctx.fillStyle = '#71877B';
    ctx.font = '9px monospace';
    ctx.fillText('VOL (SHARES)', 34, chartHeight - 6);

    // Draw candles and volume bars
    const closePoints = [];

    visibleCandles.forEach((c, idx) => {
      const x = 40 + idx * spacing;
      if (x > width - 75) return;

      const isBullish = c.close >= c.open;
      const candleColor = isBullish ? '#39FF88' : '#FF4D67';

      const openY = chartHeight - ((c.open - minPrice) / priceRange) * chartHeight;
      const closeY = chartHeight - ((c.close - minPrice) / priceRange) * chartHeight;
      const highY = chartHeight - ((c.high - minPrice) / priceRange) * chartHeight;
      const lowY = chartHeight - ((c.low - minPrice) / priceRange) * chartHeight;

      closePoints.push({ x, y: closeY });

      // Wick (high to low)
      ctx.strokeStyle = candleColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body (open to close)
      ctx.fillStyle = candleColor;
      const bodyY = Math.min(openY, closeY);
      const bodyH = Math.max(3, Math.abs(openY - closeY));
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyH);

      // Volume bar
      const volBarH = (c.volume / maxVolume) * (volumeHeight - 15);
      ctx.fillStyle = isBullish ? 'rgba(57, 255, 136, 0.45)' : 'rgba(255, 77, 103, 0.45)';
      ctx.fillRect(x - candleWidth / 2, height - volBarH - 20, candleWidth, volBarH);

      // Date labels every few candles
      const step = Math.max(1, Math.floor(visibleCandles.length / 7));
      if (idx % step === 0 || idx === visibleCandles.length - 1) {
        ctx.fillStyle = idx === visibleCandles.length - 1 ? '#39FF88' : '#71877B';
        ctx.font = '9px monospace';
        const label = c.dateStr ? c.dateStr.slice(5) : '';
        ctx.fillText(label, x - 12, height - 6);
      }

      // Check if an event matches this candle
      const eventMatch = events.find((e) => e.dateStr === c.dateStr);
      if (eventMatch) {
        // Event pin marker
        ctx.fillStyle = '#38D9FF';
        ctx.beginPath();
        ctx.arc(x, highY - 12, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#050B09';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#38D9FF';
        ctx.font = '9px monospace';
        ctx.fillText('▲', x - 4, highY - 16);
      }
    });

    // Trendline connecting close prices
    if (closePoints.length > 1) {
      ctx.strokeStyle = 'rgba(56, 217, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      closePoints.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Current price horizontal glow line
    if (currentCandle) {
      const currentY = chartHeight - ((currentCandle.close - minPrice) / priceRange) * chartHeight;
      ctx.strokeStyle = 'rgba(57, 255, 136, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(30, currentY);
      ctx.lineTo(width - 65, currentY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current Price Badge on the right
      ctx.fillStyle = '#39FF88';
      ctx.fillRect(width - 64, currentY - 10, 60, 20);
      ctx.fillStyle = '#030807';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`₹${currentCandle.close.toFixed(1)}`, width - 58, currentY + 4);
    }  }, [visibleCandles, currentCandle, events]);

  // Request AI Explanation
  const handleGenerateAiExplanation = async () => {
    setLoadingAi(true);
    try {
      const res = await replayApi.getAiExplanation({
        symbol,
        analysis,
        events,
      });
      setAiExplanation(res.explanation);
    } catch {
      setAiExplanation(
        `MarketForge Replay Mentor: Over this replayed timeframe, ${symbol} moved from ₹${analysis?.startingPrice} to ₹${analysis?.endingPrice} (${analysis?.percentageChange >= 0 ? '+' : ''}${analysis?.percentageChange}%). Key observations include an annualized volatility of ${analysis?.volatility}% and maximum peak-to-trough drawdown of ${analysis?.maxDrawdown}%. Notice how periods of successive accumulation sustained upside momentum, while volume contractions flagged consolidation.`
      );
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div style={{ background: '#030807', minHeight: 'calc(100vh - 80px)', color: '#DDFBEA', fontFamily: 'var(--font-mono)', padding: '20px' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* 1. HEADER: BRAND WORDMARK, CONTROLS & SYMBOL SELECTOR */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#07130F',
            padding: '16px 20px',
            border: '1px solid rgba(57, 255, 136, 0.25)',
            borderRadius: '2px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#39FF88', boxShadow: '0 0 10px #39FF88' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#39FF88', margin: 0, letterSpacing: '0.5px' }}>
                  MARKETFORGE REPLAY ENGINE
                </h1>
                <span style={{ fontSize: '10px', background: 'rgba(56, 217, 255, 0.15)', color: '#38D9FF', padding: '2px 6px', borderRadius: '2px', border: '1px solid rgba(56, 217, 255, 0.3)' }}>
                  HISTORICAL SIMULATOR
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#71877B', marginTop: '2px' }}>
                Study how stock prices, volume, and news events evolved through time with millisecond precision.
              </div>
            </div>
          </div>

          {/* Quick Symbol Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#71877B' }}>SYMBOLS:</span>
            {POPULAR_SYMBOLS.map((sym) => (
              <button
                key={sym}
                onClick={() => {
                  setSymbol(sym);
                  router.push(`/replay?symbol=${sym}`);
                }}
                style={{
                  background: symbol === sym ? '#0B3D2E' : '#050B09',
                  border: symbol === sym ? '1px solid #39FF88' : '1px solid rgba(57, 255, 136, 0.2)',
                  color: symbol === sym ? '#39FF88' : '#94B8A3',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 800,
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {sym}
              </button>
            ))}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchInput.trim()) {
                  setSymbol(searchInput.trim().toUpperCase());
                  setSearchInput('');
                }
              }}
              style={{ display: 'flex', gap: '4px' }}
            >
              <input
                type="text"
                placeholder="ANY SYMBOL..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{
                  background: '#030807',
                  border: '1px solid rgba(57, 255, 136, 0.3)',
                  color: '#DDFBEA',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  borderRadius: '2px',
                  width: '110px',
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#39FF88',
                  color: '#030807',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                }}
              >
                LOAD
              </button>
            </form>
          </div>
        </div>

        {/* 2. REPLAY TELEMETRY BAR: SELECTED COMPANY, LIVE REPLAYED PRICE & TIME */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            background: '#07130F',
            padding: '14px 20px',
            borderRadius: '2px',
            border: '1px solid rgba(57, 255, 136, 0.15)',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#71877B' }}>SELECTED COMPANY</div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#38D9FF' }}>
              {meta?.name || symbol} ({symbol})
            </div>
            <div style={{ fontSize: '10px', color: '#94B8A3' }}>{meta?.sector || 'NSE Equities'}</div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#71877B' }}>REPLAYED PRICE (OHLC)</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: dayChange >= 0 ? '#39FF88' : '#FF4D67' }}>
              ₹{currentPrice ? currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '---'}
            </div>
            <div style={{ fontSize: '11px', color: dayChange >= 0 ? '#39FF88' : '#FF4D67', fontWeight: 700 }}>
              {dayChange >= 0 ? '+' : ''}₹{dayChange.toFixed(2)} ({dayChange >= 0 ? '+' : ''}{dayChangePct.toFixed(2)}%)
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#71877B' }}>REPLAY DATE & TIMESTAMP</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#DDFBEA' }}>
              {currentCandle ? currentCandle.dateStr : '---'}
            </div>
            <div style={{ fontSize: '10px', color: '#71877B' }}>
              CANDLE {currentIndex + 1} OF {candles.length} ({(currentIndex / Math.max(1, candles.length - 1) * 100).toFixed(0)}% COMPLETE)
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#71877B' }}>SESSION VOLUME</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#DDFBEA' }}>
              {currentCandle ? (currentCandle.volume / 1e5).toFixed(2) + ' LAKH SHARES' : '---'}
            </div>
            <div style={{ fontSize: '10px', color: '#38D9FF' }}>
              RANGE: ₹{currentCandle ? currentCandle.low.toFixed(1) : 0} - ₹{currentCandle ? currentCandle.high.toFixed(1) : 0}
            </div>
          </div>
        </div>

        {/* 3. MAIN BODY: CANDLESTICK CHART (LEFT 70%) & INSIGHTS / WHY DID IT MOVE (RIGHT 30%) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.3fr) minmax(340px, 1fr)', gap: '16px' }}>

          {/* LEFT: CANDLESTICK CANVAS & REPLAY CONTROL BAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                background: '#050B09',
                border: '1px solid rgba(57, 255, 136, 0.2)',
                borderRadius: '2px',
                height: '520px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {loading ? (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#39FF88', fontSize: '13px' }}>
                  Loading Historical Telemetry for {symbol}...
                </div>
              ) : (
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
              )}

              {/* Watermark */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '20px',
                  pointerEvents: 'none',
                  fontSize: '12px',
                  color: 'rgba(57, 255, 136, 0.4)',
                  fontWeight: 900,
                  letterSpacing: '1px',
                }}
              >
                ● MARKETFORGE // REPLAY SIMULATION CANVAS
              </div>
            </div>

            {/* REPLAY CONTROL BAR (Section 16 & 18) */}
            <div
              style={{
                background: '#07130F',
                border: '1px solid rgba(57, 255, 136, 0.25)',
                padding: '12px 18px',
                borderRadius: '2px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {/* Draggable Timeline Scrub Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '10px', color: '#71877B' }}>START</span>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, candles.length - 1)}
                  value={currentIndex}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCurrentIndex(Number(e.target.value));
                  }}
                  style={{
                    flex: 1,
                    accentColor: '#39FF88',
                    cursor: 'pointer',
                    height: '6px',
                    background: '#0B3D2E',
                    borderRadius: '2px',
                  }}
                />
                <span style={{ fontSize: '10px', color: '#39FF88', fontWeight: 800 }}>
                  {currentCandle ? currentCandle.dateStr : 'NOW'}
                </span>
              </div>

              {/* Playback Controls & Speed Selector */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentIndex((prev) => Math.max(0, prev - 1));
                    }}
                    title="Step Backward (1 Session)"
                    style={{
                      background: '#050B09',
                      border: '1px solid rgba(57, 255, 136, 0.3)',
                      color: '#39FF88',
                      padding: '6px 14px',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    ◀ STEP
                  </button>

                  <button
                    onClick={() => {
                      if (currentIndex >= candles.length - 1) {
                        setCurrentIndex(0);
                      }
                      setIsPlaying(!isPlaying);
                    }}
                    style={{
                      background: isPlaying ? '#FF4D67' : '#39FF88',
                      color: isPlaying ? '#FFFFFF' : '#030807',
                      border: 'none',
                      fontWeight: 900,
                      fontSize: '12px',
                      padding: '8px 20px',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      boxShadow: isPlaying ? '0 0 15px rgba(255, 77, 103, 0.4)' : '0 0 15px rgba(57, 255, 136, 0.4)',
                    }}
                  >
                    {isPlaying ? '❚❚ PAUSE' : '▶ PLAY REPLAY'}
                  </button>

                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentIndex((prev) => Math.min(candles.length - 1, prev + 1));
                    }}
                    title="Step Forward (1 Session)"
                    style={{
                      background: '#050B09',
                      border: '1px solid rgba(57, 255, 136, 0.3)',
                      color: '#39FF88',
                      padding: '6px 14px',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    STEP ▶
                  </button>

                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentIndex(0);
                    }}
                    style={{
                      background: 'transparent',
                      border: '1px solid #71877B',
                      color: '#71877B',
                      padding: '6px 12px',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontSize: '11px',
                    }}
                  >
                    RESET
                  </button>
                </div>

                {/* Speed Controls (Section 18) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', color: '#71877B', marginRight: '4px' }}>SPEED:</span>
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      style={{
                        background: speed === s ? '#39FF88' : '#050B09',
                        color: speed === s ? '#030807' : '#94B8A3',
                        border: speed === s ? '1px solid #39FF88' : '1px solid rgba(57, 255, 136, 0.15)',
                        padding: '4px 8px',
                        fontSize: '10px',
                        fontWeight: 800,
                        borderRadius: '2px',
                        cursor: 'pointer',
                      }}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: REPLAY INSIGHTS & "WHY DID IT MOVE?" (Section 19, 20, 22) */}
          <div
            style={{
              background: '#07130F',
              border: '1px solid rgba(57, 255, 136, 0.25)',
              borderRadius: '2px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              maxHeight: '620px',
            }}
          >
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(57, 255, 136, 0.2)' }}>
              <button
                onClick={() => setActiveTab('INSIGHTS')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: activeTab === 'INSIGHTS' ? '#0B3D2E' : '#07130F',
                  color: activeTab === 'INSIGHTS' ? '#39FF88' : '#71877B',
                  fontWeight: 800,
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'INSIGHTS' ? '2px solid #39FF88' : 'none',
                }}
              >
                REPLAY INSIGHTS
              </button>
              <button
                onClick={() => setActiveTab('WHY_DID_IT_MOVE')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: activeTab === 'WHY_DID_IT_MOVE' ? '#0B3D2E' : '#07130F',
                  color: activeTab === 'WHY_DID_IT_MOVE' ? '#38D9FF' : '#71877B',
                  fontWeight: 800,
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'WHY_DID_IT_MOVE' ? '2px solid #38D9FF' : 'none',
                }}
              >
                WHY DID IT MOVE?
              </button>
            </div>

            {/* TAB 1: REPLAY INSIGHTS (Section 19) */}
            {activeTab === 'INSIGHTS' && (
              <div style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#71877B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  DETERMINISTIC HISTORICAL METRICS
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <div style={{ background: '#050B09', padding: '10px', borderRadius: '2px', border: '1px solid rgba(57, 255, 136, 0.1)' }}>
                    <div style={{ fontSize: '10px', color: '#71877B' }}>PERIOD RETURN</div>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: (analysis?.percentageChange || 0) >= 0 ? '#39FF88' : '#FF4D67' }}>
                      {(analysis?.percentageChange || 0) >= 0 ? '+' : ''}{analysis?.percentageChange || 0}%
                    </div>
                  </div>

                  <div style={{ background: '#050B09', padding: '10px', borderRadius: '2px', border: '1px solid rgba(57, 255, 136, 0.1)' }}>
                    <div style={{ fontSize: '10px', color: '#71877B' }}>MAX DRAWDOWN</div>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#FF4D67' }}>
                      {analysis?.maxDrawdown || 0}%
                    </div>
                  </div>

                  <div style={{ background: '#050B09', padding: '10px', borderRadius: '2px', border: '1px solid rgba(57, 255, 136, 0.1)' }}>
                    <div style={{ fontSize: '10px', color: '#71877B' }}>ANNUALIZED VOLATILITY</div>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#38D9FF' }}>
                      {analysis?.volatility || 0}%
                    </div>
                  </div>

                  <div style={{ background: '#050B09', padding: '10px', borderRadius: '2px', border: '1px solid rgba(57, 255, 136, 0.1)' }}>
                    <div style={{ fontSize: '10px', color: '#71877B' }}>AVG DAILY VOLUME</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#DDFBEA' }}>
                      {analysis ? (analysis.averageVolume / 1e5).toFixed(1) + ' Lakh' : '---'}
                    </div>
                  </div>

                  <div style={{ background: '#050B09', padding: '10px', borderRadius: '2px', border: '1px solid rgba(57, 255, 136, 0.1)' }}>
                    <div style={{ fontSize: '10px', color: '#71877B' }}>BEST TRADING DAY</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#39FF88' }}>
                      +{analysis?.bestDay?.returnPercent || 0}%
                    </div>
                    <div style={{ fontSize: '9px', color: '#71877B' }}>{analysis?.bestDay?.date || '---'}</div>
                  </div>

                  <div style={{ background: '#050B09', padding: '10px', borderRadius: '2px', border: '1px solid rgba(57, 255, 136, 0.1)' }}>
                    <div style={{ fontSize: '10px', color: '#71877B' }}>WORST TRADING DAY</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#FF4D67' }}>
                      {analysis?.worstDay?.returnPercent || 0}%
                    </div>
                    <div style={{ fontSize: '9px', color: '#71877B' }}>{analysis?.worstDay?.date || '---'}</div>
                  </div>
                </div>

                {/* Consecutive Streaks */}
                <div style={{ background: '#050B09', padding: '10px', borderRadius: '2px', border: '1px solid rgba(57, 255, 136, 0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: '#71877B' }}>SESSIONS:</span>
                    <span style={{ color: '#39FF88' }}>{analysis?.positiveSessions || 0} GREEN</span>
                    <span style={{ color: '#71877B' }}>/</span>
                    <span style={{ color: '#FF4D67' }}>{analysis?.negativeSessions || 0} RED</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span style={{ color: '#71877B' }}>MAX STREAKS:</span>
                    <span style={{ color: '#39FF88' }}>+{analysis?.maxConsecutiveGains || 0} SESSIONS</span>
                    <span style={{ color: '#FF4D67' }}>-{analysis?.maxConsecutiveLosses || 0} SESSIONS</span>
                  </div>
                </div>

                {/* TRY THIS SCENARIO CTA (Section 45) */}
                <Link
                  href={`/what-if?symbol=${symbol}&date=${currentCandle?.dateStr || ''}&price=${currentPrice}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #0B3D2E 0%, #16C784 100%)',
                    color: '#030807',
                    fontWeight: 900,
                    fontSize: '12px',
                    borderRadius: '2px',
                    textDecoration: 'none',
                    letterSpacing: '0.5px',
                    boxShadow: '0 0 15px rgba(57, 255, 136, 0.3)',
                    marginTop: 'auto',
                  }}
                >
                  <span>⚡</span>
                  <span>TRY THIS SCENARIO IN WHAT-IF LAB</span>
                </Link>
              </div>
            )}

            {/* TAB 2: WHY DID IT MOVE? (Section 20 & 22) */}
            {activeTab === 'WHY_DID_IT_MOVE' && (
              <div style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#71877B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  FACTUAL ATTRIBUTION & EVENT EVIDENCE
                </div>

                {/* Bullish Drivers */}
                {analysis?.bullishDrivers?.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#39FF88' }}>▲ BULLISH DRIVERS</div>
                    {analysis.bullishDrivers.map((d, i) => (
                      <div key={i} style={{ background: '#050B09', padding: '10px', borderRadius: '2px', borderLeft: '3px solid #39FF88' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#DDFBEA' }}>{d.driver}</span>
                          <span style={{ fontSize: '9px', background: 'rgba(57, 255, 136, 0.1)', color: '#39FF88', padding: '2px 6px', borderRadius: '2px' }}>
                            {d.strength}
                          </span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#94B8A3', lineHeight: 1.4 }}>{d.evidence}</div>
                        <div style={{ fontSize: '9px', color: '#71877B', marginTop: '4px' }}>SOURCE: {d.source}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bearish Drivers */}
                {analysis?.bearishDrivers?.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#FF4D67' }}>▼ BEARISH DRIVERS</div>
                    {analysis.bearishDrivers.map((d, i) => (
                      <div key={i} style={{ background: '#050B09', padding: '10px', borderRadius: '2px', borderLeft: '3px solid #FF4D67' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#DDFBEA' }}>{d.driver}</span>
                          <span style={{ fontSize: '9px', background: 'rgba(255, 77, 103, 0.1)', color: '#FF4D67', padding: '2px 6px', borderRadius: '2px' }}>
                            {d.strength}
                          </span>
                        </div>
                        <div style={{ fontSize: '10px', color: '#94B8A3', lineHeight: 1.4 }}>{d.evidence}</div>
                        <div style={{ fontSize: '9px', color: '#71877B', marginTop: '4px' }}>SOURCE: {d.source}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Explanation Accordion / Generator */}
                <div style={{ marginTop: '8px', borderTop: '1px solid rgba(57, 255, 136, 0.15)', paddingTop: '12px' }}>
                  <button
                    onClick={handleGenerateAiExplanation}
                    disabled={loadingAi}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(56, 217, 255, 0.12)',
                      border: '1px solid #38D9FF',
                      color: '#38D9FF',
                      fontWeight: 800,
                      fontSize: '11px',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      marginBottom: '8px',
                    }}
                  >
                    {loadingAi ? 'Synthesizing Pedagogical Analysis...' : '🤖 ASK AI MENTOR: WHY DID IT MOVE?'}
                  </button>

                  {aiExplanation && (
                    <div
                      style={{
                        background: '#050B09',
                        border: '1px solid rgba(56, 217, 255, 0.3)',
                        padding: '12px',
                        borderRadius: '2px',
                        fontSize: '11px',
                        lineHeight: 1.6,
                        color: '#DDFBEA',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {aiExplanation}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. HISTORICAL NEWS & EVENT TIMELINE (Section 21) */}
        <div
          style={{
            background: '#07130F',
            border: '1px solid rgba(57, 255, 136, 0.2)',
            padding: '16px 20px',
            borderRadius: '2px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#38D9FF', letterSpacing: '0.5px' }}>
              HISTORICAL NEWS TIMELINE & CATALYSTS ({events.length} EVENTS)
            </div>
            <span style={{ fontSize: '10px', color: '#71877B' }}>
              Click any event marker to inspect pre/post price reaction
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            {events.slice(0, 4).map((ev) => (
              <div
                key={ev.id}
                onClick={() => setSelectedEvent(ev)}
                style={{
                  background: '#050B09',
                  border: '1px solid rgba(57, 255, 136, 0.15)',
                  padding: '12px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '9px', color: '#38D9FF', fontWeight: 800 }}>{ev.eventType}</span>
                  <span style={{ fontSize: '10px', color: '#71877B' }}>{ev.dateStr}</span>
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#DDFBEA', marginBottom: '4px' }}>
                  {ev.title}
                </div>
                <div style={{ fontSize: '10px', color: '#94B8A3', lineHeight: 1.4 }}>
                  {ev.description}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(57, 255, 136, 0.1)', fontSize: '10px' }}>
                  <span style={{ color: '#71877B' }}>REACTION:</span>
                  <span style={{ color: ev.priceChangePercent >= 0 ? '#39FF88' : '#FF4D67', fontWeight: 800 }}>
                    {ev.priceChangePercent >= 0 ? '+' : ''}{ev.priceChangePercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function ReplayEnginePage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: '#39FF88', fontFamily: 'monospace' }}>Initializing MarketForge Replay Engine...</div>}>
      <ReplayEngineContent />
    </Suspense>
  );
}

