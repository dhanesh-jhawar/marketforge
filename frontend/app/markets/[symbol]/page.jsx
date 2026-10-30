'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMarketData } from '../../../hooks/useMarketData.js';
import { apiClient } from '../../../lib/api/client.js';
import StockChart from '../../../components/charts/StockChart.jsx';
import { formatINR, formatPct, formatVolume } from '../../../lib/formatters/index.js';

export default function StockDetailPage() {
  const params = useParams();
  const symbol = (params?.symbol || 'RELIANCE').toUpperCase();
  const { quote } = useMarketData(symbol);

  const [security, setSecurity] = useState(null);
  const [candles, setCandles] = useState([]);
  const [activeTimeframe, setActiveTimeframe] = useState('1M');
  const [activeIndicators, setActiveIndicators] = useState({ volume: true, macd: false, rsi: false });
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [relatedStocks, setRelatedStocks] = useState([]);
  const [stockNews, setStockNews] = useState([]);

  useEffect(() => {
    apiClient(`/stocks/${symbol}`)
      .then((s) => setSecurity(s))
      .catch(() => {
        setSecurity({
          symbol,
          name: symbol === 'RELIANCE' ? 'Reliance Industries Limited' : `${symbol} India Limited`,
          exchange: 'NSE',
          series: 'EQ',
          sector: 'Energy & Petrochemicals',
          isin: 'INE002A01018',
        });
      });

    apiClient(`/stocks/${symbol}/history?interval=1d&range=1Y`)
      .then((c) => setCandles(c || []))
      .catch(() => setCandles([]));

    // Fetch news and related stocks
    apiClient(`/news?symbols=${symbol}&limit=3`)
      .then((n) => setStockNews(n || []))
      .catch(() => setStockNews([]));

    setRelatedStocks([
      { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3912.8, changePct: 0.85 },
      { symbol: 'INFY', name: 'Infosys Limited', price: 1845.2, changePct: -0.42 },
      { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', price: 1682.4, changePct: 0.65 },
      { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1598.6, changePct: 0.95 },
    ]);
  }, [symbol]);

  const handleAskAi = async () => {
    setLoadingAi(true);
    try {
      const res = await apiClient('/ai/stock-explanation', { method: 'POST', body: { symbol } });
      setAiAnalysis(res.explanation);
    } catch {
      setAiAnalysis(
        `MarketForge Intelligence: ${symbol} is a pivotal constituent of the NIFTY 50 benchmark. Key operational pillars include market-leading domestic cash flows, robust capex in consumer-tech infrastructure, and systemic correlation with global crude and currency movements. When trading ${symbol}, watch crude volatility, margin expansion in digital ecosystems, and key moving averages around 50-DMA and 200-DMA.`
      );
    } finally {
      setLoadingAi(false);
    }
  };

  const ltp = quote?.ltp || 2742.5;
  const change = quote?.change || 32.4;
  const changePct = quote?.changePct || 1.2;
  const isUp = change >= 0;

  return (
    <div style={{ background: '#030807', minHeight: 'calc(100vh - 80px)', color: '#DDFBEA', fontFamily: 'var(--font-mono)', padding: '24px' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {/* TOP HEADER: Stock Ticker, Price, Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '16px',
            background: '#07130F',
            padding: '16px 24px',
            borderRadius: '2px',
            border: '1px solid rgba(57, 255, 136, 0.2)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#39FF88', margin: 0, letterSpacing: '-0.5px' }}>
                {symbol}
              </h1>
              <span style={{ background: '#0B3D2E', padding: '2px 8px', borderRadius: '2px', fontSize: '11px', color: '#39FF88', border: '1px solid rgba(57, 255, 136, 0.3)' }}>
                {security?.exchange || 'NSE'} • {security?.series || 'EQ'}
              </span>
              <span style={{ background: 'rgba(56, 217, 255, 0.1)', padding: '2px 8px', borderRadius: '2px', fontSize: '11px', color: '#38D9FF', border: '1px solid rgba(56, 217, 255, 0.3)' }}>
                {security?.sector || 'Equities'}
              </span>
            </div>
            <div style={{ color: '#71877B', fontSize: '13px', marginTop: '4px' }}>
              {security?.name || `${symbol} Limited`}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#DDFBEA' }}>
                ₹{ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: isUp ? '#39FF88' : '#FF4D67' }}>
                {isUp ? '+' : ''}₹{change.toFixed(2)} ({isUp ? '+' : ''}{changePct.toFixed(2)}%)
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Link
                href={`/replay?symbol=${symbol}`}
                style={{
                  padding: '10px 18px',
                  borderRadius: '2px',
                  background: 'rgba(56, 217, 255, 0.12)',
                  color: '#38D9FF',
                  border: '1px solid #38D9FF',
                  fontWeight: 900,
                  fontSize: '12px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 0 12px rgba(56, 217, 255, 0.25)',
                }}
              >
                <span>▶</span>
                <span>REPLAY THIS STOCK</span>
              </Link>
              <Link
                href={`/trade?symbol=${symbol}&side=BUY`}
                style={{
                  padding: '10px 24px',
                  borderRadius: '2px',
                  background: '#39FF88',
                  color: '#030807',
                  fontWeight: 900,
                  fontSize: '13px',
                  textDecoration: 'none',
                  boxShadow: '0 0 15px rgba(57, 255, 136, 0.4)',
                }}
              >
                BUY
              </Link>
              <Link
                href={`/trade?symbol=${symbol}&side=SELL`}
                style={{
                  padding: '10px 24px',
                  borderRadius: '2px',
                  background: '#FF4D67',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '13px',
                  textDecoration: 'none',
                  boxShadow: '0 0 15px rgba(255, 77, 103, 0.4)',
                }}
              >
                SELL
              </Link>
            </div>
          </div>
        </div>

        {/* MAIN BODY: Chart & Market Statistics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', marginBottom: '24px' }}>
          {/* Main Candlestick Chart Area */}
          <div
            style={{
              background: '#050B09',
              borderRadius: '2px',
              border: '1px solid rgba(57, 255, 136, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Chart Control Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 16px',
                borderBottom: '1px solid rgba(57, 255, 136, 0.1)',
                background: '#07130F',
                fontSize: '11px',
              }}
            >
              <div style={{ display: 'flex', gap: '6px' }}>
                {['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setActiveTimeframe(tf)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '2px',
                      background: activeTimeframe === tf ? '#0B3D2E' : 'transparent',
                      border: activeTimeframe === tf ? '1px solid #39FF88' : '1px solid rgba(57, 255, 136, 0.1)',
                      color: activeTimeframe === tf ? '#39FF88' : '#71877B',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              {/* Indicator Toggles */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: '#71877B' }}>INDICATORS:</span>
                {['volume', 'macd', 'rsi'].map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setActiveIndicators((prev) => ({ ...prev, [ind]: !prev[ind] }))}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '2px',
                      background: activeIndicators[ind] ? 'rgba(56, 217, 255, 0.15)' : 'transparent',
                      border: activeIndicators[ind] ? '1px solid #38D9FF' : '1px solid rgba(57, 255, 136, 0.1)',
                      color: activeIndicators[ind] ? '#38D9FF' : '#71877B',
                      cursor: 'pointer',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                    }}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            {/* Highcharts Stock Chart */}
            <div style={{ padding: '8px', height: '480px' }}>
              <StockChart symbol={symbol} candles={candles} height={460} indicators={activeIndicators.volume} />
            </div>
          </div>

          {/* Right Column: Market Statistics */}
          <div
            style={{
              background: '#07130F',
              borderRadius: '2px',
              border: '1px solid rgba(57, 255, 136, 0.15)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#39FF88', borderBottom: '1px solid rgba(57, 255, 136, 0.15)', paddingBottom: '8px' }}>
              MARKET STATISTICS
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '11px' }}>
              <div>
                <div style={{ color: '#71877B' }}>OPEN</div>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#DDFBEA', marginTop: '2px' }}>
                  ₹{(quote?.open || (ltp * 0.995)).toFixed(2)}
                </div>
              </div>

              <div>
                <div style={{ color: '#71877B' }}>PREV. CLOSE</div>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#DDFBEA', marginTop: '2px' }}>
                  ₹{(quote?.prevClose || (ltp - change)).toFixed(2)}
                </div>
              </div>

              <div>
                <div style={{ color: '#71877B' }}>DAY HIGH</div>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#39FF88', marginTop: '2px' }}>
                  ₹{(quote?.high || (ltp * 1.018)).toFixed(2)}
                </div>
              </div>

              <div>
                <div style={{ color: '#71877B' }}>DAY LOW</div>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#FF4D67', marginTop: '2px' }}>
                  ₹{(quote?.low || (ltp * 0.988)).toFixed(2)}
                </div>
              </div>

              <div>
                <div style={{ color: '#71877B' }}>VOLUME</div>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#DDFBEA', marginTop: '2px' }}>
                  {formatVolume(quote?.volume || 14850000)}
                </div>
              </div>

              <div>
                <div style={{ color: '#71877B' }}>MARKET CAP</div>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#38D9FF', marginTop: '2px' }}>
                  ₹18.52 Lakh Cr
                </div>
              </div>

              <div>
                <div style={{ color: '#71877B' }}>52W HIGH</div>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#39FF88', marginTop: '2px' }}>
                  ₹{(ltp * 1.15).toFixed(2)}
                </div>
              </div>

              <div>
                <div style={{ color: '#71877B' }}>52W LOW</div>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#FF4D67', marginTop: '2px' }}>
                  ₹{(ltp * 0.78).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Quick Virtual Order Shortcut */}
            <div
              style={{
                marginTop: 'auto',
                background: '#050B09',
                border: '1px solid rgba(57, 255, 136, 0.2)',
                padding: '12px',
                borderRadius: '2px',
                fontSize: '11px',
              }}
            >
              <div style={{ color: '#71877B', marginBottom: '6px' }}>VIRTUAL ALLOCATION ESTIMATE</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#DDFBEA', fontWeight: 700 }}>
                <span>10 Shares:</span>
                <span style={{ color: '#39FF88' }}>₹{(ltp * 10).toFixed(2)}</span>
              </div>
              <div style={{ fontSize: '10px', color: '#71877B', marginTop: '4px' }}>
                ~{((ltp * 10 / 100000) * 100).toFixed(1)}% of your ₹1,00,000 balance
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTIONS: AI Explanation, Company Profile, Related Stocks, News */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
          {/* AI Pedagogical Insight & Company Profile */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* AI Explanation Box */}
            <div
              style={{
                background: '#07130F',
                border: '1px solid #38D9FF',
                padding: '20px',
                borderRadius: '2px',
                boxShadow: '0 0 20px rgba(56, 217, 255, 0.1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38D9FF', boxShadow: '0 0 8px #38D9FF' }} />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#38D9FF' }}>
                    AI PEDAGOGICAL ANALYSIS
                  </span>
                </div>
                <button
                  onClick={handleAskAi}
                  disabled={loadingAi}
                  style={{
                    padding: '4px 12px',
                    background: 'rgba(56, 217, 255, 0.12)',
                    border: '1px solid #38D9FF',
                    color: '#38D9FF',
                    fontSize: '11px',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {loadingAi ? 'ANALYZING...' : 'REFRESH AI INSIGHT'}
                </button>
              </div>

              <div style={{ fontSize: '12px', color: '#94B8A3', lineHeight: 1.6 }}>
                {aiAnalysis ||
                  `MarketForge Intelligence: ${symbol} is a primary component of Indian domestic index benchmarks. Its trading volume typically reflects macroeconomic sentiment and institutional flows. Use technical stops and position-size constraints to manage downside volatility.`}
              </div>
            </div>

            {/* Company Information */}
            <div
              style={{
                background: '#07130F',
                border: '1px solid rgba(57, 255, 136, 0.15)',
                padding: '20px',
                borderRadius: '2px',
                fontSize: '12px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#39FF88', marginBottom: '12px' }}>
                COMPANY OVERVIEW
              </div>
              <p style={{ color: '#94B8A3', lineHeight: 1.6, margin: 0 }}>
                {security?.name || symbol} is one of India&apos;s leading publicly listed corporate entities on the National Stock Exchange of India (NSE). It operates across critical economic value chains, maintaining significant weights within NIFTY 50 and sectoral indices.
              </p>
              <div style={{ display: 'flex', gap: '16px', marginTop: '14px', color: '#71877B', fontSize: '11px' }}>
                <span>ISIN: <b style={{ color: '#DDFBEA' }}>{security?.isin || 'INE002A01018'}</b></span>
                <span>SERIES: <b style={{ color: '#DDFBEA' }}>{security?.series || 'EQ'}</b></span>
                <span>STATUS: <b style={{ color: '#39FF88' }}>ACTIVE TRADING</b></span>
              </div>
            </div>
          </div>

          {/* Related Stocks & Market News */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Related Stocks */}
            <div
              style={{
                background: '#07130F',
                border: '1px solid rgba(57, 255, 136, 0.15)',
                padding: '20px',
                borderRadius: '2px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#39FF88', marginBottom: '12px' }}>
                RELATED SECURITIES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {relatedStocks.map((rs) => (
                  <Link
                    key={rs.symbol}
                    href={`/markets/${rs.symbol}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: '#050B09',
                      border: '1px solid rgba(57, 255, 136, 0.08)',
                      borderRadius: '2px',
                      textDecoration: 'none',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '12px', color: '#38D9FF' }}>{rs.symbol}</div>
                      <div style={{ fontSize: '10px', color: '#71877B' }}>{rs.name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#DDFBEA' }}>₹{rs.price.toFixed(2)}</div>
                      <div style={{ fontSize: '10px', color: rs.changePct >= 0 ? '#39FF88' : '#FF4D67', fontWeight: 700 }}>
                        {rs.changePct >= 0 ? '+' : ''}{rs.changePct}%
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* News */}
            <div
              style={{
                background: '#07130F',
                border: '1px solid rgba(57, 255, 136, 0.15)',
                padding: '20px',
                borderRadius: '2px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#39FF88', marginBottom: '12px' }}>
                LATEST MARKET DISCLOSURES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px' }}>
                <div style={{ borderBottom: '1px solid rgba(57, 255, 136, 0.08)', paddingBottom: '8px' }}>
                  <div style={{ color: '#71877B', fontSize: '10px' }}>EXCHANGE WIRE • 2H AGO</div>
                  <div style={{ color: '#DDFBEA', fontWeight: 700, marginTop: '2px' }}>
                    Institutional volume surges in {symbol} following quarterly financial briefing.
                  </div>
                </div>
                <div>
                  <div style={{ color: '#71877B', fontSize: '10px' }}>SECTOR ANALYSIS • 5H AGO</div>
                  <div style={{ color: '#DDFBEA', fontWeight: 700, marginTop: '2px' }}>
                    Foreign portfolio investors increase net long positions across benchmark heavyweights.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
