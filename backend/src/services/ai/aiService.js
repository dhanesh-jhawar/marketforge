import { getProviders } from '../../providers/index.js';
import { repos } from '../../repositories/index.js';
import { riskService } from '../risk/riskService.js';
import { marketService } from '../market/marketService.js';
import { portfolioService } from '../portfolio/portfolioService.js';
import { newsService } from '../news/newsService.js';
import { uuid, nowIso } from '../../utils/index.js';

const SYSTEM_INSTRUCTION = `You are MarketForge Mentor, an AI financial education assistant for an Indian virtual stock trading and market simulation platform.
CRITICAL MANDATES:
1. This is a VIRTUAL trading platform for LEARNING. No real money is involved.
2. YOU MUST NEVER CALCULATE OR INVENT FINANCIAL RISK NUMBERS, ORDER VALUES, POSITION SIZES, LOSS AMOUNTS, OR VOLATILITY.
3. All financial and risk numbers are pre-calculated by MarketForge's deterministic backend engines and provided to you under "AUTHORITATIVE FACTS".
4. When explaining orders, risks, or portfolios, QUOTE and EXPLAIN the provided authoritative figures in plain, encouraging, pedagogical English (or Hinglish if appropriate).
5. Always guide the user toward disciplined risk management, diversification, and understanding SEBI market rules.`;

export const aiService = {
  async chat(userId, { conversationId, message, context = {} }) {
    let convId = conversationId;
    if (!convId) {
      convId = uuid();
      await repos.aiConversations.insert({
        id: convId,
        userId,
        title: message.slice(0, 40) + '...',
        context,
      });
    }

    // Save user message
    await repos.aiMessages.insert({
      conversationId: convId,
      role: 'user',
      content: message,
    });

    const previousMessages = await repos.aiMessages.findMany(
      { conversationId: convId },
      { limit: 10, orderBy: 'id', desc: false }
    );

    const providers = getProviders();
    const result = await providers.ai.generate({
      system: SYSTEM_INSTRUCTION,
      messages: previousMessages.map((m) => ({ role: m.role, content: m.content })),
      grounding: context.grounding || null,
    });

    // Save assistant message
    await repos.aiMessages.insert({
      conversationId: convId,
      role: 'assistant',
      content: result.text,
      model: result.model,
      tokensIn: result.usage?.in || 0,
      tokensOut: result.usage?.out || 0,
      grounding: context.grounding || null,
    });

    return {
      conversationId: convId,
      message: result.text,
      model: result.model,
    };
  },

  /** Explains an order's deterministic risk assessment in natural language */
  async explainOrder(userId, payload = {}) {
    const order = payload.order || payload.orderDraft || payload;
    let snapshot = payload.riskSnapshot || payload.riskAnalysis;
    if (!snapshot && order?.symbol) {
      snapshot = await riskService.assessOrder(userId, order);
    }

    const prompt = `Please explain the following order review and deterministic risk assessment to me as a learner. Help me understand why these limits and warnings exist and what they mean for my virtual portfolio.`;

    const providers = getProviders();
    const result = await providers.ai.generate({
      system: SYSTEM_INSTRUCTION,
      messages: [{ role: 'user', content: prompt }],
      grounding: {
        order,
        deterministicRiskAssessment: snapshot,
      },
    });

    return {
      explanation: result.text,
      riskSnapshot: snapshot,
    };
  },

  /** Explains a stock's profile, recent quote, and key fundamentals */
  async explainStock(symbol) {
    const sym = String(symbol).toUpperCase();
    const security = await repos.stocks.findById(sym);
    const quote = await marketService.getQuote(sym);

    const prompt = `Explain what company ${security?.name || sym} is, what sector it operates in, its current trading price on NSE, and what general market factors influence stocks in this sector.`;

    const providers = getProviders();
    const result = await providers.ai.generate({
      system: SYSTEM_INSTRUCTION,
      messages: [{ role: 'user', content: prompt }],
      grounding: {
        security,
        quote,
      },
    });

    return { explanation: result.text };
  },

  /** Explains a financial news article in simple educational terms */
  async explainNews(input) {
    let article = null;
    if (typeof input === 'string') {
      article = await newsService.getById(input).catch(() => null);
    } else if (input && typeof input === 'object') {
      if (input.newsId) article = await newsService.getById(input.newsId).catch(() => null);
      if (!article) article = input;
    }
    const prompt = `Break down this financial news headline and article for a beginner trader in the Indian stock market. What does it mean for the tagged stocks?`;

    const providers = getProviders();
    const result = await providers.ai.generate({
      system: SYSTEM_INSTRUCTION,
      messages: [{ role: 'user', content: prompt }],
      grounding: { article: article || { title: 'Market Wire Update' } },
    });

    return { explanation: result.text };
  },

  /** Explains overall portfolio health, diversification score, and risk concentration */
  async explainPortfolio(userId) {
    const summary = await portfolioService.getSummary(userId);
    const risk = await portfolioService.getRiskMetrics(userId);
    const allocation = await portfolioService.getAllocation(userId);

    const prompt = `Review my current virtual portfolio health, diversification score, and risk concentration. Give me constructive pedagogical feedback.`;

    const providers = getProviders();
    const result = await providers.ai.generate({
      system: SYSTEM_INSTRUCTION,
      messages: [{ role: 'user', content: prompt }],
      grounding: {
        portfolioSummary: summary,
        riskMetrics: risk,
        allocation,
      },
    });

    return { explanation: result.text };
  },
};
