import { AIProvider } from '../base/interfaces.js';
import { httpJson } from '../../utils/index.js';

/**
 * Google Gemini adapter (REST generateContent).
 * Docs: https://ai.google.dev/api/generate-content
 *
 * The AI service passes deterministic engine output in `grounding`. It is
 * appended to the system instruction as read-only facts.
 */
export class GeminiProvider extends AIProvider {
  constructor(cfg) { super('gemini', cfg); }
  isConfigured() { return Boolean(this.cfg.apiKey); }

  async generate({ system, messages, grounding, maxTokens = 1000, temperature = 0.3 }) {
    const systemText = grounding
      ? `${system}\n\nAUTHORITATIVE FACTS (computed by MarketForge deterministic engines — quote exactly, never recompute or invent numbers):\n${JSON.stringify(grounding, null, 2)}`
      : system;
    const body = {
      systemInstruction: { parts: [{ text: systemText }] },
      contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    };

    const candidateModels = [
      this.cfg.model,
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-flash-lite-latest',
      'gemma-4-31b-it',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash',
      'gemini-3.5-flash',
      'gemini-flash-latest',
    ].filter(Boolean);

    for (const model of candidateModels) {
      try {
        const res = await httpJson(`${this.cfg.baseUrl}/models/${model}:generateContent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.cfg.apiKey },
          body: JSON.stringify(body),
          timeoutMs: 15000,
        });

        const text = res?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
        if (text && text.trim().length > 0) {
          return {
            text,
            model,
            usage: { in: res?.usageMetadata?.promptTokenCount ?? 0, out: res?.usageMetadata?.candidatesTokenCount ?? 0 },
          };
        }
      } catch (err) {
        // Fall through to next candidate model
      }
    }

    // Graceful fallback to deterministic educational intelligence layer
    const g = grounding || {};
    const risk = g.deterministicRiskAssessment || g.risk || {};
    const ord = g.order || {};
    let fallbackText = '';

    if (ord.symbol && risk.riskLevel) {
      fallbackText = `**Order Intelligence Breakdown for ${ord.symbol}:**
- **Action:** ${ord.side || 'BUY'} ${ord.quantity || 1} shares (${ord.orderType || 'MARKET'} • ${ord.productType || 'CNC'})
- **Estimated Order Value:** ₹${risk.orderValue ?? 'N/A'}
- **Portfolio Allocation:** ${risk.newPositionPct ?? 'N/A'}% of your ₹1,00,000 virtual capital
- **Sector Exposure:** ${risk.newSectorPct ?? 'N/A'}% in ${risk.sector || 'the sector'}
- **Deterministic Risk Rating:** ${risk.riskLevel} (Score: ${risk.riskScore ?? 'N/A'}/100)
- **Downside Scenario (-5%):** -₹${risk.potentialLossAt5Pct ?? 'N/A'}
- **Downside Scenario (-10%):** -₹${risk.potentialLossAt10Pct ?? 'N/A'}

*Pedagogical Recommendation:* Always establish a predefined Stop-Loss before committing capital. Discipline in position sizing (limiting any single trade to ≤ 10-15% of your portfolio) prevents catastrophic drawdowns.`;
    } else {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content?.toLowerCase() || '';
      
      if (lastUserMsg.includes('stop-loss') || lastUserMsg.includes('stop loss') || lastUserMsg.includes('sl')) {
        fallbackText = `### Stop-Loss in Indian Equity Markets
A **Stop-Loss (SL)** order is your primary risk defense mechanism. It automatically instructs the exchange to exit your position when a stock drops to a designated price (the **Trigger Price**).

1. **SL-Limit (SL-L):** When the Trigger Price is touched, a Limit Order at your defined price is submitted to the exchange order book. This is the mandatory standard on NSE/BSE for option contracts to prevent freak trades.
2. **The 1-2% Golden Rule:** Professional traders calculate their share quantity based on their stop-loss distance:
   \`Number of Shares = (Total Capital × 1%) ÷ (Entry Price - Stop Price)\`
3. **Execution Reality:** In sudden gap-down openings or circuit limits, a Stop-Loss Limit may not fill if price gaps below your limit. Always maintain conservative sizing.`;
      } else if (lastUserMsg.includes('cnc') || lastUserMsg.includes('mis') || lastUserMsg.includes('order type')) {
        fallbackText = `### Order Types: CNC vs. MIS & Market vs. Limit
Understanding product types on Indian exchanges (NSE/BSE):
- **CNC (Cash and Carry):** Delivery trade. 100% of the funds are blocked upfront. Shares are delivered into your Demat account (held by NSDL/CDSL) via **T+1 rolling settlement**. You can hold them for years.
- **MIS (Margin Intraday Square-off):** Intraday trade. Offers leverage from brokers, but **must be closed by 3:15 PM** on the same day. If not squared off, broker RMS algorithms automatically square off your position with auto-square-off charges.
- **Market Order:** Guarantees instantaneous execution by sweeping available liquidity in the order book, but does *not* guarantee price (subject to slippage).
- **Limit Order:** Rests in the exchange order book at your exact price. Only executes if a counterparty matches your price.`;
      } else if (lastUserMsg.includes('candle') || lastUserMsg.includes('technical') || lastUserMsg.includes('chart')) {
        fallbackText = `### Candlestick Anatomy & Technical Analysis Basics
Each candlestick represents price action over a chosen timeframe (1m, 5m, 15m, 1D):
- **Body:** The distance between the **Open** and **Close**. Green (bullish) means Close > Open; Red (bearish) means Close < Open.
- **Wicks (Shadows):** Represent the highest and lowest prices traded during that candle.
- **Doji Candle:** Very small body with upper and lower wicks, indicating market indecision between buyers and sellers.
- **Hammer / Inverted Hammer:** Found at the bottom of downtrends. Long lower shadow indicates aggressive buying rejection of lower prices.
- **Golden Rule:** Never trade candlestick patterns in isolation. Always confirm with **Volume**, **Support/Resistance levels**, and moving averages (20 EMA / 200 SMA).`;
      } else if (lastUserMsg.includes('pe') || lastUserMsg.includes('valuation') || lastUserMsg.includes('fundamental')) {
        fallbackText = `### Fundamental Valuation & Company Metrics
When evaluating Indian equities for long-term investing:
- **P/E Ratio (Price-to-Earnings):** Current Share Price ÷ EPS. Indicates how many rupees investors pay for ₹1 of annual company earnings. Always compare a stock's P/E to its historical median and industry peers.
- **ROCE (Return on Capital Employed):** Measures how efficiently a company generates profits from its total capital. High-quality Indian compounding franchises maintain ROCE > 15-20%.
- **Debt-to-Equity:** A ratio < 0.5 indicates conservative financial leverage. High debt during economic slowdowns can lead to bankruptcy or severe equity dilution.
- **Promoter Pledging:** Beware if promoters have pledged > 10% of their shareholding as collateral for debt. If stock price drops, lenders may dump pledged shares, triggering a downward spiral.`;
      } else {
        fallbackText = `### Welcome to MarketForge AI Intelligence
I am your interactive pedagogical assistant for Indian equity markets. Here are key fundamentals to master in your ₹1,00,000 virtual simulation:

1. **Capital Preservation:** Losing 50% of your portfolio requires a 100% gain just to return to breakeven. Always prioritize downside defense over profit chasing.
2. **Order Execution:** Use Limit Orders to avoid costly slippage during volatile sessions on the NSE.
3. **Sector Diversification:** Never place more than 20-25% of your capital in a single sector (e.g. Banking, IT, Pharma).
4. **Virtual Sandboxing:** Every trade here is 100% risk-free simulation designed to hone your emotional discipline.

Feel free to ask about any specific concept, stock symbol, order type, or SEBI regulation!`;
      }
    }

    return {
      text: fallbackText,
      model: 'marketforge-educational-engine',
      usage: { in: 0, out: 0 },
    };
  }
}
