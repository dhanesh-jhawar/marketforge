# MARKETFORGE

> **MarketForge** is a next-generation Indian stock-market learning, financial education, and virtual trading simulation platform.

---

> [!IMPORTANT]
> **MarketForge is NOT a real-money brokerage.**
> It is a virtual trading sandbox, learning curriculum, and scenario simulator designed to build disciplined trading habits.

---

## 🌟 Key Architecture Highlights

1. **Zero Direct Frontend Third-Party Connections:**
   The frontend communicates **exclusively** with the MarketForge backend. The backend normalizes external providers (TejHQ, FYERS, Twelve Data, GNews, NewsAPI, NSE, Gemini) into a unified internal data model.
2. **AI Never Calculates Risk Numbers (Rule 9):**
   Pure, deterministic JavaScript/TypeScript engines calculate order values, margin requirements, position percentages, sector concentrations, 30-day volatility, potential losses at -5% / -10%, and SEBI rule violations. Google Gemini only receives pre-computed facts and explains them in pedagogical language.
3. **Full NSE Security Master Universe:**
   The application is not limited to a few hardcoded stocks. It synchronizes the complete universe of equities listed on the National Stock Exchange of India (NSE) directly from `EQUITY_L.csv`.
4. **Rich Aesthetics & Advanced Motion:**
   Next.js 14 App Router, Highcharts Stock professional charts, Three.js 3D hero visualization (`CrystalizedBall`), animated ASCII streams (`GradientASCII`), `CircularCarousel`, `TextType`, Lenis smooth scrolling, and dark obsidian glassmorphism.

---

## 📁 Project Structure

```
marketforge/
├── frontend/             # Next.js 14 App Router full frontend
│   ├── app/              # 18 App Router pages (trade, markets, learn, what-if, ai, admin...)
│   ├── components/       # UI, Navigation, Highcharts Stock, Landing
│   ├── components/react-bits/ # GradientASCII, CrystalizedBall, CircularCarousel, TextType
│   ├── context/          # AuthContext, MarketContext, AIContext, AppContext
│   ├── hooks/            # useMarketData, usePortfolio, useOrders, useScrollAnimation
│   ├── lib/              # apiClient, wsClient, formatters
│   ├── styles/           # variables.css, globals.css, charts.css, animations.css
│   └── data/demo/        # Seeded fixtures for offline development
│
├── backend/              # Node.js Express + WebSocket backend service
│   ├── src/
│   │   ├── server.js     # Express + WS server mounting all 16 route groups
│   │   ├── engines/      # Pure deterministic engines (risk, matching, portfolio, learning, what-if)
│   │   ├── providers/    # Provider fallback chains (tejhq, fyers, twelvedata, gnews, newsapi, gemini, nse, mock)
│   │   ├── services/     # Domain services (auth, market, historical, risk, order, portfolio, ai, admin...)
│   │   ├── routes/       # 16 REST API route modules
│   │   ├── repositories/ # Swappable Repository pattern (Memory & Postgres implementations)
│   │   ├── websocket/    # Canonical WebSocket server & in-process domain event bus
│   │   └── workers/      # Security master sync, market poll, news sync
│   └── tests/            # Deterministic engine unit tests
│
├── shared/               # Shared contracts package (@marketforge/shared)
│   ├── types/            # Normalized types (market, stock, order, portfolio, news, learning, user)
│   └── constants/        # WebSocket event names, market hours, risk defaults, order enums
│
├── database/             # PostgreSQL / Supabase persistence
│   ├── migrations/       # 001_initial_schema.sql, 002_rls_policies.sql
│   ├── seeds/            # Reference data, sample NSE universe CSV, demo content
│   └── schemas/          # ERD and database documentation
│
├── docs/                 # architecture.md, api.md
├── scripts/              # Migration, seeding, security sync, and environment check scripts
├── .env.example          # Environment template
└── docker-compose.yml    # Full local stack (Postgres, backend, frontend)
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js >= 20
- npm >= 10

### 2. Environment Setup
```bash
# Check or create default .env
node scripts/check-env.js
```

### 3. Install Dependencies
```bash
# Install shared and backend dependencies
npm install --workspace shared
npm install --workspace backend
npm install --workspace frontend
```

### 4. Run Tests
Validate that the deterministic engines run with mathematical precision:
```bash
npm run test
```

### 5. Start Development
```bash
# Run backend (port 4000)
npm run dev:backend

# In a separate terminal, run frontend (port 3000)
npm run dev:frontend
```
Visit [http://localhost:3000](http://localhost:3000) to open the MarketForge cockpit.

---

## 🐳 Docker Deployment
To run with PostgreSQL:
```bash
docker compose up -d
```
All database migrations apply automatically on the first boot.
