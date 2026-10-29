import { Repository, toSnake, toCamel } from './Repository.js';
import { uuid, nowIso } from '../utils/index.js';

const deserializeVal = (v) => {
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return v;
      }
    }
  }
  return v;
};

const rowToCamel = (row) => {
  if (!row) return null;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    out[toCamel(k)] = deserializeVal(v);
  }
  return out;
};

const serializeVal = (v) => {
  if (v === undefined) return null;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v !== null && typeof v === 'object' && !(v instanceof Date)) {
    return JSON.stringify(v);
  }
  return v;
};

/**
 * High-performance SQLite Repository backed by Node.js native `node:sqlite` (DatabaseSync).
 * Dynamically queries table schema to filter known columns, handle auto-increment,
 * and provide rock-solid persistence.
 */
export class SqliteRepository extends Repository {
  /**
   * @param {object} def { name, table, pk }
   * @param {import('node:sqlite').DatabaseSync} db
   */
  constructor(def, db) {
    super(def);
    this.db = db;
    this.pkCols = (Array.isArray(this.pk) ? this.pk : [this.pk]).map(toSnake);
    this._columnsCache = null;
  }

  get columns() {
    if (!this._columnsCache) {
      try {
        const rows = this.db.prepare(`PRAGMA table_info(${this.table})`).all();
        this._columnsCache = new Map(rows.map((r) => [r.name, r]));
      } catch {
        this._columnsCache = new Map();
      }
    }
    return this._columnsCache;
  }

  #where(where = {}) {
    const clauses = [];
    const values = [];
    for (const [k, v] of Object.entries(where)) {
      if (v === undefined) continue;
      const col = toSnake(k);
      if (this.columns.size && !this.columns.has(col)) continue;

      if (Array.isArray(v)) {
        if (v.length === 0) {
          clauses.push('1 = 0');
        } else {
          clauses.push(`${col} IN (${v.map(() => '?').join(', ')})`);
          for (const item of v) values.push(serializeVal(item));
        }
      } else if (v === null) {
        clauses.push(`${col} IS NULL`);
      } else {
        clauses.push(`${col} = ?`);
        values.push(serializeVal(v));
      }
    }
    return {
      sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
      values,
    };
  }

  #pkWhere(id) {
    const ids = Array.isArray(this.pk)
      ? typeof id === 'object' && id !== null
        ? this.pk.map((k) => id[k])
        : String(id).split('|')
      : [typeof id === 'object' && id !== null ? id[this.pk] : id];

    return {
      sql: this.pkCols.map((c) => `${c} = ?`).join(' AND '),
      values: ids.map(serializeVal),
    };
  }

  async findById(id) {
    const w = this.#pkWhere(id);
    const sql = `SELECT * FROM ${this.table} WHERE ${w.sql} LIMIT 1`;
    const stmt = this.db.prepare(sql);
    const row = stmt.get(...w.values);
    return rowToCamel(row);
  }

  async findOne(where) {
    const rows = await this.findMany(where, { limit: 1 });
    return rows[0] ?? null;
  }

  async findMany(where = {}, { limit, offset, orderBy, desc } = {}) {
    const w = this.#where(where);
    let sql = `SELECT * FROM ${this.table} ${w.sql}`;
    if (orderBy) {
      const orderCol = toSnake(orderBy);
      if (!this.columns.size || this.columns.has(orderCol)) {
        sql += ` ORDER BY ${orderCol} ${desc ? 'DESC' : 'ASC'}`;
      }
    }
    if (limit != null) {
      sql += ` LIMIT ${Number(limit)}`;
    }
    if (offset != null) {
      sql += ` OFFSET ${Number(offset)}`;
    }
    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...w.values);
    return rows.map(rowToCamel);
  }

  async count(where = {}) {
    const w = this.#where(where);
    const sql = `SELECT COUNT(*) AS count FROM ${this.table} ${w.sql}`;
    const stmt = this.db.prepare(sql);
    const row = stmt.get(...w.values);
    return row ? Number(row.count) : 0;
  }

  async insert(row) {
    const r = { ...row };
    const pkName = Array.isArray(this.pk) ? null : this.pk;
    const pkColInfo = pkName ? this.columns.get(toSnake(pkName)) : null;

    // Only assign UUID if primary key is text / not auto-incrementing integer
    if (pkName && (r[pkName] == null || r[pkName] === '')) {
      if (!pkColInfo || pkColInfo.type !== 'INTEGER') {
        r[pkName] = uuid();
      }
    }

    if (this.columns.has('created_at')) {
      r.createdAt ??= nowIso();
    }

    // Filter to only columns that actually exist in the SQLite table
    const validKeys = Object.keys(r).filter((k) => {
      const col = toSnake(k);
      return !this.columns.size || this.columns.has(col);
    });

    const cols = validKeys.map(toSnake);
    const placeholders = validKeys.map(() => '?').join(', ');
    const values = validKeys.map((k) => serializeVal(r[k]));

    const sql = `INSERT INTO ${this.table} (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const stmt = this.db.prepare(sql);
    const inserted = stmt.get(...values);
    return rowToCamel(inserted);
  }

  async insertMany(rows) {
    if (!rows || rows.length === 0) return 0;
    this.db.exec('BEGIN IMMEDIATE');
    try {
      for (const row of rows) {
        await this.insert(row);
      }
      this.db.exec('COMMIT');
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
    return rows.length;
  }

  async update(id, patch) {
    const p = { ...patch };
    if (this.columns.has('updated_at')) {
      p.updatedAt = nowIso();
    }

    const validKeys = Object.keys(p).filter((k) => {
      const col = toSnake(k);
      return !this.columns.size || this.columns.has(col);
    });
    if (!validKeys.length) return this.findById(id);

    const w = this.#pkWhere(id);
    const setClause = validKeys.map((k) => `${toSnake(k)} = ?`).join(', ');
    const values = [...validKeys.map((k) => serializeVal(p[k])), ...w.values];

    const sql = `UPDATE ${this.table} SET ${setClause} WHERE ${w.sql} RETURNING *`;
    const stmt = this.db.prepare(sql);
    const updated = stmt.get(...values);
    return rowToCamel(updated);
  }

  async upsert(row) {
    const r = { ...row };
    const pkName = Array.isArray(this.pk) ? null : this.pk;
    const pkColInfo = pkName ? this.columns.get(toSnake(pkName)) : null;

    if (pkName && (r[pkName] == null || r[pkName] === '')) {
      if (!pkColInfo || pkColInfo.type !== 'INTEGER') {
        r[pkName] = uuid();
      }
    }

    if (this.columns.has('created_at')) {
      r.createdAt ??= nowIso();
    }
    if (this.columns.has('updated_at')) {
      r.updatedAt ??= nowIso();
    }

    const validKeys = Object.keys(r).filter((k) => {
      const col = toSnake(k);
      return !this.columns.size || this.columns.has(col);
    });

    const cols = validKeys.map(toSnake);
    const placeholders = validKeys.map(() => '?').join(', ');
    const values = validKeys.map((k) => serializeVal(r[k]));

    const updateCols = cols.filter((c) => !this.pkCols.includes(c));
    const onConflict = updateCols.length
      ? `DO UPDATE SET ${updateCols.map((c) => `${c} = excluded.${c}`).join(', ')}`
      : 'DO NOTHING';

    const sql = `INSERT INTO ${this.table} (${cols.join(', ')}) VALUES (${placeholders})
      ON CONFLICT (${this.pkCols.join(', ')}) ${onConflict} RETURNING *`;

    const stmt = this.db.prepare(sql);
    const res = stmt.get(...values);
    return rowToCamel(res) || rowToCamel(r);
  }

  async upsertMany(rows) {
    if (!rows || rows.length === 0) return 0;
    this.db.exec('BEGIN IMMEDIATE');
    try {
      for (const row of rows) {
        await this.upsert(row);
      }
      this.db.exec('COMMIT');
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
    return rows.length;
  }

  async delete(id) {
    const w = this.#pkWhere(id);
    const sql = `DELETE FROM ${this.table} WHERE ${w.sql}`;
    const stmt = this.db.prepare(sql);
    const res = stmt.run(...w.values);
    return res.changes > 0;
  }

  async search(q, fields, { limit = 20, where = {} } = {}) {
    const needle = String(q || '').trim();
    if (!needle) return [];

    const w = this.#where(where);
    const validFields = fields.filter((f) => !this.columns.size || this.columns.has(toSnake(f)));
    if (!validFields.length) return [];

    const searchClauses = validFields.map((f) => `${toSnake(f)} LIKE ?`).join(' OR ');
    const combinedWhere = w.sql
      ? `${w.sql} AND (${searchClauses})`
      : `WHERE (${searchClauses})`;

    const searchValues = validFields.map(() => `%${needle}%`);
    const allValues = [...w.values, ...searchValues];

    const sql = `SELECT * FROM ${this.table} ${combinedWhere} LIMIT ${Number(limit)}`;
    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...allValues);
    return rows.map(rowToCamel);
  }
}
