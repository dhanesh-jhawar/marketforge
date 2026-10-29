'use client';

import { useEffect, useRef, useMemo } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import '../../styles/charts.css';

/**
 * Highcharts Stock Candlestick + Volume Chart
 * Built to the MarketForge exchange terminal visual standard:
 * - Crisp candlestick bodies and wicks with neon-green / crimson distinction
 * - Synchronized volume pane
 * - Interactive crosshair and OHLC tooltip
 * - Glowing latest-price indicator
 */
export default function StockChart({
  symbol = 'RELIANCE',
  candles = [],
  height = 520,
  indicators = true,
  className = '',
}) {
  const chartComponentRef = useRef(null);

  // Highcharts OHLC data format: [timestamp, open, high, low, close]
  // Volume format: [timestamp, volume]
  const { ohlcData, volumeData, latestPrice, priceChange, changePct } = useMemo(() => {
    let raw = candles;
    // Generate realistic fallback candles if empty
    if (!raw || raw.length === 0) {
      let base = 2500;
      const now = Date.now();
      const count = 120;
      raw = [];
      for (let i = count; i >= 0; i--) {
        const time = now - i * 3600000;
        const delta = (Math.random() - 0.48) * 25;
        const open = base;
        const close = open + delta;
        const high = Math.max(open, close) + Math.random() * 12;
        const low = Math.min(open, close) - Math.random() * 12;
        const volume = Math.floor(25000 + Math.random() * 85000);
        base = close;
        raw.push({ time, open, high, low, close, volume });
      }
    }

    const ohlc = [];
    const vol = [];
    for (const c of raw) {
      const t = typeof c.time === 'string' ? new Date(c.time).getTime() : c.time;
      ohlc.push([t, c.open, c.high, c.low, c.close]);
      const isUp = c.close >= c.open;
      vol.push({
        x: t,
        y: c.volume,
        color: isUp ? 'rgba(57, 255, 136, 0.35)' : 'rgba(255, 77, 103, 0.35)',
      });
    }

    const first = raw[0];
    const last = raw[raw.length - 1];
    const lp = last ? last.close : 0;
    const diff = last && first ? last.close - first.open : 0;
    const pct = first && first.open ? (diff / first.open) * 100 : 0;

    return {
      ohlcData: ohlc,
      volumeData: vol,
      latestPrice: lp,
      priceChange: diff,
      changePct: pct,
    };
  }, [candles]);

  const options = useMemo(() => {
    return {
      chart: {
        backgroundColor: '#050B09',
        height,
        spacing: [15, 15, 15, 15],
        style: {
          fontFamily: 'var(--font-sans)',
        },
      },
      credits: { enabled: false },
      rangeSelector: {
        selected: 2,
        inputEnabled: false,
        buttonTheme: {
          fill: '#07130F',
          stroke: 'rgba(57, 255, 136, 0.15)',
          'stroke-width': 1,
          r: 2,
          padding: 6,
          style: {
            color: '#71877B',
            fontWeight: '600',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
          },
          states: {
            hover: {
              fill: 'rgba(11, 61, 46, 0.6)',
              style: { color: '#39FF88' },
            },
            select: {
              fill: '#0B3D2E',
              stroke: '#39FF88',
              'stroke-width': 1,
              style: {
                color: '#39FF88',
                fontWeight: 'bold',
              },
            },
          },
        },
        buttons: [
          { type: 'day', count: 1, text: '1D' },
          { type: 'week', count: 1, text: '1W' },
          { type: 'month', count: 1, text: '1M' },
          { type: 'month', count: 3, text: '3M' },
          { type: 'month', count: 6, text: '6M' },
          { type: 'year', count: 1, text: '1Y' },
          { type: 'all', text: '5Y' },
        ],
      },
      navigator: {
        enabled: true,
        height: 35,
        outlineColor: 'rgba(57, 255, 136, 0.2)',
        maskFill: 'rgba(57, 255, 136, 0.08)',
        series: {
          color: '#38D9FF',
          lineWidth: 1,
          fillOpacity: 0.1,
        },
        xAxis: {
          gridLineColor: 'rgba(57, 255, 136, 0.05)',
          labels: {
            style: { color: '#71877B', fontSize: '9px' },
          },
        },
      },
      scrollbar: { enabled: false },
      xAxis: {
        crosshair: {
          color: '#38D9FF',
          dashStyle: 'Dash',
          width: 1,
          label: {
            enabled: true,
            backgroundColor: '#38D9FF',
            style: { color: '#030807', fontWeight: 'bold' },
          },
        },
        gridLineColor: 'rgba(57, 255, 136, 0.08)',
        lineColor: 'rgba(57, 255, 136, 0.2)',
        tickColor: 'rgba(57, 255, 136, 0.2)',
        labels: {
          style: { color: '#71877B', fontFamily: 'var(--font-mono)' },
        },
      },
      yAxis: [
        {
          labels: {
            align: 'right',
            x: -4,
            style: { color: '#71877B', fontFamily: 'var(--font-mono)' },
            formatter: function () {
              return '₹' + this.value.toLocaleString('en-IN');
            },
          },
          title: { text: null },
          height: '74%',
          lineWidth: 1,
          lineColor: 'rgba(57, 255, 136, 0.2)',
          gridLineColor: 'rgba(57, 255, 136, 0.08)',
          crosshair: {
            color: '#38D9FF',
            dashStyle: 'Dash',
            width: 1,
            label: {
              enabled: true,
              format: '₹{value:.2f}',
              backgroundColor: '#38D9FF',
              style: { color: '#030807', fontWeight: 'bold' },
            },
          },
          plotLines: [
            {
              value: latestPrice,
              color: '#38D9FF',
              dashStyle: 'ShortDash',
              width: 1,
              zIndex: 5,
              label: {
                text: 'LTP: ₹' + latestPrice.toFixed(2),
                align: 'right',
                style: {
                  color: '#38D9FF',
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                },
              },
            },
          ],
        },
        {
          labels: {
            align: 'right',
            x: -4,
            style: { color: '#51AF7B', fontFamily: 'var(--font-mono)', fontSize: '9px' },
          },
          title: { text: null },
          top: '78%',
          height: '22%',
          offset: 0,
          lineWidth: 1,
          lineColor: 'rgba(57, 255, 136, 0.1)',
          gridLineColor: 'rgba(57, 255, 136, 0.04)',
        },
      ],
      tooltip: {
        backgroundColor: '#07130F',
        borderColor: 'rgba(57, 255, 136, 0.35)',
        borderWidth: 1,
        borderRadius: 2,
        shadow: true,
        split: false,
        shared: true,
        useHTML: true,
        headerFormat: '<div style="font-family: monospace; font-size: 11px; color: #71877B; margin-bottom: 4px;">{point.key}</div>',
        pointFormatter: function () {
          if (this.series.name === 'Volume') {
            return `<div style="font-family: monospace; font-size: 11px; color: #51AF7B;">Volume: <b>${this.y.toLocaleString('en-IN')}</b></div>`;
          }
          const up = this.close >= this.open;
          const color = up ? '#39FF88' : '#FF4D67';
          return `
            <div style="font-family: monospace; font-size: 12px; line-height: 1.5;">
              <span style="color: #71877B">O:</span> <b style="color: #DDFBEA">₹${this.open?.toFixed(2)}</b> &nbsp;
              <span style="color: #71877B">H:</span> <b style="color: #DDFBEA">₹${this.high?.toFixed(2)}</b><br/>
              <span style="color: #71877B">L:</span> <b style="color: #DDFBEA">₹${this.low?.toFixed(2)}</b> &nbsp;
              <span style="color: #71877B">C:</span> <b style="color: ${color}">₹${this.close?.toFixed(2)}</b>
            </div>
          `;
        },
      },
      plotOptions: {
        candlestick: {
          color: '#FF4D67', // Bearish body/border
          upColor: '#39FF88', // Bullish body
          lineColor: '#FF4D67', // Bearish wick
          upLineColor: '#39FF88', // Bullish wick
          pointPadding: 0.15,
          groupPadding: 0.1,
          animation: {
            duration: 600,
          },
        },
        column: {
          borderWidth: 0,
          pointPadding: 0.1,
        },
      },
      series: [
        {
          type: 'candlestick',
          name: symbol,
          data: ohlcData,
          id: 'primary-candlestick',
          dataGrouping: {
            units: [
              ['minute', [1, 5, 15, 30]],
              ['hour', [1]],
              ['day', [1]],
              ['week', [1]],
            ],
          },
        },
        {
          type: 'column',
          name: 'Volume',
          data: volumeData,
          yAxis: 1,
        },
      ],
    };
  }, [symbol, ohlcData, volumeData, latestPrice, height]);

  return (
    <div
      className={`stock-chart-panel ${className}`}
      style={{
        background: '#07130F',
        border: '1px solid rgba(57, 255, 136, 0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Terminal Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          borderBottom: '1px solid rgba(57, 255, 136, 0.12)',
          background: 'rgba(3, 8, 7, 0.8)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 'bold', color: '#39FF88', letterSpacing: '0.5px' }}>
            {symbol}
          </span>
          <span style={{ fontSize: '11px', color: '#71877B', textTransform: 'uppercase' }}>
            NSE • REAL-TIME FEED
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 'bold', color: '#DDFBEA' }}>
            ₹{latestPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '2px',
              color: priceChange >= 0 ? '#39FF88' : '#FF4D67',
              background: priceChange >= 0 ? 'rgba(57, 255, 136, 0.1)' : 'rgba(255, 77, 103, 0.1)',
            }}
          >
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%)
          </span>
        </div>
      </div>

      <HighchartsReact
        highcharts={Highcharts}
        constructorType={'stockChart'}
        options={options}
        ref={chartComponentRef}
      />
    </div>
  );
}
