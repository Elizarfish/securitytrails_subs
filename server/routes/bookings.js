const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../database/init');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Валидация данных бронирования
const bookingValidation = [
  body('studio_id').isInt().withMessage('ID студии должно быть числом'),
  body('user_name').notEmpty().withMessage('Имя обязательно'),
  body('user_email').isEmail().withMessage('Некорректный email'),
  body('user_phone').optional().matches(/^\+?[1-9]\d{1,14}$/).withMessage('Некорректный номер телефона'),
  body('start_datetime').isISO8601().withMessage('Некорректная дата начала'),
  body('end_datetime').isISO8601().withMessage('Некорректная дата окончания'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Заметки слишком длинные')
];

// Получить все бронирования
router.get('/', (req, res) => {
  const db = getDatabase();
  const query = `
    SELECT b.*, s.name as studio_name, s.address as studio_address
    FROM bookings b
    JOIN studios s ON b.studio_id = s.id
    ORDER BY b.start_datetime DESC
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Ошибка получения бронирований:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    res.json(rows);
  });
});

// Получить бронирование по ID
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  const query = `
    SELECT b.*, s.name as studio_name, s.address as studio_address, s.price_per_hour
    FROM bookings b
    JOIN studios s ON b.studio_id = s.id
    WHERE b.id = ?
  `;
  
  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Ошибка получения бронирования:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }
    
    res.json(row);
  });
});

// Создать новое бронирование
router.post('/', bookingValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const db = getDatabase();
  const {
    studio_id,
    user_name,
    user_email,
    user_phone,
    start_datetime,
    end_datetime,
    notes
  } = req.body;
  
  // Проверяем, что время окончания больше времени начала
  const startTime = new Date(start_datetime);
  const endTime = new Date(end_datetime);
  
  if (endTime <= startTime) {
    return res.status(400).json({ error: 'Время окончания должно быть больше времени начала' });
  }
  
  // Проверяем доступность студии в указанное время
  const checkAvailabilityQuery = `
    SELECT COUNT(*) as count
    FROM bookings
    WHERE studio_id = ?
    AND status != 'cancelled'
    AND (
      (start_datetime < ? AND end_datetime > ?) OR
      (start_datetime < ? AND end_datetime > ?) OR
      (start_datetime >= ? AND end_datetime <= ?)
    )
  `;
  
  db.get(checkAvailabilityQuery, [
    studio_id,
    start_datetime, start_datetime,
    end_datetime, end_datetime,
    start_datetime, end_datetime
  ], (err, row) => {
    if (err) {
      console.error('Ошибка проверки доступности:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    
    if (row.count > 0) {
      return res.status(409).json({ error: 'Студия уже забронирована на это время' });
    }
    
    // Получаем цену студии для расчета общей стоимости
    db.get('SELECT price_per_hour FROM studios WHERE id = ?', [studio_id], (err, studio) => {
      if (err || !studio) {
        return res.status(404).json({ error: 'Студия не найдена' });
      }
      
      // Рассчитываем общую стоимость
      const hours = (endTime - startTime) / (1000 * 60 * 60);
      const total_price = Math.round(hours * studio.price_per_hour);
      
      // Создаем бронирование
      const insertQuery = `
        INSERT INTO bookings (
          studio_id, user_name, user_email, user_phone,
          start_datetime, end_datetime, total_price, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(insertQuery, [
        studio_id, user_name, user_email, user_phone,
        start_datetime, end_datetime, total_price, notes
      ], function(err) {
        if (err) {
          console.error('Ошибка создания бронирования:', err);
          return res.status(500).json({ error: 'Ошибка сервера' });
        }
        
        // Возвращаем созданное бронирование
        const selectQuery = `
          SELECT b.*, s.name as studio_name, s.address as studio_address
          FROM bookings b
          JOIN studios s ON b.studio_id = s.id
          WHERE b.id = ?
        `;
        
        db.get(selectQuery, [this.lastID], (err, booking) => {
          if (err) {
            console.error('Ошибка получения созданного бронирования:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
          }
          
          res.status(201).json(booking);
        });
      });
    });
  });
});

// Обновить статус бронирования
router.patch('/:id/status', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { status } = req.body;
  
  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Некорректный статус' });
  }
  
  db.run('UPDATE bookings SET status = ? WHERE id = ?', [status, id], function(err) {
    if (err) {
      console.error('Ошибка обновления статуса:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }
    
    res.json({ message: 'Статус обновлен', status });
  });
});

// Удалить бронирование
router.delete('/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  db.run('DELETE FROM bookings WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Ошибка удаления бронирования:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }
    
    res.json({ message: 'Бронирование удалено' });
  });
});

module.exports = router;