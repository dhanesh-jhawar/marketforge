import { Router } from 'express';
import { repos } from '../repositories/index.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, ok, created } from '../utils/index.js';
import { ApiError } from '../utils/ApiError.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  let watchlist = await repos.watchlists.findOne({ userId: req.user.id, isDefault: true });
  if (!watchlist) {
    watchlist = await repos.watchlists.insert({
      userId: req.user.id,
      name: 'My Watchlist',
      symbols: ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK'],
      isDefault: true,
    });
  }
  ok(res, watchlist);
}));

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const { symbol } = req.body;
  if (!symbol) throw ApiError.badRequest('Symbol is required');
  const sym = String(symbol).toUpperCase();

  let watchlist = await repos.watchlists.findOne({ userId: req.user.id, isDefault: true });
  const symbols = new Set(watchlist?.symbols || []);
  symbols.add(sym);

  const updated = await repos.watchlists.update(watchlist.id, { symbols: [...symbols] });
  ok(res, updated);
}));

router.delete('/:symbol', requireAuth, asyncHandler(async (req, res) => {
  const sym = String(req.params.symbol).toUpperCase();
  const watchlist = await repos.watchlists.findOne({ userId: req.user.id, isDefault: true });
  if (!watchlist) throw ApiError.notFound('Watchlist not found');

  const filtered = (watchlist.symbols || []).filter((s) => s !== sym);
  const updated = await repos.watchlists.update(watchlist.id, { symbols: filtered });
  ok(res, updated);
}));

export default router;
