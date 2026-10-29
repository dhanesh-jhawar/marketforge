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

  async generate({ system, messages, grounding, maxTokens = 800, temperature = 0.3 }) {
    const systemText = grounding
      ? `${system}\n\nAUTHORITATIVE FACTS (computed by MarketForge deterministic engines — quote exactly, never recompute or invent numbers):\n${JSON.stringify(grounding, null, 2)}`
      : system;
    const body = {
      systemInstruction: { parts: [{ text: systemText }] },
      contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    };

    const candidateModels = [
      'gemini-3.5-flash',
      this.cfg.model,
      'gemini-flash-latest',
      'gemini-2.5-flash-lite',
      'gemini-pro-latest',
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
        if (text) {
          return {
            text,
            model,
            usage: { in: res?.usageMetadata?.promptTokenCount ?? 0, out: res?.usageMetadata?.candidatesTokenCount ?? 0 },
          };
        }
      } catch (err) {
        // Continue to fallback model or deterministic fallback
      }
    }

    // Graceful fallback to deterministic explanation layer using authoritative grounding
    const g = grounding || {};
    const risk = g.deterministicRiskAssessment || g.risk || {};
    const ord = g.order || {};
    let fallbackText = '';

    if (ord.symbol && risk.riskLevel) {
      fallbackText = `This order places ${ord.side || 'BUY'} ${ord.quantity || 1} shares of ${ord.symbol} with an estimated order value of ₹${risk.orderValue ?? 'N/A'}. This would represent approximately ${risk.newPositionPct ?? 'N/A'}% of your virtual portfolio, placing sector exposure at ${risk.newSectorPct ?? 'N/A'}% in ${risk.sector || 'the sector'}. The deterministic risk engine evaluates this at a ${risk.riskLevel} risk level (Risk Score: ${risk.riskScore ?? 'N/A'}/100). If the price declines by 5%, your estimated loss is ₹${risk.potentialLossAt5Pct ?? 'N/A'}, and at -10% the estimated loss is ₹${risk.potentialLossAt10Pct ?? 'N/A'}. Remember to maintain position sizing discipline and never risk more than you are prepared to lose.`;
    } else {
      fallbackText = `MarketForge Educational Assistant: All trades in this environment are strictly virtual using ₹1,00,000 in simulated learning capital. Focus on position sizing, sector diversification, and risk control before committing virtual orders.`;
    }

    return {
      text: fallbackText,
      model: 'marketforge-educational-engine',
      usage: { in: 0, out: 0 },
    };
  }
}
