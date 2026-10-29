import { repos } from '../repositories/index.js';
import { getProviders } from '../providers/index.js';
import { createLogger } from '../utils/logger.js';
import { nowIso } from '../utils/index.js';

const log = createLogger('worker:securities');

export async function runSecurityMasterSync() {
  const providers = getProviders();
  const startTime = nowIso();
  let syncEventId;

  try {
    const ev = await repos.syncEvents.insert({
      job: 'securityMaster',
      provider: providers.securityMaster.id,
      status: 'STARTED',
      records: 0,
      startedAt: startTime,
    });
    syncEventId = ev.id;

    const { securities, source } = await providers.securityMaster.fetchAll();
    let count = 0;
    for (const sec of securities) {
      await repos.stocks.upsert({ ...sec, syncedAt: nowIso() });
      count++;
    }

    await repos.syncEvents.update(syncEventId, {
      status: 'SUCCESS',
      records: count,
      finishedAt: nowIso(),
      meta: { source, totalSecurities: count },
    });
    log.info(`Security master sync finished: ${count} stocks updated`);
    return count;
  } catch (err) {
    log.error('Security master sync failed', { error: err.message });
    if (syncEventId) {
      await repos.syncEvents.update(syncEventId, {
        status: 'FAILED',
        error: err.message,
        finishedAt: nowIso(),
      });
    }
    throw err;
  }
}
