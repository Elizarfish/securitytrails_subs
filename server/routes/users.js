const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../database/init');
const router = express.Router();

// Валидация пользователя
const userValidation = [
  body('name').notEmpty().withMessage('Имя обязательно'),
  body('email').isEmail().withMessage('Некорректный email'),
  body('phone').optional().matches(/^\+?[1-9]\d{1,14}$/).withMessage('Некорректный номер телефона')
];

// Получить всех пользователей
router.get('/', (req, res) => {
  const db = getDatabase();
  const query = 'SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC';
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Ошибка получения пользователей:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    res.json(rows);
  });
});

// Получить пользователя по email
router.get('/by-email/:email', (req, res) => {
  const db = getDatabase();
  const { email } = req.params;
  
  db.get('SELECT id, name, email, phone, created_at FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      console.error('Ошибка получения пользователя:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json(row);
  });
});

// Получить бронирования пользователя
router.get('/:email/bookings', (req, res) => {
  const db = getDatabase();
  const { email } = req.params;
  
  const query = `
    SELECT b.*, s.name as studio_name, s.address as studio_address
    FROM bookings b
    JOIN studios s ON b.studio_id = s.id
    WHERE b.user_email = ?
    ORDER BY b.start_datetime DESC
  `;
  
  db.all(query, [email], (err, rows) => {
    if (err) {
      console.error('Ошибка получения бронирований пользователя:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    res.json(rows);
  });
});

// Создать или обновить пользователя
router.post('/', userValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const db = getDatabase();
  const { name, email, phone } = req.body;
  
  // Проверяем, существует ли пользователь
  db.get('SELECT id FROM users WHERE email = ?', [email], (err, existingUser) => {
    if (err) {
      console.error('Ошибка проверки пользователя:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    
    if (existingUser) {
      // Обновляем существующего пользователя
      db.run('UPDATE users SET name = ?, phone = ? WHERE email = ?', [name, phone, email], function(err) {
        if (err) {
          console.error('Ошибка обновления пользователя:', err);
          return res.status(500).json({ error: 'Ошибка сервера' });
        }
        
        res.json({ id: existingUser.id, name, email, phone, message: 'Пользователь обновлен' });
      });
    } else {
      // Создаем нового пользователя
      db.run('INSERT INTO users (name, email, phone) VALUES (?, ?, ?)', [name, email, phone], function(err) {
        if (err) {
          console.error('Ошибка создания пользователя:', err);
          return res.status(500).json({ error: 'Ошибка сервера' });
        }
        
        res.status(201).json({ id: this.lastID, name, email, phone, message: 'Пользователь создан' });
      });
    }
  });
});

module.exports = router;