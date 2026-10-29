# MarketForge Backend

Production-quality backend architecture for **MarketForge** — an Indian stock-market learning and virtual trading platform.

> [!IMPORTANT]
> **MarketForge is NOT a real-money brokerage.** Every order and rupee is simulated. Every new user receives **₹1,00,000 in virtual starting capital**. No real-money transaction or broker order routing is ever performed.

---

## 1. Quick Start

Ensure **Node.js >= 20** is installed.

```bash
# 1. Install root workspace dependencies
npm install

# 2. Run SQLite migrations
npm run migrate

# 3. Seed curriculum, demo users, sample holdings, and NSE security master
npm run seed

# 4. Start backend in development mode (with hot reloading and workers)
npm run dev:backend

# 5. Run automated test suite
npm test
```

Default servers:
- **Backend HTTP API**: `http://localhost:4000`
- **Realtime WebSocket**: `ws://localhost:4000/ws`
- **Frontend Web App**: `http://localhost:3000`

---

## 2. Seed Credentials

| Account | Email | Password | Role | Starting Balance |
| :--- | :--- | :--- | :--- | :--- |
| **Learner (Demo)** | `trader@marketforge.dev` | `Trader@123` | Student | ₹1,00,000 (with sample holdings) |
| **Admin** | `admin@marketforge.dev` | `Admin@123` | Administrator | ₹10,00,000 |

---

## 3. Environment Variables (`.env`)

Create `.env` in the workspace root (see `.env.example`):

```ini
# Server Configuration
NODE_ENV=development
APP_NAME=MarketForge
BACKEND_PORT=4000
BACKEND_PUBLIC_URL=http://localhost:4000
CORS_ORIGINS=http://localhost:3000

# Primary Data Store (SQLite 3 via node:sqlite DatabaseSync)
DATA_STORE=sqlite
SQLITE_PATH=database/marketforge.db

# Authentication
JWT_SECRET=marketforge-dev-secret-key-32chars
JWT_EXPIRES_IN=7d
AUTH_PROVIDER=local

# Provider Keys
TEJHQ_API_KEY=your_tejhq_api_key_here
TEJHQ_BASE_URL=https://api.tejhq.dev/v1

TWELVE_DATA_API_KEY=your_twelve_data_api_key_here
TWELVE_DATA_BASE_URL=https://api.twelvedata.com

GNEWS_API_KEY=your_gnews_api_key_here
GNEWS_BASE_URL=https://gnews.io/api/v4

GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-flash-latest
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta

# Provider Fallback Chains
MARKET_DATA_PROVIDERS=tejhq,twelvedata,mock
HISTORICAL_DATA_PROVIDERS=twelvedata,mock
REALTIME_PROVIDER=mock
NEWS_PROVIDERS=gnews,mock
AI_PROVIDER=gemini

# Background Sync Workers
WORKERS_ENABLED=true
MARKET_SYNC_INTERVAL_MS=5000
NEWS_SYNC_INTERVAL_MS=600000

# Trading & Risk Rules
DEFAULT_VIRTUAL_CAPITAL=100000
SIMULATED_SLIPPAGE_BPS=5
BROKERAGE_FLAT_PER_ORDER=20
MAX_POSITION_PERCENT=30
MAX_ORDER_VALUE=500000
```

---

## 4. Architectural Overview

```
USER / FRONTEND (localhost:3000)
    │
    ├── REST API (localhost:4000)
    │     ├── Auth (JWT + bcryptjs)
    │     ├── Onboarding Questionnaire
    │     ├── Markets & NSE Equities Universe (2,620 securities)
    │     ├── Watchlist Management
    │     ├── Trading Engine (Atomic review → confirm → match → funds)
    │     ├── Deterministic Risk Engine (Position %, sector %, -5%/-10% loss)
    │     ├── Gemini AI Mentorship (Educational explanations strictly grounded in engine data)
    │     ├── Portfolio Accounting (Avg cost, daily P&L, unrealized/realized)
    │     ├── News Pipeline (GNews deduplicated & auto-tagged with stock tickers)
    │     ├── Learning & Quizzes (XP, mastery, skill radars)
    │     ├── What-If Historical Backtester (COVID crash, SIP vs Lump Sum)
    │     └── Admin Mission Control (Rules, analytics, audit log, provider sync)
    │
    └── Realtime WebSocket (ws://localhost:4000/ws)
          ├── `price:update` ticks
          ├── `order:update` fills
          ├── `trade:execution` notifications
          ├── `portfolio:update` balance sync
          └── `news:new` broadcasts
```

---

## 5. Providers & Resiliency

1. **TejHQ Provider (`tejhq.provider.js`)**: Primary Indian market data source for live quotes, corporate status, and NSE indices.
2. **Twelve Data Provider (`twelveData.provider.js`)**: Secondary market provider and global historical backup.
3. **GNews Provider (`gnews.provider.js`)**: Periodic fetcher with automatic hash deduplication and deterministic ticker tagging (`RELIANCE`, `TCS`, `HDFCBANK`, etc.).
4. **Google Gemini (`gemini.provider.js`)**: Real educational LLM integration using model fallback chains (`gemini-flash-latest`, `gemini-3.5-flash`, etc.). Gemini **never** calculates financial numbers directly; it receives pre-calculated risk metrics as authoritative grounding facts.

---

## 6. Testing

Run all unit and integration tests:

```bash
npm test
```

Test coverage includes:
- JWT registration and login validation
- Market data normalization and ticker search
- Order review risk scoring and rule violations (blocking vs warnings)
- Order matching engine and atomic portfolio/funds updates
- What-If historical return and drawdown calculations
- Gemini AI context construction and fallback resilience
