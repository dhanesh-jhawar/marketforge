import { getProviders } from '../../providers/index.js';
import { marketService } from '../market/marketService.js';
import { createLogger } from '../../utils/logger.js';

const log = createLogger('realtime');

class RealtimeService {
  constructor() {
    this.interestCounts = new Map(); // symbol -> count
    this.running = false;
  }

  async start() {
    if (this.running) return;
    try {
      const providers = getProviders();
      providers.realtime.onTick((quote) => {
        marketService.onTick(quote);
      });
      await providers.realtime.connect();
      this.running = true;
      log.info('Realtime service connected');
    } catch (e) {
      log.warn(`Realtime service start deferred: ${e.message}`);
    }
  }

  async addInterest(symbols) {
    const toSub = [];
    const providers = getProviders();
    for (const sym of symbols) {
      const current = this.interestCounts.get(sym) || 0;
      this.interestCounts.set(sym, current + 1);
      if (current === 0) {
        toSub.push({ symbol: sym });
      }
    }
    if (toSub.length > 0 && this.running) {
      await providers.realtime.subscribe(toSub);
    }
  }

  async removeInterest(symbols) {
    const toUnsub = [];
    const providers = getProviders();
    for (const sym of symbols) {
      const current = this.interestCounts.get(sym) || 0;
      if (current <= 1) {
        this.interestCounts.delete(sym);
        toUnsub.push(sym);
      } else {
        this.interestCounts.set(sym, current - 1);
      }
    }
    if (toUnsub.length > 0 && this.running) {
      await providers.realtime.unsubscribe(toUnsub);
    }
  }
}

export const realtimeService = new RealtimeService();
