import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(__dirname, '../../..');

// Automatically load root .env file if available
const envFile = path.resolve(ROOT_DIR, '.env');
if (fs.existsSync(envFile) && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(envFile);
  } catch (err) {
    // Ignore if already loaded
  }
}

const env = process.env;
const list = (v, d) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : d);
const num = (v, d) => (v != null && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : d);
const bool = (v, d) => (v == null || v === '' ? d : ['1', 'true', 'yes'].includes(String(v).toLowerCase()));

/**
 * Central, typed configuration. Nothing else in the backend should read
 * process.env directly.
 */
export const config = Object.freeze({
  env: env.NODE_ENV || 'development',
  isProd: env.NODE_ENV === 'production',
  logLevel: env.LOG_LEVEL || 'info',

  server: {
    port: num(env.BACKEND_PORT, 4000),
    publicUrl: env.BACKEND_PUBLIC_URL || 'http://localhost:4000',
    corsOrigins: env.CORS_ORIGIN || env.CORS_ORIGINS ? (env.CORS_ORIGIN === '*' ? '*' : list(env.CORS_ORIGIN || env.CORS_ORIGINS)) : '*',
  },

  data: {
    store: env.DATA_STORE || 'sqlite', // sqlite | memory | postgres
    sqlitePath: env.SQLITE_PATH ? path.resolve(ROOT_DIR, env.SQLITE_PATH) : path.join(ROOT_DIR, 'database', 'marketforge.db'),
    databaseUrl: env.DATABASE_URL,
    ssl: bool(env.DATABASE_SSL, false),
    seedsDir: env.SEEDS_DIR ? path.resolve(ROOT_DIR, env.SEEDS_DIR) : path.join(ROOT_DIR, 'database', 'seeds'),
    migrationsDir: env.MIGRATIONS_DIR ? path.resolve(ROOT_DIR, env.MIGRATIONS_DIR) : path.join(ROOT_DIR, 'database', 'migrations'),
  },

  auth: {
    provider: env.AUTH_PROVIDER || 'local', // local | supabase
    jwtSecret: env.JWT_SECRET || 'change-me-dev-only',
    jwtExpiresIn: env.JWT_EXPIRES_IN || '7d',
    supabase: {
      url: env.SUPABASE_URL,
      anonKey: env.SUPABASE_ANON_KEY,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
      jwtSecret: env.SUPABASE_JWT_SECRET,
    },
  },

  market: {
    providers: list(env.MARKET_DATA_PROVIDERS, ['mock']),
    historicalProviders: list(env.HISTORICAL_DATA_PROVIDERS, ['mock']),
    realtimeProvider: env.REALTIME_PROVIDER || 'mock',
    quoteCacheTtlMs: num(env.QUOTE_CACHE_TTL_MS, 2000),
    historyCacheTtlMs: num(env.HISTORY_CACHE_TTL_MS, 300000),
  },

  providers: {
    tejhq: { apiKey: env.TEJHQ_API_KEY, baseUrl: env.TEJHQ_BASE_URL },
    fyers: {
      appId: env.FYERS_APP_ID,
      secretKey: env.FYERS_SECRET_KEY,
      redirectUri: env.FYERS_REDIRECT_URI,
      accessToken: env.FYERS_ACCESS_TOKEN,
      baseUrl: env.FYERS_BASE_URL || 'https://api-t1.fyers.in/api/v3',
      dataUrl: env.FYERS_DATA_URL || 'https://api-t1.fyers.in/data',
    },
    twelveData: { apiKey: env.TWELVE_DATA_API_KEY, baseUrl: env.TWELVE_DATA_BASE_URL || 'https://api.twelvedata.com' },
    gnews: { apiKey: env.GNEWS_API_KEY, baseUrl: env.GNEWS_BASE_URL || 'https://gnews.io/api/v4' },
    newsapi: { apiKey: env.NEWSAPI_KEY, baseUrl: env.NEWSAPI_BASE_URL || 'https://newsapi.org/v2' },
    gemini: {
      apiKey: env.GEMINI_API_KEY,
      model: env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
      baseUrl: env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
    },
    nse: {
      equityListUrl: env.NSE_EQUITY_LIST_URL || 'https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv',
      fallbackFile: path.join(ROOT_DIR, env.NSE_SECURITY_MASTER_FALLBACK || 'database/seeds/securities.sample.csv'),
    },
  },

  news: { providers: list(env.NEWS_PROVIDERS, ['mock']) },
  ai: { provider: env.AI_PROVIDER || 'mock' },

  workers: {
    enabled: bool(env.WORKERS_ENABLED, true),
    marketSyncIntervalMs: num(env.MARKET_SYNC_INTERVAL_MS, 5000),
    newsSyncIntervalMs: num(env.NEWS_SYNC_INTERVAL_MS, 600000),
  },

  trading: {
    defaultCapital: num(env.DEFAULT_VIRTUAL_CAPITAL, 1_000_000),
    slippageBps: num(env.SIMULATED_SLIPPAGE_BPS, 5),
    brokerageFlat: num(env.BROKERAGE_FLAT_PER_ORDER, 20),
  },
});

export default config;
