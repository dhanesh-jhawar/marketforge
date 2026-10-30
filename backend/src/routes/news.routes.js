import { Router } from 'express';
import { newsService } from '../services/news/newsService.js';
import { aiService } from '../services/ai/aiService.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, ok } from '../utils/index.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const articles = await newsService.getLatest({
    limit: Number(req.query.limit) || 20,
    symbols: req.query.symbols ? req.query.symbols.split(',') : undefined,
    query: req.query.q || req.query.query,
    filter: req.query.filter,
    sector: req.query.sector,
  });
  ok(res, articles);
}));

router.get('/holdings', requireAuth, asyncHandler(async (req, res) => {
  const articles = await newsService.getForHoldings(req.user.id);
  ok(res, articles);
}));

router.get('/watchlist', requireAuth, asyncHandler(async (req, res) => {
  const articles = await newsService.getForWatchlist(req.user.id);
  ok(res, articles);
}));

router.get('/search', asyncHandler(async (req, res) => {
  const articles = await newsService.search(req.query.q, Number(req.query.limit) || 20);
  ok(res, articles);
}));

router.post('/explain', asyncHandler(async (req, res) => {
  const result = await aiService.explainNews(req.body);
  ok(res, result);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const article = await newsService.getById(req.params.id);
  ok(res, article);
}));

router.post('/:id/explain', asyncHandler(async (req, res) => {
  const result = await aiService.explainNews(req.params.id);
  ok(res, result);
}));

export default router;
