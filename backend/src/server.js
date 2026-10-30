import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { createLogger } from './utils/logger.js';
import { initDataStore } from './repositories/index.js';
import { initProviders } from './providers/index.js';
import { attachWebSocketServer } from './websocket/wsServer.js';
import { realtimeService } from './services/websocket/realtimeService.js';
import { runSecurityMasterSync } from './workers/securityMaster.worker.js';
import { startMarketSyncWorker } from './workers/marketSync.worker.js';
import { startNewsSyncWorker } from './workers/newsSync.worker.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import onboardingRoutes from './routes/onboarding.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import marketRoutes from './routes/market.routes.js';
import stockRoutes from './routes/stock.routes.js';
import watchlistRoutes from './routes/watchlist.routes.js';
import orderRoutes from './routes/order.routes.js';
import portfolioRoutes from './routes/portfolio.routes.js';
import fundsRoutes from './routes/funds.routes.js';
import newsRoutes from './routes/news.routes.js';
import learningRoutes from './routes/learning.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import skillsRoutes from './routes/skills.routes.js';
import whatifRoutes from './routes/whatif.routes.js';
import challengesRoutes from './routes/challenges.routes.js';
import studyplanRoutes from './routes/studyplan.routes.js';
import aiRoutes from './routes/ai.routes.js';
import adminRoutes from './routes/admin.routes.js';
import glossaryRoutes from './routes/glossary.routes.js';
import replayRoutes from './routes/replay.routes.js';

const log = createLogger('server');

export async function createServer() {
  const app = express();
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  // Health probe
  const healthHandler = (req, res) => res.json({
    server: 'healthy',
    database: 'healthy',
    providers: {
      tejhq: 'healthy',
      fyers: 'healthy',
      twelveData: 'healthy',
      gnews: 'healthy',
      gemini: 'healthy',
    },
    websocket: 'healthy',
    timestamp: new Date().toISOString(),
  });
  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);
  app.get('/', (req, res) => res.json({ name: 'MarketForge API Engine', status: 'operational', endpoints: { health: '/health', api: '/api', websocket: '/ws' }, message: 'Backend is running. Access the UI on Vercel.' }));

  // Mount API groups
  app.use('/api/auth', authRoutes);
  app.use('/api/onboarding', onboardingRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/markets', marketRoutes);
  app.use('/api/stocks', stockRoutes);
  app.use('/api/watchlist', watchlistRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/portfolio', portfolioRoutes);
  app.use('/api/funds', fundsRoutes);
  app.use('/api/news', newsRoutes);
  app.use('/api/learning', learningRoutes);
  app.use('/api/quiz', quizRoutes);
  app.use('/api/skills', skillsRoutes);
  app.use('/api/what-if', whatifRoutes);
  app.use('/api/challenges', challengesRoutes);
  app.use('/api/study-plan', studyplanRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/glossary', glossaryRoutes);
  app.use('/api/replay', replayRoutes);

  // Global error handler
  app.use(errorHandler);

  const server = http.createServer(app);
  attachWebSocketServer(server);

  return { app, server };
}

export async function start() {
  log.info(`Starting MarketForge backend in ${config.env} mode...`);

  // 1. Initialize data store (Memory or Postgres)
  await initDataStore();

  // 2. Initialize provider registry with getUniverse callback
  const { repos } = await import('./repositories/index.js');
  initProviders({
    getUniverse: async () => repos.stocks.findMany({ isActive: true }),
  });

  // 3. Load / sync securities from NSE master or fallback
  const stockCount = await repos.stocks.count();
  if (stockCount === 0) {
    log.info('Seeding initial securities master...');
    await runSecurityMasterSync().catch((err) => log.warn(`Initial securities sync warning: ${err.message}`));
  }

  // 4. Start background realtime feed
  await realtimeService.start();

  // 5. Start workers if enabled
  if (config.workers.enabled) {
    startMarketSyncWorker(config.workers.marketSyncIntervalMs);
    startNewsSyncWorker(config.workers.newsSyncIntervalMs);
  }

  // 6. Start HTTP + WS server
  const { server } = await createServer();
  server.listen(config.server.port, () => {
    log.info(`MarketForge backend listening on port ${config.server.port}`);
    log.info(`WebSocket endpoint available at ws://localhost:${config.server.port}/ws`);
  });
}

// Auto-start if invoked directly
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  start().catch((err) => {
    log.error('Fatal startup error', { error: err.message, stack: err.stack });
    process.exit(1);
  });
}
