import { Repository, toSnake, toCamel } from './Repository.js';

const rowToCamel = (row) => (row ? Object.fromEntries(Object.entries(row).map(([k, v]) => [toCamel(k), v])) : null);

/**
 * Generic PostgreSQL implementation (works with Supabase connection strings).
 * Complex queries (aggregations, joins) belong in dedicated query modules,
 * not here — keep this generic.
 */
export class PostgresRepository extends Repository {
  /** @param {object} def @param {import('pg').Pool} pool */
  constructor(def, pool) {
    super(def);
    this.pool = pool;
    this.pkCols = (Array.isArray(this.pk) ? this.pk : [this.pk]).map(toSnake);
  }

  #where(where = {}, startIdx = 1) {
    const clauses = [];
    const values = [];
    for (const [k, v] of Object.entries(where)) {
      if (Array.isArray(v)) { values.push(v); clauses.push(`${toSnake(k)} = ANY($${startIdx + values.length - 1})`); }
      else { values.push(v); clauses.push(`${toSnake(k)} = $${startIdx + values.length - 1}`); }
    }
    return { sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', values };
  }
  #pkWhere(id, startIdx = 1) {
    const ids = Array.isArray(this.pk) ? (typeof id === 'object' ? this.pk.map((k) => id[k]) : String(id).split('|')) : [typeof id === 'object' ? id[this.pk] : id];
    return { sql: this.pkCols.map((c, i) => `${c} = $${startIdx + i}`).join(' AND '), values: ids };
  }

  async findById(id) {
    const w = this.#pkWhere(id);
    const { rows } = await this.pool.query(`SELECT * FROM ${this.table} WHERE ${w.sql} LIMIT 1`, w.values);
    return rowToCamel(rows[0]);
  }
  async findOne(where) { return (await this.findMany(where, { limit: 1 }))[0] ?? null; }
  async findMany(where = {}, { limit, offset, orderBy, desc } = {}) {
    const w = this.#where(where);
    let sql = `SELECT * FROM ${this.table} ${w.sql}`;
    if (orderBy) sql += ` ORDER BY ${toSnake(orderBy)} ${desc ? 'DESC' : 'ASC'}`;
    if (limit != null) sql += ` LIMIT ${Number(limit)}`;
    if (offset) sql += ` OFFSET ${Number(offset)}`;
    const { rows } = await this.pool.query(sql, w.values);
    return rows.map(rowToCamel);
  }
  async count(where = {}) {
    const w = this.#where(where);
    const { rows } = await this.pool.query(`SELECT COUNT(*)::int AS n FROM ${this.table} ${w.sql}`, w.values);
    return rows[0].n;
  }
  async insert(row) {
    const cols = Object.keys(row);
    const sql = `INSERT INTO ${this.table} (${cols.map(toSnake).join(',')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`;
    const { rows } = await this.pool.query(sql, cols.map((c) => serialize(row[c])));
    return rowToCamel(rows[0]);
  }
  async insertMany(rows) { for (const r of rows) await this.insert(r); return rows.length; }
  async update(id, patch) {
    const cols = Object.keys(patch);
    if (!cols.length) return this.findById(id);
    const w = this.#pkWhere(id, cols.length + 1);
    const sql = `UPDATE ${this.table} SET ${cols.map((c, i) => `${toSnake(c)} = $${i + 1}`).join(', ')} WHERE ${w.sql} RETURNING *`;
    const { rows } = await this.pool.query(sql, [...cols.map((c) => serialize(patch[c])), ...w.values]);
    return rowToCamel(rows[0]);
  }
  async upsert(row) {
    const cols = Object.keys(row);
    const updates = cols.filter((c) => !this.pkCols.includes(toSnake(c))).map((c) => `${toSnake(c)} = EXCLUDED.${toSnake(c)}`);
    const sql = `INSERT INTO ${this.table} (${cols.map(toSnake).join(',')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(',')})
      ON CONFLICT (${this.pkCols.join(',')}) DO ${updates.length ? `UPDATE SET ${updates.join(', ')}` : 'NOTHING'} RETURNING *`;
    const { rows } = await this.pool.query(sql, cols.map((c) => serialize(row[c])));
    return rowToCamel(rows[0]);
  }
  async upsertMany(rows) { for (const r of rows) await this.upsert(r); return rows.length; }
  async delete(id) {
    const w = this.#pkWhere(id);
    const { rowCount } = await this.pool.query(`DELETE FROM ${this.table} WHERE ${w.sql}`, w.values);
    return rowCount > 0;
  }
  async search(q, fields, { limit = 20 } = {}) {
    const cond = fields.map((f) => `${toSnake(f)} ILIKE $1`).join(' OR ');
    const { rows } = await this.pool.query(`SELECT * FROM ${this.table} WHERE ${cond} LIMIT ${Number(limit)}`, [`%${q}%`]);
    return rows.map(rowToCamel);
  }
}

const serialize = (v) => (v !== null && typeof v === 'object' && !(v instanceof Date) && !Array.isArray(v) ? JSON.stringify(v) : v);
