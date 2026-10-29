# MarketForge Database

MarketForge uses **SQLite 3** natively via Node.js `node:sqlite` (`DatabaseSync`), requiring zero external database installations or background daemon processes. It also maintains full repository compatibility with memory stores and optional PostgreSQL.

```
database/
├── marketforge.db    SQLite primary database file (auto-created)
├── migrations/       Ordered, idempotent schema definitions (001_initial_schema.sql)
├── seeds/            Reference data (SQL) + demo content (JSON) + sample security master (CSV)
└── schemas/          ERD and table documentation
```

## Running & Setup

No Docker or PostgreSQL daemon is required:

```bash
# Run migrations (creates database/marketforge.db and all 44 tables)
npm run db:migrate

# Seed reference data and learning curriculum
npm run db:seed

# Optional: Sync NSE security master
npm run sync:securities
```

## Conventions

- **Storage**: SQLite 3 file in WAL mode (`PRAGMA journal_mode = WAL;`) with foreign keys enabled (`PRAGMA foreign_keys = ON;`).
- **Data Types**: `REAL` for precise currency and percentages; `TEXT` with ISO 8601 strings for timestamps (`datetime('now')`); `TEXT` for JSON blocks and arrays.
- **Repository Interface**: All services interact with data through `SqliteRepository.js`, which automatically serializes objects/arrays to JSON strings and converts between JavaScript `camelCase` properties and database `snake_case` columns.
- `stocks.symbol` is the canonical NSE symbol. Provider-specific tickers live in `stocks.provider_symbols` (JSON text).
- `orders.risk_snapshot` stores the deterministic risk engine output frozen at review time — this is what AI explanations are grounded on.
- `audit_logs` is append-only. Every admin mutation writes a row.

## Table Groups

| Group | Tables |
|---|---|
| Identity | users, roles, sessions, onboarding, user_skills, admin_users |
| Market | stocks, stock_prices, historical_prices, indices, market_status, watchlists |
| Trading | orders, order_events, trades, portfolios, holdings, positions, portfolio_snapshots, funds, transactions |
| News | news, news_stocks |
| Learning | lessons, lesson_progress, quizzes, questions, quiz_results, glossary, scenarios, scenario_attempts, challenges, challenge_progress, study_plans, study_tasks |
| AI | ai_conversations, ai_messages |
| Ops | alerts, market_rules, market_config, audit_logs, sync_events, system_events, analytics_events |

See [schemas/erd.md](schemas/erd.md).
