import { runSecurityMasterSync } from '../backend/src/workers/securityMaster.worker.js';
import { initDataStore } from '../backend/src/repositories/index.js';
import { initProviders } from '../backend/src/providers/index.js';

async function main() {
  console.log('Synchronizing NSE Security Master...');
  await initDataStore();
  const { repos } = await import('../backend/src/repositories/index.js');
  initProviders({
    getUniverse: async () => repos.stocks.findMany({ isActive: true }),
  });

  const count = await runSecurityMasterSync();
  console.log(`Successfully synced ${count} securities.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Security master sync script error:', err);
  process.exit(1);
});
