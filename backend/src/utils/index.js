/** Wrap async route handlers so rejections reach the error middleware. */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** Standard success envelope: { ok: true, data, meta? } */
export const ok = (res, data, meta) => res.json(meta ? { ok: true, data, meta } : { ok: true, data });
export const created = (res, data) => res.status(201).json({ ok: true, data });

/** Simple in-process TTL cache. Swap for Redis behind the same interface in production. */
export class TTLCache {
  constructor(defaultTtlMs = 5000, maxEntries = 5000) {
    this.ttl = defaultTtlMs;
    this.max = maxEntries;
    this.map = new Map();
  }
  get(key) {
    const hit = this.map.get(key);
    if (!hit) return undefined;
    if (hit.exp < Date.now()) { this.map.delete(key); return undefined; }
    return hit.value;
  }
  set(key, value, ttlMs = this.ttl) {
    if (this.map.size >= this.max) this.map.delete(this.map.keys().next().value);
    this.map.set(key, { value, exp: Date.now() + ttlMs });
    return value;
  }
  async wrap(key, ttlMs, fn) {
    const v = this.get(key);
    if (v !== undefined) return v;
    return this.set(key, await fn(), ttlMs);
  }
  delete(key) { this.map.delete(key); }
  clear() { this.map.clear(); }
}

export const round = (n, d = 2) => (Number.isFinite(n) ? Math.round(n * 10 ** d) / 10 ** d : 0);
export const sum = (arr, fn = (x) => x) => arr.reduce((a, x) => a + fn(x), 0);
export const nowIso = () => new Date().toISOString();
export const uuid = () => crypto.randomUUID();

/** Deterministic PRNG (mulberry32) seeded from a string — used by mock providers. */
export function seededRandom(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) { h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Minimal RFC4180-ish CSV parser (handles quoted fields). */
export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((f) => f !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header = [], ...data] = rows;
  const keys = header.map((h) => h.trim());
  return data.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? '').trim()])));
}

/** fetch with timeout + JSON parsing, used by every provider. */
export async function httpJson(url, { timeoutMs = 10000, ...opts } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    const text = await res.text();
    const body = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status} from ${new URL(url).host}`);
      err.status = res.status; err.body = body;
      throw err;
    }
    return body;
  } finally {
    clearTimeout(t);
  }
}
