const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');
const dayjs = require('dayjs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, '..', 'data', 'studio.sqlite');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// DB init
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS studios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  hourly_price INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studio_id INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD
  start_time TEXT NOT NULL, -- HH:mm
  end_time TEXT NOT NULL,   -- HH:mm
  created_at TEXT NOT NULL,
  UNIQUE(studio_id, date, start_time, end_time),
  FOREIGN KEY(studio_id) REFERENCES studios(id)
);
`);

// Seed a couple studios if empty
const studioCount = db.prepare('SELECT COUNT(*) as c FROM studios').get().c;
if (studioCount === 0) {
  const insert = db.prepare('INSERT INTO studios (name, description, hourly_price) VALUES (?, ?, ?)');
  insert.run('Студия А', 'Светлая студия с большими окнами', 1500);
  insert.run('Студия Б', 'Темная студия с циклорамой', 2000);
}

// Helpers
function listStudios() {
  return db.prepare('SELECT * FROM studios ORDER BY id').all();
}

function findConflicts(studioId, date, startTime, endTime) {
  return db.prepare(
    `SELECT * FROM bookings
     WHERE studio_id = ? AND date = ?
       AND NOT( end_time <= ? OR start_time >= ? )`
  ).all(studioId, date, startTime, endTime);
}

// Routes
app.get('/', (req, res) => {
  const studios = listStudios();
  const today = dayjs().format('YYYY-MM-DD');
  res.render('index', { studios, selectedDate: today });
});

app.get('/studio/:id', (req, res) => {
  const studioId = Number(req.params.id);
  const studio = db.prepare('SELECT * FROM studios WHERE id = ?').get(studioId);
  if (!studio) return res.status(404).send('Студия не найдена');
  const date = req.query.date || dayjs().format('YYYY-MM-DD');
  const bookings = db.prepare('SELECT * FROM bookings WHERE studio_id = ? AND date = ? ORDER BY start_time')
    .all(studioId, date);
  res.render('studio', { studio, date, bookings });
});

app.post('/bookings', (req, res) => {
  const { studio_id, customer_name, customer_phone, date, start_time, end_time } = req.body;

  if (!studio_id || !customer_name || !customer_phone || !date || !start_time || !end_time) {
    return res.status(400).send('Пожалуйста, заполните все поля');
  }

  // Basic validation
  if (end_time <= start_time) {
    return res.status(400).send('Время окончания должно быть позже начала');
  }

  const conflicts = findConflicts(Number(studio_id), date, start_time, end_time);
  if (conflicts.length > 0) {
    return res.status(409).send('Этот интервал уже занят');
  }

  const insert = db.prepare(`INSERT INTO bookings
    (studio_id, customer_name, customer_phone, date, start_time, end_time, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const createdAt = dayjs().toISOString();
  const info = insert.run(Number(studio_id), customer_name, customer_phone, date, start_time, end_time, createdAt);
  res.redirect(`/confirm/${info.lastInsertRowid}`);
});

app.get('/confirm/:id', (req, res) => {
  const id = Number(req.params.id);
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  if (!booking) return res.status(404).send('Бронирование не найдено');
  const studio = db.prepare('SELECT * FROM studios WHERE id = ?').get(booking.studio_id);
  res.render('confirm', { booking, studio });
});

app.get('/admin', (req, res) => {
  const date = req.query.date || dayjs().format('YYYY-MM-DD');
  const bookings = db.prepare(
    `SELECT b.*, s.name as studio_name FROM bookings b
     JOIN studios s ON s.id = b.studio_id
     WHERE b.date = ?
     ORDER BY s.id, b.start_time`
  ).all(date);
  res.render('admin', { date, bookings });
});

app.listen(PORT, () => {
  console.log(`Photo studio booking app running at http://localhost:${PORT}`);
});
