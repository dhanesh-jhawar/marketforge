import fs from 'node:fs/promises';
import { SecurityMasterProvider } from '../base/interfaces.js';
import { createSecurity } from '@marketforge/shared/types';
import { parseCsv } from '../../utils/index.js';
import { createLogger } from '../../utils/logger.js';

const log = createLogger('provider:nse');

/**
 * NSE security master.
 * - EQUITY_L.csv: every listed equity (symbol, name, series, ISIN, face value, listing date)
 * - Sector/industry is NOT in EQUITY_L. Enrich from NSE index constituent lists
 *   (e.g. ind_niftytotalmarket_list.csv has an "Industry" column).
 *
 * NSE blocks some automated requests; we send browser-like headers and fall
 * back to the local CSV in database/seeds when the download fails.
 */
const NSE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
  Accept: 'text/csv,text/plain,*/*',
  Referer: 'https://www.nseindia.com/',
};
const SECTOR_LIST_URL = 'https://nsearchives.nseindia.com/content/indices/ind_niftytotalmarket_list.csv';

const parseNseDate = (s) => {
  const d = s ? new Date(s.replace(/-/g, ' ')) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : null;
};

export function normalizeNseRow(r, sectorMap = new Map()) {
  const symbol = r.SYMBOL;
  return createSecurity({
    symbol,
    name: r['NAME OF COMPANY'],
    series: r.SERIES || r[' SERIES'] || 'EQ',
    isin: r['ISIN NUMBER'] || r[' ISIN NUMBER'] || null,
    faceValue: r['FACE VALUE'] || r[' FACE VALUE'] || null,
    lotSize: r['MARKET LOT'] || r[' MARKET LOT'] || 1,
    listingDate: parseNseDate(r['DATE OF LISTING'] || r[' DATE OF LISTING']),
    sector: r.SECTOR || sectorMap.get(symbol) || null,
    instrumentType: 'EQUITY',
  });
}

async function fetchText(url) {
  const res = await fetch(url, { headers: NSE_HEADERS, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`NSE HTTP ${res.status}`);
  return res.text();
}

export class NseSecurityMasterProvider extends SecurityMasterProvider {
  constructor(cfg) { super('nse', cfg); }

  async fetchAll({ allowRemote = true } = {}) {
    let csv = null, source = 'remote';
    if (allowRemote) {
      try { csv = await fetchText(this.cfg.equityListUrl); }
      catch (e) { log.warn(`NSE download failed (${e.message}); using local fallback`); }
    }
    if (!csv) { csv = await fs.readFile(this.cfg.fallbackFile, 'utf8'); source = 'fallback'; }

    let sectorMap = new Map();
    if (source === 'remote') {
      try {
        const rows = parseCsv(await fetchText(SECTOR_LIST_URL));
        sectorMap = new Map(rows.map((r) => [r.Symbol, r.Industry]));
      } catch (e) { log.warn(`Sector enrichment failed: ${e.message}`); }
    }

    const securities = parseCsv(csv)
      .map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k.trim(), v])))
      .filter((r) => r.SYMBOL)
      .map((r) => normalizeNseRow(r, sectorMap));
    log.info(`Loaded ${securities.length} securities from ${source}`);
    return { securities, source };
  }
}
