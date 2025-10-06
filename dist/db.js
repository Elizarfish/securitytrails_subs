"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dataDir = path_1.default.join(process.cwd(), 'data');
const dbPath = path_1.default.join(dataDir, 'studio.db');
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir);
}
exports.db = new better_sqlite3_1.default(dbPath);
// Initialize schema
const init = () => {
    exports.db.exec(`
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
    const count = exports.db.prepare('SELECT COUNT(*) as c FROM studios').get();
    if (count.c === 0) {
        const insertStudio = exports.db.prepare(`INSERT INTO studios (name, description, hourly_rate_cents) VALUES (?, ?, ?)`);
        insertStudio.run('Белая студия', 'Светлая минималистичная локация', 6000);
        insertStudio.run('Лофт студия', 'Темная кирпичная локация', 7000);
        const studios = exports.db.prepare('SELECT id FROM studios').all();
        const insertSlot = exports.db.prepare(`INSERT OR IGNORE INTO slots (studio_id, start_time, end_time) VALUES (?, ?, ?)`);
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
