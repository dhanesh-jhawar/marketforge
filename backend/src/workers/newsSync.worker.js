import { newsService } from '../services/news/newsService.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('worker:news');

export async function runNewsSync() {
  try {
    const articles = await newsService.getLatest({ limit: 30 });
    log.info(`News sync cycle complete: ${articles.length} articles updated`);
  } catch (err) {
    log.error('News sync error', { error: err.message });
  }
}

export function startNewsSyncWorker(intervalMs = 600000) {
  const timer = setInterval(runNewsSync, intervalMs);
  log.info(`News sync worker scheduled every ${intervalMs}ms`);
  return () => clearInterval(timer);
}
