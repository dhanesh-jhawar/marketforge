/**
 * Repository contract. Every service accesses persistence ONLY through this
 * interface, so the backing store (memory | postgres | supabase) is swappable.
 *
 * `where` is a plain equality object: { userId: 'x', status: 'OPEN' }.
 * Array values mean IN (...): { status: ['OPEN', 'PARTIALLY_FILLED'] }.
 * Field names are camelCase; implementations map to snake_case columns.
 *
 * @interface
 */
export class Repository {
  /** @param {{name:string, table:string, pk:string|string[]}} def */
  constructor(def) {
    this.name = def.name;
    this.table = def.table;
    this.pk = def.pk;
  }
  /** @returns {Promise<object|null>} */ async findById(id) { throw new Error('not implemented'); }
  /** @returns {Promise<object|null>} */ async findOne(where) { throw new Error('not implemented'); }
  /**
   * @param {object} [where]
   * @param {{limit?:number, offset?:number, orderBy?:string, desc?:boolean}} [opts]
   * @returns {Promise<object[]>}
   */
  async findMany(where, opts) { throw new Error('not implemented'); }
  /** @returns {Promise<number>} */ async count(where) { throw new Error('not implemented'); }
  /** @returns {Promise<object>} */ async insert(row) { throw new Error('not implemented'); }
  /** @returns {Promise<number>} */ async insertMany(rows) { throw new Error('not implemented'); }
  /** @returns {Promise<object|null>} */ async update(id, patch) { throw new Error('not implemented'); }
  /** Insert or replace by primary key. @returns {Promise<object>} */ async upsert(row) { throw new Error('not implemented'); }
  /** @returns {Promise<number>} */ async upsertMany(rows) { throw new Error('not implemented'); }
  /** @returns {Promise<boolean>} */ async delete(id) { throw new Error('not implemented'); }
  /** Text search over given fields. @returns {Promise<object[]>} */ async search(q, fields, opts) { throw new Error('not implemented'); }
}

export const pkOf = (pk, row) => (Array.isArray(pk) ? pk.map((k) => row[k]).join('|') : row[pk]);
export const toSnake = (s) => s.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
export const toCamel = (s) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
