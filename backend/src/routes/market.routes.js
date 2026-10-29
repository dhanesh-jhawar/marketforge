import { Router } from 'express';
import { marketService } from '../services/market/marketService.js';
import { asyncHandler, ok } from '../utils/index.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const universe = await marketService.getUniverse();
  ok(res, universe);
}));

router.get('/status', asyncHandler(async (req, res) => {
  const status = await marketService.getMarketStatus();
  ok(res, status);
}));

router.get('/movers', asyncHandler(async (req, res) => {
  const movers = await marketService.getMovers({ limit: Number(req.query.limit) || 10 });
  ok(res, movers);
}));

router.get('/indices', asyncHandler(async (req, res) => {
  const indices = await marketService.getIndices();
  ok(res, indices);
}));

router.get('/search', asyncHandler(async (req, res) => {
  const results = await marketService.search(req.query.q, Number(req.query.limit) || 20);
  ok(res, results);
}));

router.get('/heatmap', asyncHandler(async (req, res) => {
  const heatmap = await marketService.getHeatmap();
  ok(res, heatmap);
}));

export default router;
