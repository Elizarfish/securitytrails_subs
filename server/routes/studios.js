const express = require('express');
const { getDatabase } = require('../database/init');
const router = express.Router();

// Получить все студии
router.get('/', (req, res) => {
  const db = getDatabase();
  const query = 'SELECT * FROM studios ORDER BY created_at DESC';
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Ошибка получения студий:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    
    // Преобразуем amenities из строки в массив
    const studios = rows.map(studio => ({
      ...studio,
      amenities: studio.amenities ? studio.amenities.split(', ') : []
    }));
    
    res.json(studios);
  });
});

// Получить студию по ID
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  db.get('SELECT * FROM studios WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Ошибка получения студии:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Студия не найдена' });
    }
    
    // Преобразуем amenities из строки в массив
    const studio = {
      ...row,
      amenities: row.amenities ? row.amenities.split(', ') : []
    };
    
    res.json(studio);
  });
});

// Проверить доступность студии
router.get('/:id/availability', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { date } = req.query;
  
  if (!date) {
    return res.status(400).json({ error: 'Необходимо указать дату' });
  }
  
  const startOfDay = `${date} 00:00:00`;
  const endOfDay = `${date} 23:59:59`;
  
  const query = `
    SELECT start_datetime, end_datetime 
    FROM bookings 
    WHERE studio_id = ? 
    AND status != 'cancelled'
    AND (
      (start_datetime >= ? AND start_datetime <= ?) OR
      (end_datetime >= ? AND end_datetime <= ?) OR
      (start_datetime <= ? AND end_datetime >= ?)
    )
    ORDER BY start_datetime
  `;
  
  db.all(query, [id, startOfDay, endOfDay, startOfDay, endOfDay, startOfDay, endOfDay], (err, rows) => {
    if (err) {
      console.error('Ошибка проверки доступности:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    
    // Генерируем слоты доступности (с 9:00 до 21:00)
    const availableSlots = [];
    const bookedSlots = rows.map(booking => ({
      start: new Date(booking.start_datetime).getHours(),
      end: new Date(booking.end_datetime).getHours()
    }));
    
    for (let hour = 9; hour <= 20; hour++) {
      const isBooked = bookedSlots.some(slot => 
        hour >= slot.start && hour < slot.end
      );
      
      if (!isBooked) {
        availableSlots.push({
          time: `${hour.toString().padStart(2, '0')}:00`,
          available: true
        });
      }
    }
    
    res.json({
      date,
      availableSlots,
      bookedSlots: rows
    });
  });
});

module.exports = router;