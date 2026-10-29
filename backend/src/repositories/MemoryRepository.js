import { Repository, pkOf } from './Repository.js';
import { uuid, nowIso } from '../utils/index.js';

const matches = (row, where = {}) =>
  Object.entries(where).every(([k, v]) => (Array.isArray(v) ? v.includes(row[k]) : row[k] === v));

/** In-memory implementation for development and tests. */
export class MemoryRepository extends Repository {
  constructor(def) {
    super(def);
    this.rows = new Map();
  }
  #key(idOrRow) {
    return typeof idOrRow === 'object' && idOrRow !== null ? pkOf(this.pk, idOrRow) : idOrRow;
  }
  async findById(id) { return structuredClone(this.rows.get(this.#key(id)) ?? null); }
  async findOne(where) {
    for (const r of this.rows.values()) if (matches(r, where)) return structuredClone(r);
    return null;
  }
  async findMany(where = {}, { limit, offset = 0, orderBy, desc = false } = {}) {
    let out = [...this.rows.values()].filter((r) => matches(r, where));
    if (orderBy) out.sort((a, b) => (a[orderBy] > b[orderBy] ? 1 : a[orderBy] < b[orderBy] ? -1 : 0) * (desc ? -1 : 1));
    out = out.slice(offset, limit != null ? offset + limit : undefined);
    return structuredClone(out);
  }
  async count(where = {}) { return [...this.rows.values()].filter((r) => matches(r, where)).length; }
  async insert(row) {
    const r = { ...row };
    if (!Array.isArray(this.pk) && r[this.pk] == null) r[this.pk] = uuid();
    r.createdAt ??= nowIso();
    const k = pkOf(this.pk, r);
    if (this.rows.has(k)) throw new Error(`${this.name}: duplicate key ${k}`);
    this.rows.set(k, r);
    return structuredClone(r);
  }
  async insertMany(rows) { for (const r of rows) await this.insert(r); return rows.length; }
  async update(id, patch) {
    const k = this.#key(id);
    const cur = this.rows.get(k);
    if (!cur) return null;
    const next = { ...cur, ...patch, updatedAt: nowIso() };
    this.rows.set(k, next);
    return structuredClone(next);
  }
  async upsert(row) {
    const r = { ...row };
    if (!Array.isArray(this.pk) && r[this.pk] == null) r[this.pk] = uuid();
    const k = pkOf(this.pk, r);
    const next = { ...(this.rows.get(k) ?? { createdAt: nowIso() }), ...r, updatedAt: nowIso() };
    this.rows.set(k, next);
    return structuredClone(next);
  }
  async upsertMany(rows) { for (const r of rows) await this.upsert(r); return rows.length; }
  async delete(id) { return this.rows.delete(this.#key(id)); }
  async search(q, fields, { limit = 20, where = {} } = {}) {
    const needle = String(q || '').toLowerCase();
    if (!needle) return [];
    const scored = [];
    for (const r of this.rows.values()) {
      if (!matches(r, where)) continue;
      let best = Infinity;
      for (const f of fields) {
        const v = String(r[f] ?? '').toLowerCase();
        if (v === needle) best = Math.min(best, 0);
        else if (v.startsWith(needle)) best = Math.min(best, 1);
        else if (v.includes(needle)) best = Math.min(best, 2);
      }
      if (best < Infinity) scored.push([best, r]);
    }
    return structuredClone(scored.sort((a, b) => a[0] - b[0]).slice(0, limit).map(([, r]) => r));
  }
}
