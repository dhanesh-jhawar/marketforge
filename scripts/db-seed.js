import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedsDir = path.resolve(__dirname, '../database/seeds');
const defaultDbPath = path.resolve(__dirname, '../database/marketforge.db');

async function seed() {
  const store = process.env.DATA_STORE || 'sqlite';
  const sqlitePath = process.env.SQLITE_PATH || defaultDbPath;
  const pgUrl = process.env.DATABASE_URL;

  console.log(`Seeding database with reference and curriculum data (Target: ${store})...`);
  const sqlFiles = (await fs.readdir(seedsDir)).filter((f) => f.endsWith('.sql')).sort();

  if (store === 'postgres' && pgUrl) {
    const { default: pg } = await import('pg');
    const pool = new pg.Pool({ connectionString: pgUrl });
    for (const file of sqlFiles) {
      console.log(`Executing ${file} via PostgreSQL...`);
      const sql = await fs.readFile(path.join(seedsDir, file), 'utf8');
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

    for (const file of sqlFiles) {
      console.log(`Executing ${file} on SQLite (${sqlitePath})...`);
      const sql = await fs.readFile(path.join(seedsDir, file), 'utf8');
      db.exec(sql);
    }

    // Populate content.json into SQLite
    const contentFile = path.join(seedsDir, 'content.json');
    try {
      const content = JSON.parse(await fs.readFile(contentFile, 'utf8'));

      if (content.lessons && content.lessons.length > 0) {
        const stmt = db.prepare(`
          INSERT INTO lessons (id, slug, title, summary, skill_area, difficulty, estimated_minutes, blocks, prerequisites, order_index, published)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            summary = excluded.summary,
            blocks = excluded.blocks
        `);
        for (let i = 0; i < content.lessons.length; i++) {
          const l = content.lessons[i];
          stmt.run(
            l.id,
            l.slug || l.id,
            l.title,
            l.summary || '',
            l.skillArea || 'market_basics',
            l.difficulty || 1,
            l.estimatedMinutes || 5,
            JSON.stringify(l.blocks || []),
            JSON.stringify(l.prerequisites || []),
            l.orderIndex ?? i,
            l.published ? 1 : 0
          );
        }
      }

      if (content.quizzes && content.quizzes.length > 0) {
        const stmtQuiz = db.prepare(`
          INSERT INTO quizzes (id, lesson_id, title, pass_pct)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET title = excluded.title
        `);
        const stmtQuestion = db.prepare(`
          INSERT INTO questions (id, quiz_id, prompt, type, options, answer, explanation, skill_area, order_index)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET prompt = excluded.prompt
        `);

        for (const q of content.quizzes) {
          stmtQuiz.run(q.id, q.lessonId ?? null, q.title, q.passPct ?? 60);
          if (q.questions && Array.isArray(q.questions)) {
            for (let i = 0; i < q.questions.length; i++) {
              const quest = q.questions[i];
              stmtQuestion.run(
                quest.id,
                q.id,
                quest.prompt,
                quest.type || 'single',
                JSON.stringify(quest.options || []),
                JSON.stringify(quest.answer ?? 0),
                quest.explanation || '',
                quest.skillArea || 'market_basics',
                i
              );
            }
          }
        }
      }

      if (content.glossary && content.glossary.length > 0) {
        const stmt = db.prepare(`
          INSERT INTO glossary (id, term, definition, example, category, related)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET definition = excluded.definition
        `);
        for (const g of content.glossary) {
          stmt.run(g.id, g.term, g.definition, g.example ?? null, g.category ?? 'basics', JSON.stringify(g.related || []));
        }
      }

      if (content.scenarios && content.scenarios.length > 0) {
        const stmt = db.prepare(`
          INSERT INTO scenarios (id, title, description, symbol, benchmark, start_date, end_date, event_context, params, published)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET description = excluded.description
        `);
        for (const s of content.scenarios) {
          stmt.run(
            s.id,
            s.title,
            s.description || '',
            s.symbol ?? null,
            s.benchmark || 'NIFTY50',
            s.startDate,
            s.endDate,
            s.eventContext || null,
            JSON.stringify(s.params || {}),
            1
          );
        }
      }

      if (content.challenges && content.challenges.length > 0) {
        const stmt = db.prepare(`
          INSERT INTO challenges (id, title, description, type, criteria, reward_xp, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET description = excluded.description
        `);
        for (const c of content.challenges) {
          stmt.run(
            c.id,
            c.title,
            c.description || '',
            c.type || 'GENERAL',
            JSON.stringify(c.criteria || {}),
            c.rewardXp ?? 100,
            1
          );
        }
      }

      if (content.onboardingQuestions) {
        const stmt = db.prepare(`
          INSERT INTO market_config (key, value, description)
          VALUES (?, ?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `);
        stmt.run('onboardingQuestions', JSON.stringify(content.onboardingQuestions), 'Interactive onboarding questionnaire');
      }

      // Seed demo user and admin account if not present
      const bcrypt = (await import('bcryptjs')).default;
      const demoHash = await bcrypt.hash('Trader@123', 10);
      const adminHash = await bcrypt.hash('Admin@123', 10);

      const userStmt = db.prepare(`
        INSERT INTO users (id, email, password_hash, display_name, role_id, experience_level, onboarding_complete, xp, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(email) DO NOTHING
      `);
      userStmt.run('demo-user-id', 'trader@marketforge.dev', demoHash, 'Market Pioneer', 1, 'INTERMEDIATE', 1, 450);
      userStmt.run('admin-user-id', 'admin@marketforge.dev', adminHash, 'Admin Operator', 3, 'ADVANCED', 1, 1000);

      // Seed initial funds for demo user
      const fundsStmt = db.prepare(`
        INSERT INTO funds (user_id, total_capital, available_cash, blocked_margin, realized_pnl, currency)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO NOTHING
      `);
      fundsStmt.run('demo-user-id', 100000, 21958.5, 0, 0, 'INR');
      fundsStmt.run('admin-user-id', 1000000, 1000000, 0, 0, 'INR');

      // Seed portfolio for demo user
      const portStmt = db.prepare(`
        INSERT INTO portfolios (id, user_id, name, initial_capital)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id) DO NOTHING
      `);
      portStmt.run('demo-portfolio-id', 'demo-user-id', 'Primary Portfolio', 100000);

      // Seed sample holdings for demo user
      const holdingsStmt = db.prepare(`
        INSERT INTO holdings (portfolio_id, symbol, quantity, avg_price)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(portfolio_id, symbol) DO NOTHING
      `);
      holdingsStmt.run('demo-portfolio-id', 'RELIANCE', 15, 2680.0);
      holdingsStmt.run('demo-portfolio-id', 'INFY', 20, 1820.0);

      // Seed default watchlist for demo user
      const wlStmt = db.prepare(`
        INSERT INTO watchlists (user_id, name, symbols, is_default)
        VALUES (?, ?, ?, 1)
      `);
      try {
        wlStmt.run('demo-user-id', 'Primary Watchlist', JSON.stringify(['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK']));
      } catch {}

      console.log('Educational curriculum content, demo user, and initial holdings seeded.');
    } catch (err) {
      console.warn('Notice: Could not parse or seed content.json:', err.message);
    }

    db.close();
  }

  console.log('Seeding complete.');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
