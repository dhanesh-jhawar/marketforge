import { Router } from 'express';
import { portfolioService } from '../services/portfolio/portfolioService.js';
import { marketService } from '../services/market/marketService.js';
import { learningService } from '../services/learning/learningService.js';
import { newsService } from '../services/news/newsService.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, ok } from '../utils/index.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const [summary, allocation, risk, indices, status, recommendedLessons, news] = await Promise.all([
    portfolioService.getSummary(userId),
    portfolioService.getAllocation(userId),
    portfolioService.getRiskMetrics(userId),
    marketService.getIndices(),
    marketService.getMarketStatus(),
    learningService.getRecommendedLessons(userId),
    newsService.getLatest({ limit: 5 }),
  ]);

  ok(res, {
    portfolio: summary,
    allocation,
    risk,
    market: { indices, status },
    learning: { recommendedLessons },
    news,
  });
}));

export default router;
