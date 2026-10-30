import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = path.resolve('database/marketforge.db');
console.log('Migrating database at:', dbPath);

if (!fs.existsSync(dbPath)) {
  console.log('Database does not exist at path, skipping direct migration.');
  process.exit(0);
}

const db = new DatabaseSync(dbPath);

// 1. Extend news table
const newsCols = db.prepare('PRAGMA table_info(news)').all().map(c => c.name);
const addCol = (col, type) => {
  if (!newsCols.includes(col)) {
    console.log(`Adding column ${col} to news...`);
    db.exec(`ALTER TABLE news ADD COLUMN ${col} ${type};`);
  }
};

addCol('image_thumbnail_url', 'TEXT');
addCol('image_provider', 'TEXT');
addCol('image_author', 'TEXT');
addCol('image_author_url', 'TEXT');
addCol('symbols', 'TEXT');
addCol('sectors', 'TEXT');
addCol('headline', 'TEXT');
addCol('description', 'TEXT');

// 2. Create replay_sessions table
db.exec(`
CREATE TABLE IF NOT EXISTS replay_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  symbol TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  speed REAL DEFAULT 1.0,
  created_at TEXT DEFAULT (datetime('now'))
);
`);

// 3. Create replay_events table
db.exec(`
CREATE TABLE IF NOT EXISTS replay_events (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  source TEXT,
  source_url TEXT,
  price_before REAL,
  price_after REAL,
  price_change_percent REAL,
  created_at TEXT DEFAULT (datetime('now'))
);
`);

console.log('Database schema extended successfully.');

