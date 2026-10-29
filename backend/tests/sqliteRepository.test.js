import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { SqliteRepository } from '../src/repositories/SqliteRepository.js';

test('SqliteRepository - CRUD, transactions, and JSON serialization', async () => {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE test_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      name TEXT,
      metadata TEXT NOT NULL DEFAULT '{}',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT
    );
  `);

  const repo = new SqliteRepository({ name: 'users', table: 'test_users', pk: 'id' }, db);

  // 1. Insert with object serialization
  const created = await repo.insert({
    id: 'usr-1',
    email: 'trader@marketforge.dev',
    name: 'Arjun Trader',
    metadata: { cohort: '2026-Q1', experience: 'intermediate' },
    isActive: true,
  });

  assert.equal(created.id, 'usr-1');
  assert.equal(created.email, 'trader@marketforge.dev');
  assert.equal(created.metadata.cohort, '2026-Q1');
  assert.equal(created.isActive, 1);

  // 2. findById
  const found = await repo.findById('usr-1');
  assert.ok(found);
  assert.equal(found.name, 'Arjun Trader');
  assert.deepEqual(found.metadata, { cohort: '2026-Q1', experience: 'intermediate' });

  // 3. update
  const updated = await repo.update('usr-1', { name: 'Arjun Sharma' });
  assert.equal(updated.name, 'Arjun Sharma');
  assert.ok(updated.updatedAt);

  // 4. search
  const results = await repo.search('Sharma', ['name', 'email']);
  assert.equal(results.length, 1);
  assert.equal(results[0].id, 'usr-1');

  // 5. upsert
  const upserted = await repo.upsert({
    id: 'usr-1',
    email: 'arjun.sharma@marketforge.dev',
  });
  assert.equal(upserted.id, 'usr-1');
  assert.equal(upserted.email, 'arjun.sharma@marketforge.dev');

  // 6. insertMany within transaction
  await repo.insertMany([
    { id: 'usr-2', email: 'user2@marketforge.dev', name: 'User 2' },
    { id: 'usr-3', email: 'user3@marketforge.dev', name: 'User 3' },
  ]);
  const total = await repo.count();
  assert.equal(total, 3);

  // 7. delete
  const deleted = await repo.delete('usr-2');
  assert.equal(deleted, true);
  assert.equal(await repo.count(), 2);
});
