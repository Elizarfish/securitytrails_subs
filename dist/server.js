"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const dayjs_1 = __importDefault(require("dayjs"));
const db_1 = require("./db");
const app = (0, express_1.default)();
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(process.cwd(), 'views'));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(process.cwd(), 'public')));
app.use((0, morgan_1.default)('dev'));
// Helpers
function formatMoney(cents) {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(cents / 100);
}
app.locals.formatMoney = formatMoney;
app.locals.dayjs = dayjs_1.default;
app.get('/', (req, res) => {
    const studios = db_1.db.prepare('SELECT * FROM studios').all();
    res.render('index', { studios });
});
app.get('/studio/:id', (req, res) => {
    const studioId = Number(req.params.id);
    const studio = db_1.db.prepare('SELECT * FROM studios WHERE id = ?').get(studioId);
    if (!studio)
        return res.status(404).send('Студия не найдена');
    const start = req.query.start ? String(req.query.start) : (0, dayjs_1.default)().startOf('day').toISOString();
    const end = req.query.end ? String(req.query.end) : (0, dayjs_1.default)().add(7, 'day').endOf('day').toISOString();
    const slots = db_1.db.prepare(`SELECT slots.*, 
            EXISTS(SELECT 1 FROM bookings b WHERE b.slot_id = slots.id AND b.status = 'confirmed') AS booked
     FROM slots 
     WHERE studio_id = ? AND start_time >= ? AND end_time <= ?
     ORDER BY start_time`).all(studioId, start, end);
    res.render('studio', { studio, slots, start, end });
});
app.post('/book', (req, res) => {
    const { studio_id, slot_id, customer_name, customer_email } = req.body;
    const studioId = Number(studio_id);
    const slotId = Number(slot_id);
    const slot = db_1.db.prepare('SELECT * FROM slots WHERE id = ? AND studio_id = ?').get(slotId, studioId);
    if (!slot)
        return res.status(400).send('Неверный слот');
    const already = db_1.db.prepare("SELECT 1 FROM bookings WHERE slot_id = ? AND status = 'confirmed'").get(slotId);
    if (already)
        return res.status(400).send('Слот уже забронирован');
    db_1.db.prepare('INSERT INTO bookings (studio_id, slot_id, customer_name, customer_email) VALUES (?, ?, ?, ?)')
        .run(studioId, slotId, customer_name, customer_email);
    res.redirect(`/success?slot=${slotId}`);
});
app.get('/success', (req, res) => {
    const slotId = Number(req.query.slot);
    const booking = db_1.db.prepare(`SELECT b.*, s.name as studio_name, sl.start_time, sl.end_time 
     FROM bookings b 
     JOIN studios s ON s.id = b.studio_id
     JOIN slots sl ON sl.id = b.slot_id
     WHERE b.slot_id = ?`).get(slotId);
    if (!booking)
        return res.status(404).send('Бронирование не найдено');
    res.render('success', { booking });
});
// Minimal admin to list bookings
app.get('/admin/bookings', (req, res) => {
    const bookings = db_1.db.prepare(`SELECT b.*, s.name as studio_name, sl.start_time, sl.end_time 
     FROM bookings b 
     JOIN studios s ON s.id = b.studio_id
     JOIN slots sl ON sl.id = b.slot_id
     ORDER BY b.created_at DESC`).all();
    res.render('admin_bookings', { bookings });
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
