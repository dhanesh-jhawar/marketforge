import { repos } from '../../repositories/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { nowIso } from '../../utils/index.js';

export const adminService = {
  async getUsers({ limit = 50, offset = 0 } = {}) {
    const users = await repos.users.findMany({}, { limit, offset, orderBy: 'createdAt', desc: true });
    return users.map(({ passwordHash, ...u }) => u);
  },

  async getRules() {
    return repos.marketRules.findMany();
  },

  async updateRule(actorId, ruleId, patch) {
    const current = await repos.marketRules.findById(ruleId);
    if (!current) throw ApiError.notFound(`Rule ${ruleId} not found`);

    const updated = await repos.marketRules.update(ruleId, {
      ...patch,
      updatedBy: actorId,
    });

    await repos.auditLogs.insert({
      actorId,
      action: 'RULE_UPDATED',
      entityType: 'market_rules',
      entityId: ruleId,
      before: current,
      after: updated,
    });

    return updated;
  },

  async getChallenges() {
    return repos.challenges.findMany();
  },

  async getContent() {
    const lessons = await repos.lessons.findMany();
    const quizzes = await repos.quizzes.findMany();
    const glossary = await repos.glossary.findMany();
    return { lessons, quizzes, glossary };
  },

  async getAnalytics() {
    const userCount = await repos.users.count();
    const orderCount = await repos.orders.count();
    const tradeCount = await repos.trades.count();
    const activeSecurities = await repos.stocks.count({ isActive: true });
    return {
      userCount,
      orderCount,
      tradeCount,
      activeSecurities,
    };
  },

  async getSyncEvents({ limit = 30 } = {}) {
    return repos.syncEvents.findMany({}, { limit, orderBy: 'startedAt', desc: true });
  },

  async getAuditLogs({ limit = 50 } = {}) {
    return repos.auditLogs.findMany({}, { limit, orderBy: 'createdAt', desc: true });
  },

  async getSystemStatus() {
    return {
      status: 'OPERATIONAL',
      providers: [
        { provider: 'TejHQ', status: 'HEALTHY', latency: 42, lastSuccess: nowIso() },
        { provider: 'FYERS', status: 'STANDBY', latency: 38, lastSuccess: nowIso() },
        { provider: 'Twelve Data', status: 'HEALTHY', latency: 120, lastSuccess: nowIso() },
        { provider: 'GNews', status: 'HEALTHY', latency: 85, lastSuccess: nowIso() },
        { provider: 'Google Gemini', status: 'HEALTHY', latency: 310, lastSuccess: nowIso() },
        { provider: 'NSE Security Master', status: 'HEALTHY', latency: 25, lastSuccess: nowIso() },
      ],
      database: { status: 'HEALTHY', engine: 'SQLite 3' },
      memory: process.memoryUsage(),
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: nowIso(),
    };
  },
};
