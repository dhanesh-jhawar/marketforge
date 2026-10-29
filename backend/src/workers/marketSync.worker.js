import { repos } from '../repositories/index.js';
import { marketService } from '../services/market/marketService.js';
import { createLogger } from '../utils/logger.js';
import { nowIso } from '../utils/index.js';

const log = createLogger('worker:market');

export async function runMarketSync() {
  try {
    const universe = await repos.stocks.findMany({ isActive: true });
    // Update top active / large sample
    const sample = universe.slice(0, 50);
    const quotes = await Promise.all(
      sample.map((s) => marketService.getQuote(s.symbol).catch(() => null))
    );

    const valid = quotes.filter(Boolean);
    for (const q of valid) {
      await repos.stockPrices.upsert(q);
    }

    const indices = await marketService.getIndices().catch(() => []);
    for (const idx of indices) {
      await repos.indices.upsert(idx);
    }

    log.debug(`Market sync cycle complete: ${valid.length} quotes updated`);
  } catch (err) {
    log.error('Market sync error', { error: err.message });
  }
}

export function startMarketSyncWorker(intervalMs = 5000) {
  const timer = setInterval(runMarketSync, intervalMs);
  log.info(`Market sync worker scheduled every ${intervalMs}ms`);
  return () => clearInterval(timer);
}
