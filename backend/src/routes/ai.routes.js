import { Router } from 'express';
import { aiService } from '../services/ai/aiService.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { asyncHandler, ok } from '../utils/index.js';

const router = Router();

router.post('/chat', optionalAuth, asyncHandler(async (req, res) => {
  const result = await aiService.chat(req.user?.id || 'anon', req.body);
  ok(res, result);
}));

router.post('/order-explanation', requireAuth, asyncHandler(async (req, res) => {
  const result = await aiService.explainOrder(req.user.id, req.body);
  ok(res, result);
}));

router.post('/news-explanation', asyncHandler(async (req, res) => {
  const result = await aiService.explainNews(req.body.newsId || req.body);
  ok(res, result);
}));

router.post('/stock-explanation', asyncHandler(async (req, res) => {
  const result = await aiService.explainStock(req.body.symbol);
  ok(res, result);
}));

router.post('/portfolio-explanation', requireAuth, asyncHandler(async (req, res) => {
  const result = await aiService.explainPortfolio(req.user.id);
  ok(res, result);
}));

export default router;
