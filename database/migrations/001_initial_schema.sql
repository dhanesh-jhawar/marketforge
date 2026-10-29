-- =====================================================================
-- MarketForge — Initial Schema (SQLite 3)
-- Virtual trading + financial education platform.
-- NO real money is handled.
-- =====================================================================

PRAGMA foreign_keys = ON;

-- =====================================================================
-- IDENTITY & ACCESS
-- =====================================================================
CREATE TABLE IF NOT EXISTS roles (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT UNIQUE NOT NULL,             -- student | mentor | admin | super_admin
  description  TEXT,
  permissions  TEXT NOT NULL DEFAULT '[]'       -- JSON array
);

CREATE TABLE IF NOT EXISTS users (
  id                   TEXT PRIMARY KEY,         -- UUID
  email                TEXT UNIQUE NOT NULL,
  password_hash        TEXT,                     -- for local authentication
  display_name         TEXT NOT NULL,
  avatar_url           TEXT,
  role_id              INTEGER NOT NULL DEFAULT 1 REFERENCES roles(id),
  experience_level     TEXT NOT NULL DEFAULT 'BEGINNER',
  onboarding_complete  INTEGER NOT NULL DEFAULT 0, -- 0 = false, 1 = true
  xp                   INTEGER NOT NULL DEFAULT 0,
  is_active            INTEGER NOT NULL DEFAULT 1,
  last_login_at        TEXT,
  created_at           TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at           TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS sessions (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   TEXT NOT NULL,
  user_agent   TEXT,
  ip_address   TEXT,
  expires_at   TEXT NOT NULL,
  revoked_at   TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS onboarding (
  user_id          TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  answers          TEXT NOT NULL DEFAULT '{}',   -- JSON
  experience_level TEXT,
  risk_profile     TEXT,                         -- CONSERVATIVE | BALANCED | AGGRESSIVE
  goals            TEXT NOT NULL DEFAULT '[]',   -- JSON array
  result           TEXT,                         -- JSON
  completed_at     TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_skills (
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_area  TEXT NOT NULL,
  score       INTEGER NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  attempts    INTEGER NOT NULL DEFAULT 0,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, skill_area)
);

-- =====================================================================
-- MARKET DATA (Security Master = Full NSE Universe)
-- =====================================================================
CREATE TABLE IF NOT EXISTS stocks (
  symbol            TEXT PRIMARY KEY,             -- e.g. "INFY", "RELIANCE"
  exchange          TEXT NOT NULL DEFAULT 'NSE',
  name              TEXT NOT NULL,
  series            TEXT NOT NULL DEFAULT 'EQ',
  isin              TEXT UNIQUE,
  instrument_type   TEXT NOT NULL DEFAULT 'EQUITY',
  sector            TEXT,
  industry          TEXT,
  face_value        REAL,
  lot_size          INTEGER NOT NULL DEFAULT 1,
  listing_date      TEXT,
  market_cap        REAL,
  provider_symbols  TEXT NOT NULL DEFAULT '{}',   -- JSON: {"fyers":"NSE:INFY-EQ","twelvedata":"INFY:NSE"}
  is_active         INTEGER NOT NULL DEFAULT 1,
  is_tradable       INTEGER NOT NULL DEFAULT 1,   -- admin can disable in simulation
  source            TEXT NOT NULL DEFAULT 'nse',
  synced_at         TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_stocks_sector ON stocks(sector);
CREATE INDEX IF NOT EXISTS idx_stocks_name ON stocks(name);

-- Latest snapshot per symbol (hot table)
CREATE TABLE IF NOT EXISTS stock_prices (
  symbol      TEXT PRIMARY KEY REFERENCES stocks(symbol) ON DELETE CASCADE,
  ltp         REAL NOT NULL,
  open        REAL,
  high        REAL,
  low         REAL,
  prev_close  REAL,
  change      REAL,
  change_pct  REAL,
  volume      INTEGER,
  bid         REAL,
  ask         REAL,
  source      TEXT NOT NULL,
  quoted_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS historical_prices (
  symbol     TEXT NOT NULL REFERENCES stocks(symbol) ON DELETE CASCADE,
  interval   TEXT NOT NULL,                      -- 1m | 5m | 15m | 1h | 1d | 1w
  ts         INTEGER NOT NULL,                   -- epoch ms
  open       REAL NOT NULL,
  high       REAL NOT NULL,
  low        REAL NOT NULL,
  close      REAL NOT NULL,
  volume     INTEGER NOT NULL DEFAULT 0,
  source     TEXT NOT NULL,
  PRIMARY KEY (symbol, interval, ts)
);
CREATE INDEX IF NOT EXISTS idx_hist_symbol_interval ON historical_prices(symbol, interval, ts DESC);

CREATE TABLE IF NOT EXISTS indices (
  symbol            TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  exchange          TEXT NOT NULL DEFAULT 'NSE',
  value             REAL,
  change            REAL,
  change_pct        REAL,
  constituents      TEXT NOT NULL DEFAULT '[]',  -- JSON array
  provider_symbols  TEXT NOT NULL DEFAULT '{}',  -- JSON
  quoted_at         TEXT
);

CREATE TABLE IF NOT EXISTS market_status (
  exchange       TEXT PRIMARY KEY,
  session        TEXT NOT NULL,                  -- PRE_OPEN | OPEN | CLOSED | HOLIDAY | HALTED
  is_open        INTEGER NOT NULL,               -- 0 or 1
  message        TEXT,
  next_open      TEXT,
  next_close     TEXT,
  overridden_by  TEXT REFERENCES users(id),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS watchlists (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL DEFAULT 'My Watchlist',
  symbols    TEXT NOT NULL DEFAULT '[]',         -- JSON array
  is_default INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_watchlists_user ON watchlists(user_id);

-- =====================================================================
-- VIRTUAL TRADING
-- =====================================================================
CREATE TABLE IF NOT EXISTS orders (
  id                TEXT PRIMARY KEY,            -- UUID
  user_id           TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol            TEXT NOT NULL REFERENCES stocks(symbol),
  side              TEXT NOT NULL CHECK (side IN ('BUY','SELL')),
  order_type        TEXT NOT NULL CHECK (order_type IN ('MARKET','LIMIT','SL','SL-M')),
  product           TEXT NOT NULL CHECK (product IN ('CNC','MIS')),
  validity          TEXT NOT NULL DEFAULT 'DAY',
  quantity          INTEGER NOT NULL CHECK (quantity > 0),
  filled_quantity   INTEGER NOT NULL DEFAULT 0,
  limit_price       REAL,
  trigger_price     REAL,
  avg_fill_price    REAL,
  status            TEXT NOT NULL,
  rejection_reason  TEXT,
  risk_snapshot     TEXT,                        -- frozen RiskAssessment JSON from deterministic engine
  blocked_amount    REAL NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_open ON orders(status);

CREATE TABLE IF NOT EXISTS order_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL,
  payload     TEXT NOT NULL DEFAULT '{}',        -- JSON
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_events(order_id);

CREATE TABLE IF NOT EXISTS trades (
  id           TEXT PRIMARY KEY,                 -- UUID
  order_id     TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol       TEXT NOT NULL REFERENCES stocks(symbol),
  side         TEXT NOT NULL,
  product      TEXT NOT NULL,
  quantity     INTEGER NOT NULL,
  price        REAL NOT NULL,
  charges      REAL NOT NULL DEFAULT 0,
  executed_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_trades_user ON trades(user_id, executed_at DESC);

CREATE TABLE IF NOT EXISTS portfolios (
  id              TEXT PRIMARY KEY,              -- UUID
  user_id         TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL DEFAULT 'Virtual Portfolio',
  initial_capital REAL NOT NULL,
  reset_count     INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS holdings (
  portfolio_id    TEXT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol          TEXT NOT NULL REFERENCES stocks(symbol),
  quantity        INTEGER NOT NULL CHECK (quantity >= 0),
  avg_price       REAL NOT NULL,
  first_bought_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (portfolio_id, symbol)
);

CREATE TABLE IF NOT EXISTS positions (
  portfolio_id   TEXT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol         TEXT NOT NULL REFERENCES stocks(symbol),
  trade_date     TEXT NOT NULL,
  buy_quantity   INTEGER NOT NULL DEFAULT 0,
  sell_quantity  INTEGER NOT NULL DEFAULT 0,
  buy_value      REAL NOT NULL DEFAULT 0,
  sell_value     REAL NOT NULL DEFAULT 0,
  realized_pnl   REAL NOT NULL DEFAULT 0,
  PRIMARY KEY (portfolio_id, symbol, trade_date)
);

CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  portfolio_id   TEXT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  snapshot_date  TEXT NOT NULL,
  total_value    REAL NOT NULL,
  cash           REAL NOT NULL,
  invested_value REAL NOT NULL,
  pnl            REAL NOT NULL,
  PRIMARY KEY (portfolio_id, snapshot_date)
);

CREATE TABLE IF NOT EXISTS funds (
  user_id         TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_capital   REAL NOT NULL,
  available_cash  REAL NOT NULL,
  blocked_margin  REAL NOT NULL DEFAULT 0,
  realized_pnl    REAL NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'INR',
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (available_cash >= 0)
);

CREATE TABLE IF NOT EXISTS transactions (
  id             TEXT PRIMARY KEY,               -- UUID
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type           TEXT NOT NULL,                  -- see TRANSACTION_TYPE
  amount         REAL NOT NULL,                  -- signed: + credit, - debit
  balance_after  REAL NOT NULL,
  reference_type TEXT,
  reference_id   TEXT,
  note           TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id, created_at DESC);

-- =====================================================================
-- NEWS
-- =====================================================================
CREATE TABLE IF NOT EXISTS news (
  id            TEXT PRIMARY KEY,                -- stable hash of URL
  title         TEXT NOT NULL,
  summary       TEXT,
  content       TEXT,
  url           TEXT UNIQUE NOT NULL,
  image_url     TEXT,
  source_name   TEXT,
  provider      TEXT NOT NULL,                   -- gnews | newsapi | mock
  category      TEXT,
  sentiment     TEXT,
  published_at  TEXT NOT NULL,
  fetched_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published_at DESC);

CREATE TABLE IF NOT EXISTS news_stocks (
  news_id     TEXT NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  symbol      TEXT NOT NULL REFERENCES stocks(symbol) ON DELETE CASCADE,
  relevance   REAL NOT NULL DEFAULT 1,
  PRIMARY KEY (news_id, symbol)
);
CREATE INDEX IF NOT EXISTS idx_news_stocks_symbol ON news_stocks(symbol);

-- =====================================================================
-- LEARNING
-- =====================================================================
CREATE TABLE IF NOT EXISTS lessons (
  id                 TEXT PRIMARY KEY,
  slug               TEXT UNIQUE NOT NULL,
  title              TEXT NOT NULL,
  summary            TEXT,
  skill_area         TEXT NOT NULL,
  difficulty         INTEGER NOT NULL DEFAULT 1,
  estimated_minutes  INTEGER NOT NULL DEFAULT 5,
  blocks             TEXT NOT NULL DEFAULT '[]', -- JSON array
  prerequisites      TEXT NOT NULL DEFAULT '[]', -- JSON array
  order_index        INTEGER NOT NULL DEFAULT 0,
  published          INTEGER NOT NULL DEFAULT 0,
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id     TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at  TEXT,
  progress_pct  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS quizzes (
  id         TEXT PRIMARY KEY,
  lesson_id  TEXT REFERENCES lessons(id) ON DELETE SET NULL,
  title      TEXT NOT NULL,
  pass_pct   INTEGER NOT NULL DEFAULT 60,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS questions (
  id           TEXT PRIMARY KEY,
  quiz_id      TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  prompt       TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'single',
  options      TEXT NOT NULL DEFAULT '[]',       -- JSON array
  answer       TEXT NOT NULL,                    -- JSON
  explanation  TEXT,
  skill_area   TEXT NOT NULL,
  order_index  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quiz_results (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id      TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  answers      TEXT NOT NULL,                    -- JSON
  score_pct    INTEGER NOT NULL,
  passed       INTEGER NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON quiz_results(user_id);

CREATE TABLE IF NOT EXISTS glossary (
  id          TEXT PRIMARY KEY,
  term        TEXT UNIQUE NOT NULL,
  definition  TEXT NOT NULL,
  example     TEXT,
  category    TEXT,
  related     TEXT NOT NULL DEFAULT '[]'        -- JSON array
);

CREATE TABLE IF NOT EXISTS scenarios (
  id             TEXT PRIMARY KEY,
  title          TEXT NOT NULL,
  description    TEXT,
  symbol         TEXT REFERENCES stocks(symbol),
  benchmark      TEXT DEFAULT 'NIFTY50',
  start_date     TEXT NOT NULL,
  end_date       TEXT NOT NULL,
  event_context  TEXT,
  params         TEXT NOT NULL DEFAULT '{}',     -- JSON
  published      INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS scenario_attempts (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scenario_id  TEXT NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  inputs       TEXT NOT NULL,                    -- JSON
  result       TEXT NOT NULL,                    -- JSON
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS challenges (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT,
  type         TEXT NOT NULL,
  criteria     TEXT NOT NULL DEFAULT '{}',       -- JSON
  reward_xp    INTEGER NOT NULL DEFAULT 0,
  starts_at    TEXT,
  ends_at      TEXT,
  is_active    INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS challenge_progress (
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id  TEXT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  progress      TEXT NOT NULL DEFAULT '{}',      -- JSON
  started_at    TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at  TEXT,
  PRIMARY KEY (user_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS study_plans (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL DEFAULT 'My Study Plan',
  goal           TEXT,
  weekly_minutes INTEGER,
  generated_by   TEXT NOT NULL DEFAULT 'learning_engine',
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS study_tasks (
  id          TEXT PRIMARY KEY,
  plan_id     TEXT NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  type        TEXT NOT NULL,                     -- LESSON | QUIZ | SCENARIO | CHALLENGE | CUSTOM
  ref_id      TEXT,
  due_date    TEXT,
  status      TEXT NOT NULL DEFAULT 'TODO',
  order_index INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_study_tasks_plan ON study_tasks(plan_id);

-- =====================================================================
-- AI
-- =====================================================================
CREATE TABLE IF NOT EXISTS ai_conversations (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT,
  context     TEXT NOT NULL DEFAULT '{}',        -- JSON
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id  TEXT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role             TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content          TEXT NOT NULL,
  grounding        TEXT,                         -- JSON: pre-computed facts given to model
  model            TEXT,
  tokens_in        INTEGER,
  tokens_out       INTEGER,
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON ai_messages(conversation_id, id);

-- =====================================================================
-- ALERTS
-- =====================================================================
CREATE TABLE IF NOT EXISTS alerts (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,
  symbol        TEXT REFERENCES stocks(symbol),
  condition     TEXT NOT NULL DEFAULT '{}',      -- JSON
  message       TEXT,
  is_active     INTEGER NOT NULL DEFAULT 1,
  triggered_at  TEXT,
  read_at       TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);

-- =====================================================================
-- ADMIN / RULES / CONFIG
-- =====================================================================
CREATE TABLE IF NOT EXISTS market_rules (
  id           TEXT PRIMARY KEY,                 -- e.g. maxPositionPct
  label        TEXT NOT NULL,
  value        TEXT NOT NULL,                    -- JSON
  severity     TEXT NOT NULL DEFAULT 'BLOCKING',
  description  TEXT,
  is_enabled   INTEGER NOT NULL DEFAULT 1,
  updated_by   TEXT REFERENCES users(id),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS market_config (
  key          TEXT PRIMARY KEY,                 -- e.g. default_capital, slippage_bps
  value        TEXT NOT NULL,                    -- JSON
  description  TEXT,
  updated_by   TEXT REFERENCES users(id),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_users (
  user_id      TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  permissions  TEXT NOT NULL DEFAULT '[]',       -- JSON
  granted_by   TEXT REFERENCES users(id),
  granted_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id     TEXT REFERENCES users(id),
  action       TEXT NOT NULL,
  entity_type  TEXT,
  entity_id    TEXT,
  before       TEXT,                             -- JSON
  after        TEXT,                             -- JSON
  ip_address   TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS sync_events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  job           TEXT NOT NULL,
  provider      TEXT NOT NULL,
  status        TEXT NOT NULL,
  records       INTEGER NOT NULL DEFAULT 0,
  error         TEXT,
  meta          TEXT NOT NULL DEFAULT '{}',      -- JSON
  started_at    TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at   TEXT
);
CREATE INDEX IF NOT EXISTS idx_sync_events_job ON sync_events(job, started_at DESC);

CREATE TABLE IF NOT EXISTS system_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  level       TEXT NOT NULL,
  source      TEXT NOT NULL,
  message     TEXT NOT NULL,
  meta        TEXT NOT NULL DEFAULT '{}',        -- JSON
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  properties  TEXT NOT NULL DEFAULT '{}',        -- JSON
  session_id  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_analytics_name ON analytics_events(name, created_at DESC);
