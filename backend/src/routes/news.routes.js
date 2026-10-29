import { Router } from 'express';
import { newsService } from '../services/news/newsService.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, ok } from '../utils/index.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const articles = await newsService.getLatest({ limit: Number(req.query.limit) || 20 });
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

router.get('/:id', asyncHandler(async (req, res) => {
  const article = await newsService.getById(req.params.id);
  ok(res, article);
}));

export default router;
