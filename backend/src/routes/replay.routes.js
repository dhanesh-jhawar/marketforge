import { Router } from 'express';
import { replayService } from '../services/replay/replayService.js';
import { asyncHandler, ok } from '../utils/index.js';

const router = Router();

router.get('/stocks/:symbol', asyncHandler(async (req, res) => {
  const meta = await replayService.getStockMeta(req.params.symbol);
  ok(res, meta);
}));

router.get('/history/:symbol', asyncHandler(async (req, res) => {
  const { from, to, interval } = req.query;
  const history = await replayService.getHistory(req.params.symbol, { from, to, interval });
  ok(res, history);
}));

router.get('/events/:symbol', asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const events = await replayService.getEvents(req.params.symbol, { from, to });
  ok(res, events);
}));

router.post('/analyze', asyncHandler(async (req, res) => {
  const analysis = await replayService.analyze(req.body);
  ok(res, analysis);
}));

router.get('/summary/:symbol', asyncHandler(async (req, res) => {
  const summary = await replayService.analyze({ symbol: req.params.symbol });
  ok(res, summary);
}));

router.post('/ai-explanation', asyncHandler(async (req, res) => {
  const explanation = await replayService.getAiExplanation(req.body);
  ok(res, explanation);
}));

export default router;

