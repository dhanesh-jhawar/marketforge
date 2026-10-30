# MARKETFORGE

> **MarketForge** is a next-generation Indian stock-market learning, financial education, and virtual trading simulation platform.

---

> [!IMPORTANT]
> **MarketForge is NOT a real-money brokerage.**
> Every trade is virtual. Every user begins with **₹1,00,000 in simulated learning capital**.
> It is an educational sandbox, risk-management lab, historical replay simulator, and structured curriculum designed to build disciplined trading habits.

---

## 🌟 Key Architecture & Feature Highlights

1. **Complete Virtual Trading Environment & Realistic Matching Engine:**
   - Simulated execution of **Cash & Carry (CNC)** and **Margin Intraday Square-off (MIS)** orders.
   - Live order book simulation with Price-Time Priority and First-Come-First-Serve matching against synthetic depth.
   - Comprehensive Order Intelligence pre-trade deterministic risk assessment before any order is submitted.

2. **Market Replay Engine (`/replay`):**
   - Interactive historical replay system allowing users to select any NSE company and historical date range.
   - Candlesticks reveal progressively as time advances, with configurable playback speed (0.25x to 50x) and draggable timeline scrubbing.
   - Computes deterministic analytics: maximum drawdown, annualized volatility, best/worst day, consecutive session streaks, and recovery times.
   - **"Why Did It Move?" (Rise/Fall Analysis)**: Attributes price movement to verifiable bullish/bearish drivers (earnings, sector momentum, capex, macro events) without inventing facts.
   - Seamless scenario testing: launch What-If simulations directly from replayed candles.

3. **Financial News Terminal (`/news`) with Contextual Imagery:**
   - Real-time exchange news wire enriched with high-resolution contextual imagery via the backend Unsplash image provider.
   - SQLite-cached image metadata to eliminate redundant external API requests.
   - High-contrast MarketForge financial fallback graphics for articles without source images.
   - Live stock movement badges with LTP & daily change %, linking directly to stock detail and replay engines.
   - **4-Pillar AI News Breakdown**: Explains What Happened, Why It Matters, Possible Market Mechanism, and What to Watch.

4. **Zero Direct Frontend Third-Party Connections:**
   - The frontend communicates **exclusively** with the MarketForge backend.
   - The backend normalizes external providers (TejHQ, Twelve Data, GNews, NewsAPI, NSE, Gemini) through resilient fallback chains.

5. **AI Never Calculates Risk Numbers (Deterministic Rule Enforcement):**
   - Pure, deterministic JavaScript engines calculate order values, margin requirements, position percentages, sector concentrations, 30-day volatility, potential losses at -5% / -10%, and SEBI rule violations.
   - Google Gemini only receives pre-computed facts and explains them in pedagogical language.

6. **Full NSE Security Master Universe:**
   - Supports 2,000+ active equities listed on the National Stock Exchange of India (NSE) synchronized from official exchange records.

7. **Rich Motion & Financial Aesthetics:**
   - Next.js 14 App Router with obsidian glassmorphism, glowing neon-green accents, and Highcharts Stock implementation.
   - React Bits components: `GradientASCII` digital horizon, `CrystalizedBall` 3D orb, `CircularCarousel` capabilities cylinder, and `TextType` dynamic typing.

---

## 📁 Project Structure

```
marketforge/
├── frontend/             # Next.js 14 App Router full frontend
│   ├── app/              # App Router routes (trade, markets, learn, replay, what-if, ai, admin...)
│   ├── components/       # Highcharts Stock, trading modals, navigation, AI terminal
│   ├── components/react-bits/ # GradientASCII, CrystalizedBall, CircularCarousel, TextType
│   ├── context/          # AuthContext, MarketContext, AIContext, PortfolioContext
│   ├── hooks/            # useMarketData, usePortfolio, useOrders, useScrollAnimation
│   ├── lib/              # apiClient, wsClient, replayApi, newsApi, formatters
│   └── styles/           # variables.css, globals.css, charts.css, react-bits-overrides.css
│
├── backend/              # Node.js Express + WebSocket backend service
│   ├── src/
│   │   ├── server.js     # Express + WS server mounting all 18 route groups
│   │   ├── engines/      # Pure deterministic engines (risk, matching, portfolio, learning)
│   │   ├── providers/    # Fallback chains (tejhq, twelvedata, gnews, newsapi, gemini, nse, mock, images)
│   │   ├── services/     # Domain services (auth, market, historical, replay, risk, order, portfolio, news, ai)
│   │   ├── routes/       # 18 REST API route modules (including /api/replay, /api/news, /api/trade)
│   │   ├── repositories/ # SQLite Repository implementation with node:sqlite WAL mode
│   │   └── websocket/    # Canonical WebSocket server & in-process domain event bus
│   └── tests/            # Test suites
│
├── shared/               # Shared contracts package (@marketforge/shared)
│   ├── types/            # Normalized types (market, stock, order, portfolio, news, learning, user)
│   └── constants/        # WebSocket event names, market hours, risk defaults, order enums
│
├── database/             # SQLite database persistence
│   ├── migrations/       # Schema definitions (users, orders, holdings, news, replay, quizzes)
│   └── seeds/            # Reference data, sample NSE universe, educational curriculum
│
└── scripts/              # Migration, seeding, and verification utilities
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (tested on Node.js 20 & 24)
- npm or pnpm

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/dhanesh-jhawar/marketforge.git
cd marketforge
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure default keys are configured for development:
```env
PORT=4000
DATA_STORE=sqlite
SQLITE_PATH=database/marketforge.db
GEMINI_API_KEY=<your-gemini-key>
TWELVE_DATA_API_KEY=<your-twelve-data-key>
GNEWS_API_KEY=<your-gnews-key>
```

### 3. Initialize Database
```bash
npm run db:migrate
npm run db:seed
```

### 4. Run Development Servers
Start both backend (port 4000) and frontend (port 3000):
```bash
# Terminal 1: Backend
npm run dev --workspace backend

# Terminal 2: Frontend
npm run dev --workspace frontend
```

Access the application:
- **Frontend App**: `http://localhost:3000`
- **Replay Engine**: `http://localhost:3000/replay`
- **News Terminal**: `http://localhost:3000/news`
- **Backend API & Health**: `http://localhost:4000/api/health`
- **WebSocket Feed**: `ws://localhost:4000/ws`

---

## 🧪 Testing & Build Verification

Run production build:
```bash
npm run build --workspace frontend
```

Run test suite:
```bash
npm test --workspace backend
```

---

## 📜 License
This project is for educational and learning purposes. MarketForge is not a registered investment advisor or financial intermediary. All market orders, capital, and risk metrics are completely virtual.
