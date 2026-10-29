# MarketForge API Reference

Complete documentation of all HTTP REST endpoints and WebSocket channels for the MarketForge backend.

All endpoints adhere to the unified response contract:

**Success:**
```json
{
  "ok": true,
  "data": { ... }
}
```

**Failure:**
```json
{
  "ok": false,
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Insufficient virtual funds for this order."
  }
}
```

---

## 1. System & Health

### `GET /api/health`
Returns system component health status across server, database, WebSocket, and external providers.
- **Auth**: None
- **Response**:
```json
{
  "server": "healthy",
  "database": "healthy",
  "providers": {
    "tejhq": "healthy",
    "fyers": "healthy",
    "twelveData": "healthy",
    "gnews": "healthy",
    "gemini": "healthy"
  },
  "websocket": "healthy",
  "timestamp": "2026-10-29T18:56:47.452Z"
}
```

---

## 2. Authentication & Profile

### `POST /api/auth/register`
Register a new virtual trader with ₹1,00,000 initial capital.
- **Body**: `{ "email": "...", "password": "...", "displayName": "..." }`
- **Response**: `{ "user": { ... }, "token": "JWT_TOKEN" }`

### `POST /api/auth/login`
Authenticate with email and password.
- **Body**: `{ "email": "trader@marketforge.dev", "password": "Trader@123" }`
- **Response**: `{ "user": { ... }, "token": "JWT_TOKEN" }`

### `GET /api/auth/me`
Retrieve currently authenticated user profile and permissions.
- **Auth**: `Bearer <token>`

### `PUT /api/auth/profile`
Update user display name, avatar, or experience level.
- **Auth**: `Bearer <token>`
- **Body**: `{ "displayName": "...", "experienceLevel": "INTERMEDIATE" }`

---

## 3. Onboarding & Personalization

### `GET /api/onboarding/questions`
Retrieve the 3-question adaptive onboarding survey.
- **Auth**: None

### `POST /api/onboarding/submit`
Submit user responses to calculate user level and initialize the 5 core skills (diversification, riskSizing, orderTypes, stopLoss, chartReading).
- **Auth**: `Bearer <token>`
- **Body**: `{ "experience": "INTERMEDIATE", "goal": "SWING", "timeCommitment": "1_HOUR" }`

---

## 4. Markets & Equities

### `GET /api/markets`
Retrieve the entire listed universe of active NSE securities.
- **Auth**: None

### `GET /api/markets/status`
Retrieve current NSE exchange status (OPEN, CLOSED, PRE_OPEN) in IST (`Asia/Kolkata`).
- **Auth**: None

### `GET /api/markets/indices`
Retrieve major Indian indices (NIFTY 50, NIFTY BANK, NIFTY IT, SENSEX, etc.).
- **Auth**: None

### `GET /api/markets/movers?limit=10`
Retrieve top gainers, losers, and most active stocks.
- **Auth**: None

### `GET /api/markets/search?q=RELIANCE`
Instant fuzzy search across symbols and company names.
- **Auth**: None

### `GET /api/markets/heatmap`
Sectoral performance heatmap matrix.
- **Auth**: None

---

## 5. Stock Details & Quotes

### `GET /api/stocks/:symbol`
Retrieve security profile, sector, industry, and ISIN.
- **Auth**: None

### `GET /api/stocks/:symbol/quote`
Retrieve live normalized quote (LTP, open, high, low, close, change, changePct, volume).
- **Auth**: None

### `GET /api/stocks/:symbol/history?interval=1d&range=1y`
Retrieve historical OHLCV candles formatted for Highcharts Stock.
- **Auth**: None

### `GET /api/stocks/:symbol/news`
Retrieve latest news articles specifically mentioning this ticker.
- **Auth**: None

---

## 6. Watchlist

### `GET /api/watchlist`
Retrieve the user's active watchlist with live prices.
- **Auth**: `Bearer <token>`

### `POST /api/watchlist`
Add a ticker to the user's watchlist.
- **Auth**: `Bearer <token>`
- **Body**: `{ "symbol": "TCS" }`

### `DELETE /api/watchlist/:symbol`
Remove a ticker from the user's watchlist.
- **Auth**: `Bearer <token>`

---

## 7. Virtual Trading & Risk Engine

### `POST /api/orders/review`
**Mandatory step before order execution.**
Runs the 100% deterministic risk engine, assessing position concentration %, sector concentration %, potential loss at -5% and -10%, volatility, and compliance with trading rules.
- **Auth**: `Bearer <token>`
- **Body**:
```json
{
  "symbol": "RELIANCE",
  "side": "BUY",
  "orderType": "MARKET",
  "quantity": 10
}
```
- **Response**:
```json
{
  "ok": true,
  "data": {
    "order": { ... },
    "riskSnapshot": {
      "orderValue": 27420,
      "availableFunds": 100000,
      "fundsAfterOrder": 72559.23,
      "currentPositionPct": 0,
      "newPositionPct": 27.42,
      "sector": "Oil Gas & Consumable Fuels",
      "potentialLossAt5Pct": 1371,
      "potentialLossAt10Pct": 2742,
      "volatility30d": 21.4,
      "riskScore": 61,
      "riskLevel": "MODERATE",
      "violations": [],
      "canPlace": true
    }
  }
}
```

### `POST /api/orders`
Place the reviewed virtual order into the execution engine.
- **Auth**: `Bearer <token>`
- **Body**: Same payload as review.

### `GET /api/orders`
Retrieve historical orders and open limit orders.
- **Auth**: `Bearer <token>`
- **Query**: `?status=OPEN` or `?status=FILLED`

### `DELETE /api/orders/:id`
Cancel an unfilled pending limit order and release blocked funds.
- **Auth**: `Bearer <token>`

---

## 8. Portfolio & Virtual Funds

### `GET /api/portfolio`
Retrieve portfolio summary, available cash, total portfolio value, daily P&L, holdings, and sector allocation.
- **Auth**: `Bearer <token>`

### `GET /api/portfolio/holdings`
Retrieve detailed holdings breakdown with average buy price, LTP, invested value, current value, and unrealized P&L.
- **Auth**: `Bearer <token>`

### `GET /api/portfolio/performance`
Retrieve historical equity curve.
- **Auth**: `Bearer <token>`

### `GET /api/portfolio/allocation`
Retrieve allocation percentages grouped by symbol and by sector.
- **Auth**: `Bearer <token>`

### `GET /api/funds`
Retrieve available cash, blocked margin, and virtual grants.
- **Auth**: `Bearer <token>`

---

## 9. News & Market Intelligence

### `GET /api/news`
Retrieve deduplicated financial news with symbol tags.
- **Auth**: None
- **Query**: `?limit=20&symbol=RELIANCE`

---

## 10. Educational AI Mentorship (Google Gemini)

### `POST /api/ai/chat`
Contextual AI mentor chat. Accepts route context, portfolio summary, and weak skills.
- **Auth**: Optional / `Bearer <token>`
- **Body**: `{ "message": "Why should I diversify?", "context": { "route": "/trade" } }`

### `POST /api/ai/order-explanation`
Explains the deterministic risk calculations of an order draft without inventing or recomputing numbers.
- **Auth**: `Bearer <token>`
- **Body**: `{ "orderDraft": { ... }, "riskAnalysis": { ... } }`

### `POST /api/ai/stock-explanation`
Explains a company profile and sector characteristics.
- **Body**: `{ "symbol": "INFY" }`

---

## 11. Learning, Quizzes & What-If Simulations

### `GET /api/learning/lessons`
List all curriculum lessons with completion status.
- **Auth**: None

### `GET /api/quiz/:id`
Fetch quiz questions for a lesson.
- **Auth**: None

### `POST /api/quiz/:id/submit`
Submit answers, compute deterministic score, and adjust user skills (+10 XP).
- **Auth**: `Bearer <token>`
- **Body**: `{ "answers": [0, 2, 1] }`

### `GET /api/what-if/scenarios`
Retrieve curated historical scenarios (e.g., COVID Crash 2020, SIP vs Lump Sum).
- **Auth**: None

### `POST /api/what-if/run`
Run a custom backtest simulation against stored historical data.
- **Body**:
```json
{
  "symbol": "RELIANCE",
  "startDate": "2023-01-01",
  "endDate": "2023-12-31",
  "initialCapital": 100000
}
```

---

## 12. Admin Mission Control

All admin endpoints require `Bearer <token>` with `role = ADMIN` (`admin@marketforge.dev`).

- `GET /api/admin/users`: User directory, active roles, and capital balances.
- `GET /api/admin/rules`: Active deterministic risk rules (max position %, max order value, market hours).
- `PUT /api/admin/rules`: Update a risk limit with atomic audit logging.
- `GET /api/admin/challenges`: Manage gamified trading challenges.
- `GET /api/admin/content`: Educational lessons and quizzes.
- `GET /api/admin/analytics`: Platform telemetry (users, order volume, trade counts).
- `GET /api/admin/sync`: Provider synchronization logs and error counts.
- `GET /api/admin/audit-log`: Immutable security and administrative audit trail.
- `GET /api/admin/system-status`: Live latency, status, and health across TejHQ, FYERS, Twelve Data, GNews, Gemini, and NSE.

---

## 13. Realtime WebSocket (`ws://localhost:4000/ws`)

### Client Messages:
```json
// Authenticate
{ "action": "auth", "token": "JWT_TOKEN" }

// Subscribe to symbols
{ "action": "subscribe", "symbols": ["RELIANCE", "TCS", "INFY"] }

// Unsubscribe
{ "action": "unsubscribe", "symbols": ["RELIANCE"] }

// Ping
{ "action": "ping" }
```

### Server Events Emitted:
- `price:update`: Live quote ticks for subscribed symbols.
- `order:update`: Order status transition (`OPEN` -> `FILLED` -> `CANCELLED`).
- `trade:execution`: Trade fill notification.
- `portfolio:update`: Balance and holdings refresh.
- `news:new`: Live breaking news dispatch.
- `system:status`: Heartbeat and connection confirmation.
