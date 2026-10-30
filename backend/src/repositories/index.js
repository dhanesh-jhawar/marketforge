import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config/index.js';
import { MemoryRepository } from './MemoryRepository.js';
import { SqliteRepository } from './SqliteRepository.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('repositories');

/** name -> { table, pk }. Mirrors database/migrations/001_initial_schema.sql */
const TABLES = {
  users: { table: 'users', pk: 'id' },
  roles: { table: 'roles', pk: 'id' },
  sessions: { table: 'sessions', pk: 'id' },
  onboarding: { table: 'onboarding', pk: 'userId' },
  userSkills: { table: 'user_skills', pk: ['userId', 'skillArea'] },

  stocks: { table: 'stocks', pk: 'symbol' },
  stockPrices: { table: 'stock_prices', pk: 'symbol' },
  historicalPrices: { table: 'historical_prices', pk: ['symbol', 'interval', 'ts'] },
  indices: { table: 'indices', pk: 'symbol' },
  marketStatus: { table: 'market_status', pk: 'exchange' },
  watchlists: { table: 'watchlists', pk: 'id' },

  orders: { table: 'orders', pk: 'id' },
  orderEvents: { table: 'order_events', pk: 'id' },
  trades: { table: 'trades', pk: 'id' },
  portfolios: { table: 'portfolios', pk: 'id' },
  holdings: { table: 'holdings', pk: ['portfolioId', 'symbol'] },
  positions: { table: 'positions', pk: ['portfolioId', 'symbol', 'tradeDate'] },
  portfolioSnapshots: { table: 'portfolio_snapshots', pk: ['portfolioId', 'snapshotDate'] },
  funds: { table: 'funds', pk: 'userId' },
  transactions: { table: 'transactions', pk: 'id' },

  news: { table: 'news', pk: 'id' },
  newsStocks: { table: 'news_stocks', pk: ['newsId', 'symbol'] },
  replaySessions: { table: 'replay_sessions', pk: 'id' },
  replayEvents: { table: 'replay_events', pk: 'id' },

  lessons: { table: 'lessons', pk: 'id' },
  lessonProgress: { table: 'lesson_progress', pk: ['userId', 'lessonId'] },
  quizzes: { table: 'quizzes', pk: 'id' },
  questions: { table: 'questions', pk: 'id' },
  quizResults: { table: 'quiz_results', pk: 'id' },
  glossary: { table: 'glossary', pk: 'id' },
  scenarios: { table: 'scenarios', pk: 'id' },
  scenarioAttempts: { table: 'scenario_attempts', pk: 'id' },
  challenges: { table: 'challenges', pk: 'id' },
  challengeProgress: { table: 'challenge_progress', pk: ['userId', 'challengeId'] },
  studyPlans: { table: 'study_plans', pk: 'id' },
  studyTasks: { table: 'study_tasks', pk: 'id' },

  aiConversations: { table: 'ai_conversations', pk: 'id' },
  aiMessages: { table: 'ai_messages', pk: 'id' },
  alerts: { table: 'alerts', pk: 'id' },

  marketRules: { table: 'market_rules', pk: 'id' },
  marketConfig: { table: 'market_config', pk: 'key' },
  adminUsers: { table: 'admin_users', pk: 'userId' },
  auditLogs: { table: 'audit_logs', pk: 'id' },
  syncEvents: { table: 'sync_events', pk: 'id' },
  systemEvents: { table: 'system_events', pk: 'id' },
  analyticsEvents: { table: 'analytics_events', pk: 'id' },
};

/** @type {Record<keyof typeof TABLES, import('./Repository.js').Repository>} */
export const repos = {};
let pool = null;
let sqliteDb = null;

export async function initDataStore() {
  if (config.data.store === 'sqlite') {
    const { DatabaseSync } = await import('node:sqlite');
    // Ensure parent directory exists
    const dbDir = path.dirname(config.data.sqlitePath);
    await fs.mkdir(dbDir, { recursive: true });

    sqliteDb = new DatabaseSync(config.data.sqlitePath);
    sqliteDb.exec('PRAGMA journal_mode = WAL;');
    sqliteDb.exec('PRAGMA foreign_keys = ON;');

    // Auto-apply schema migrations if needed
    const schemaFile = path.join(config.data.migrationsDir, '001_initial_schema.sql');
    try {
      const schemaSql = await fs.readFile(schemaFile, 'utf8');
      sqliteDb.exec(schemaSql);
    } catch (err) {
      log.warn({ err: err.message }, 'Schema migration check warning');
    }

    // Auto-apply initial reference seeds if needed
    const seedFile = path.join(config.data.seedsDir, '001_reference_data.sql');
    try {
      const seedSql = await fs.readFile(seedFile, 'utf8');
      sqliteDb.exec(seedSql);
    } catch (err) {
      log.warn({ err: err.message }, 'Seed SQL warning');
    }

    for (const [name, def] of Object.entries(TABLES)) {
      repos[name] = new SqliteRepository({ name, ...def }, sqliteDb);
    }

    // Always sync latest content.json seeds (lessons, quizzes, questions, glossary, challenges)
    await seedContentData();
    await seedDemoUsers();

    log.info({ path: config.data.sqlitePath }, 'Data store: sqlite initialized');
  } else if (config.data.store === 'postgres') {
    const { default: pg } = await import('pg');
    pool = new pg.Pool({ connectionString: config.data.databaseUrl, ssl: config.data.ssl ? { rejectUnauthorized: false } : false });
    await pool.query('SELECT 1');
    for (const [name, def] of Object.entries(TABLES)) repos[name] = new PostgresRepository({ name, ...def }, pool);
    log.info('Data store: postgres');
  } else {
    for (const [name, def] of Object.entries(TABLES)) repos[name] = new MemoryRepository({ name, ...def });
    await seedMemoryStore();
    log.info('Data store: memory (seeded from database/seeds)');
  }
  return repos;
}

export const getPool = () => pool;
export const getDb = () => sqliteDb;

async function seedContentData() {
  const contentPath = path.join(config.data.seedsDir, 'content.json');
  try {
    const content = JSON.parse(await fs.readFile(contentPath, 'utf8'));
    if (content.lessons) await repos.lessons.upsertMany(content.lessons);
    
    if (content.quizzes) {
      for (const quiz of content.quizzes) {
        const { questions, ...quizData } = quiz;
        await repos.quizzes.upsert(quizData);
        if (Array.isArray(questions)) {
          if (typeof repos.questions.deleteMany === "function") { await repos.questions.deleteMany({ quizId: quiz.id }); }
          for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            await repos.questions.upsert({
              id: q.id,
              quizId: quiz.id,
              prompt: q.prompt,
              type: q.type || 'single',
              options: q.options || [],
              answer: q.answer,
              explanation: q.explanation || '',
              skillArea: q.skillArea || 'market_basics',
              orderIndex: i,
            });
          }
        }
      }
    }

    if (content.glossary) await repos.glossary.upsertMany(content.glossary);
    if (content.scenarios) await repos.scenarios.upsertMany(content.scenarios);
    if (content.challenges) await repos.challenges.upsertMany(content.challenges.map((c) => ({ isActive: true, ...c })));
    if (content.onboardingQuestions) await repos.marketConfig.upsert({ key: 'onboardingQuestions', value: content.onboardingQuestions });
    log.info('Initial educational content and questions seeded successfully');
  } catch (err) {
    log.warn({ err: err.message }, 'Could not seed content data');
  }
}

/** Load demo content + reference data into the memory store. Securities are loaded by the security master service. */
async function seedMemoryStore() {
  const content = JSON.parse(await fs.readFile(path.join(config.data.seedsDir, 'content.json'), 'utf8'));
  await repos.lessons.insertMany(content.lessons);
  
  if (content.quizzes) {
    for (const quiz of content.quizzes) {
      const { questions, ...quizData } = quiz;
      await repos.quizzes.upsert(quizData);
      if (Array.isArray(questions)) {
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          await repos.questions.upsert({
            id: q.id,
            quizId: quiz.id,
            prompt: q.prompt,
            type: q.type || 'single',
            options: q.options || [],
            answer: q.answer,
            explanation: q.explanation || '',
            skillArea: q.skillArea || 'market_basics',
            orderIndex: i,
          });
        }
      }
    }
  }

  await repos.glossary.insertMany(content.glossary);
  await repos.scenarios.insertMany(content.scenarios);
  await repos.challenges.insertMany(content.challenges.map((c) => ({ isActive: true, ...c })));
  await repos.marketConfig.upsert({ key: 'onboardingQuestions', value: content.onboardingQuestions });

  await repos.roles.insertMany([
    { id: 1, name: 'student' }, { id: 2, name: 'mentor' }, { id: 3, name: 'admin' }, { id: 4, name: 'super_admin' },
  ]);
  const { DEFAULT_RISK_RULES } = await import('@marketforge/shared/constants');
  await repos.marketRules.insertMany(
    Object.entries(DEFAULT_RISK_RULES).map(([id, value]) => ({
      id, label: id, value, isEnabled: true,
      severity: ['maxPositionPct', 'maxDailyOrders', 'allowShortSelling', 'allowIntraday'].includes(id) ? 'BLOCKING' : 'WARNING',
    })),
  );
  await repos.marketConfig.insertMany([
    { key: 'default_capital', value: config.trading.defaultCapital },
    { key: 'slippage_bps', value: config.trading.slippageBps },
    { key: 'brokerage_flat', value: config.trading.brokerageFlat },
    { key: 'simulation_mode', value: 'live' },
    { key: 'market_halted', value: false },
  ]);
}

async function seedDemoUsers() {
  try {
    const existing = await repos.users.findOne({ email: 'trader@marketforge.dev' });
    if (!existing) {
      const { register } = await import('../services/auth/authService.js');
      await register({
        email: 'trader@marketforge.dev',
        password: 'password123',
        displayName: 'Market Pioneer',
      });
      log.info('Seeded default demo user: trader@marketforge.dev / password123');
    }
  } catch (err) {
    log.warn({ err: err.message }, 'Demo user seeding notice');
  }
}
