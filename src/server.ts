import express from 'express';
import morgan from 'morgan';
import path from 'path';
import dayjs from 'dayjs';
import { db } from './db';

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(morgan('dev'));

// Helpers
function formatMoney(cents: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(cents / 100);
}

app.locals.formatMoney = formatMoney;
app.locals.dayjs = dayjs;

app.get('/', (req, res) => {
  const studios = db.prepare('SELECT * FROM studios').all();
  res.render('index', { studios });
});

app.get('/studio/:id', (req, res) => {
  const studioId = Number(req.params.id);
  const studio = db.prepare('SELECT * FROM studios WHERE id = ?').get(studioId);
  if (!studio) return res.status(404).send('Студия не найдена');

  const start = req.query.start ? String(req.query.start) : dayjs().startOf('day').toISOString();
  const end = req.query.end ? String(req.query.end) : dayjs().add(7, 'day').endOf('day').toISOString();

  const slots = db.prepare(
    `SELECT slots.*, 
            EXISTS(SELECT 1 FROM bookings b WHERE b.slot_id = slots.id AND b.status = 'confirmed') AS booked
     FROM slots 
     WHERE studio_id = ? AND start_time >= ? AND end_time <= ?
     ORDER BY start_time`
  ).all(studioId, start, end);

  res.render('studio', { studio, slots, start, end });
});

app.post('/book', (req, res) => {
  const { studio_id, slot_id, customer_name, customer_email } = req.body as Record<string, string>;
  const studioId = Number(studio_id);
  const slotId = Number(slot_id);

  const slot = db.prepare('SELECT * FROM slots WHERE id = ? AND studio_id = ?').get(slotId, studioId);
  if (!slot) return res.status(400).send('Неверный слот');

  const already = db.prepare("SELECT 1 FROM bookings WHERE slot_id = ? AND status = 'confirmed'").get(slotId);
  if (already) return res.status(400).send('Слот уже забронирован');

  db.prepare('INSERT INTO bookings (studio_id, slot_id, customer_name, customer_email) VALUES (?, ?, ?, ?)')
    .run(studioId, slotId, customer_name, customer_email);

  res.redirect(`/success?slot=${slotId}`);
});

app.get('/success', (req, res) => {
  const slotId = Number(req.query.slot);
  const booking = db.prepare(
    `SELECT b.*, s.name as studio_name, sl.start_time, sl.end_time 
     FROM bookings b 
     JOIN studios s ON s.id = b.studio_id
     JOIN slots sl ON sl.id = b.slot_id
     WHERE b.slot_id = ?`
  ).get(slotId);

  if (!booking) return res.status(404).send('Бронирование не найдено');
  res.render('success', { booking });
});

// Minimal admin to list bookings
app.get('/admin/bookings', (req, res) => {
  const bookings = db.prepare(
    `SELECT b.*, s.name as studio_name, sl.start_time, sl.end_time 
     FROM bookings b 
     JOIN studios s ON s.id = b.studio_id
     JOIN slots sl ON sl.id = b.slot_id
     ORDER BY b.created_at DESC`
  ).all();
  res.render('admin_bookings', { bookings });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
