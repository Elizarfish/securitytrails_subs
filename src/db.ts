import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'studio.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

export const db = new Database(dbPath);

// Initialize schema
const init = () => {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS studios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      hourly_rate_cents INTEGER NOT NULL DEFAULT 5000
    );

    CREATE TABLE IF NOT EXISTS slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studio_id INTEGER NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      UNIQUE (studio_id, start_time, end_time)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studio_id INTEGER NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
      slot_id INTEGER NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      status TEXT NOT NULL DEFAULT 'confirmed'
    );
  `);

  const count = db.prepare('SELECT COUNT(*) as c FROM studios').get() as any;
  if (count.c === 0) {
    const insertStudio = db.prepare(`INSERT INTO studios (name, description, hourly_rate_cents) VALUES (?, ?, ?)`);
    insertStudio.run('Белая студия', 'Светлая минималистичная локация', 6000);
    insertStudio.run('Лофт студия', 'Темная кирпичная локация', 7000);

    const studios = db.prepare('SELECT id FROM studios').all() as any[];
    const insertSlot = db.prepare(`INSERT OR IGNORE INTO slots (studio_id, start_time, end_time) VALUES (?, ?, ?)`);

    // Seed slots for next 7 days, 10:00-18:00 each hour
    const now = new Date();
    for (let d = 0; d < 7; d++) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
      for (let h = 10; h < 18; h++) {
        const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, 0, 0);
        const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h + 1, 0, 0);
        const startIso = start.toISOString();
        const endIso = end.toISOString();
        for (const s of studios) {
          insertSlot.run(s.id, startIso, endIso);
        }
      }
    }
  }
};

init();
