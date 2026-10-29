import { Router } from 'express';
import { portfolioService } from '../services/portfolio/portfolioService.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, ok } from '../utils/index.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const funds = await portfolioService.getFunds(req.user.id);
  ok(res, funds);
}));

router.get('/transactions', requireAuth, asyncHandler(async (req, res) => {
  const txs = await portfolioService.getTransactions(req.user.id, Number(req.query.limit) || 50);
  ok(res, txs);
}));

export default router;
