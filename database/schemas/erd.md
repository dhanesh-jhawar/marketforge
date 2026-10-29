# Entity Relationship Overview

```mermaid
erDiagram
  roles ||--o{ users : has
  users ||--|| onboarding : completes
  users ||--o{ user_skills : tracks
  users ||--o{ sessions : opens
  users ||--o{ watchlists : owns
  users ||--|| portfolios : owns
  users ||--|| funds : has
  users ||--o{ transactions : ledger
  users ||--o{ orders : places
  orders ||--o{ order_events : emits
  orders ||--o{ trades : fills
  portfolios ||--o{ holdings : contains
  portfolios ||--o{ positions : contains
  portfolios ||--o{ portfolio_snapshots : history
  stocks ||--|| stock_prices : latest
  stocks ||--o{ historical_prices : candles
  stocks ||--o{ news_stocks : tagged
  news ||--o{ news_stocks : mentions
  lessons ||--o| quizzes : assesses
  quizzes ||--o{ questions : contains
  users ||--o{ quiz_results : takes
  users ||--o{ lesson_progress : progresses
  scenarios ||--o{ scenario_attempts : runs
  challenges ||--o{ challenge_progress : tracked
  users ||--o{ study_plans : follows
  study_plans ||--o{ study_tasks : contains
  users ||--o{ ai_conversations : chats
  ai_conversations ||--o{ ai_messages : contains
  users ||--o{ alerts : sets
  users ||--o{ audit_logs : acts
```

## Write paths (who mutates what)

| Table | Written by |
|---|---|
| stocks | `securityMaster.worker` only |
| stock_prices, indices, market_status | `marketSync.worker` / realtime service |
| historical_prices | historical service (cache-through from providers) |
| orders, order_events, trades | order service + matching engine |
| holdings, positions, funds, transactions | portfolio engine (in the same DB transaction as the trade) |
| user_skills, lesson_progress, quiz_results | learning engine |
| market_rules, market_config | admin service (+ audit_logs row) |
| news, news_stocks | `newsSync.worker` |
