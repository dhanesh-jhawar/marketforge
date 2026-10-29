import { Router } from 'express';
import { portfolioService } from '../services/portfolio/portfolioService.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, ok } from '../utils/index.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const summary = await portfolioService.getSummary(req.user.id);
  ok(res, summary);
}));

router.get('/holdings', requireAuth, asyncHandler(async (req, res) => {
  const holdings = await portfolioService.getHoldings(req.user.id);
  ok(res, holdings);
}));

router.get('/positions', requireAuth, asyncHandler(async (req, res) => {
  const positions = await portfolioService.getPositions(req.user.id);
  ok(res, positions);
}));

router.get('/performance', requireAuth, asyncHandler(async (req, res) => {
  const performance = await portfolioService.getPerformance(req.user.id);
  ok(res, performance);
}));

router.get('/allocation', requireAuth, asyncHandler(async (req, res) => {
  const allocation = await portfolioService.getAllocation(req.user.id);
  ok(res, allocation);
}));

router.get('/risk', requireAuth, asyncHandler(async (req, res) => {
  const risk = await portfolioService.getRiskMetrics(req.user.id);
  ok(res, risk);
}));

router.get('/history', requireAuth, asyncHandler(async (req, res) => {
  const txs = await portfolioService.getTransactions(req.user.id);
  ok(res, txs);
}));

export default router;
