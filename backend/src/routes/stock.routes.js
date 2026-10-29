import { Router } from 'express';
import { marketService } from '../services/market/marketService.js';
import { historicalService } from '../services/historical/historicalService.js';
import { newsService } from '../services/news/newsService.js';
import { asyncHandler, ok } from '../utils/index.js';

const router = Router();

router.get('/:symbol', asyncHandler(async (req, res) => {
  const security = await marketService.getSecurity(req.params.symbol);
  ok(res, security);
}));

router.get('/:symbol/quote', asyncHandler(async (req, res) => {
  const quote = await marketService.getQuote(req.params.symbol);
  ok(res, quote);
}));

router.get('/:symbol/history', asyncHandler(async (req, res) => {
  const { interval, range, from, to } = req.query;
  const history = await historicalService.getHistory(req.params.symbol, { interval, range, from, to });
  ok(res, history);
}));

router.get('/:symbol/news', asyncHandler(async (req, res) => {
  const news = await newsService.getLatest({ symbols: [req.params.symbol], limit: 20 });
  ok(res, news);
}));

router.get('/:symbol/orderbook', asyncHandler(async (req, res) => {
  const quote = await marketService.getQuote(req.params.symbol);
  const { generateSyntheticOrderBook } = await import('../engines/matchingEngine/index.js');
  const book = generateSyntheticOrderBook(quote.ltp, 5);
  ok(res, { symbol: req.params.symbol.toUpperCase(), ltp: quote.ltp, ...book });
}));

export default router;
