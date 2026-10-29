import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '../database/migrations');
const defaultDbPath = path.resolve(__dirname, '../database/marketforge.db');

async function migrate() {
  const store = process.env.DATA_STORE || 'sqlite';
  const sqlitePath = process.env.SQLITE_PATH || defaultDbPath;
  const pgUrl = process.env.DATABASE_URL;

  console.log(`Running database migrations (Target store: ${store})...`);
  const files = (await fs.readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort();

  if (store === 'postgres' && pgUrl) {
    const { default: pg } = await import('pg');
    const pool = new pg.Pool({ connectionString: pgUrl });
    for (const file of files) {
      console.log(`Applying ${file} via PostgreSQL...`);
      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
      await pool.query(sql);
    }
    await pool.end();
  } else {
    // Default to native SQLite
    const { DatabaseSync } = await import('node:sqlite');
    const dbDir = path.dirname(sqlitePath);
    await fs.mkdir(dbDir, { recursive: true });

    const db = new DatabaseSync(sqlitePath);
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec('PRAGMA journal_mode = WAL;');

    for (const file of files) {
      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
      if (sql.includes('DO $$') || file.includes('rls')) {
        console.log(`Skipping PostgreSQL-specific migration ${file} for SQLite.`);
        continue;
      }
      console.log(`Applying ${file} to SQLite (${sqlitePath})...`);
      db.exec(sql);
    }
    db.close();
  }

  console.log('All migrations applied successfully.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
