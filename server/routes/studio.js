const express = require('express');
const { body, validationResult } = require('express-validator');
const Studio = require('../models/Studio');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all studios
router.get('/', async (req, res) => {
  try {
    const studios = await Studio.find({ isActive: true });
    res.json(studios);
  } catch (error) {
    console.error('Ошибка получения студий:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Get studio by ID
router.get('/:id', async (req, res) => {
  try {
    const studio = await Studio.findById(req.params.id);
    if (!studio) {
      return res.status(404).json({ message: 'Студия не найдена' });
    }
    res.json(studio);
  } catch (error) {
    console.error('Ошибка получения студии:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Create studio (admin only)
router.post('/', auth, adminAuth, [
  body('name').trim().isLength({ min: 2 }).withMessage('Название должно содержать минимум 2 символа'),
  body('description').trim().isLength({ min: 10 }).withMessage('Описание должно содержать минимум 10 символов'),
  body('address').trim().isLength({ min: 5 }).withMessage('Адрес должен содержать минимум 5 символов'),
  body('pricePerHour').isNumeric().withMessage('Цена за час должна быть числом'),
  body('capacity').isInt({ min: 1 }).withMessage('Вместимость должна быть положительным числом')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const studio = new Studio(req.body);
    await studio.save();

    res.status(201).json({
      message: 'Студия создана успешно',
      studio
    });
  } catch (error) {
    console.error('Ошибка создания студии:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Update studio (admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const studio = await Studio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!studio) {
      return res.status(404).json({ message: 'Студия не найдена' });
    }

    res.json({
      message: 'Студия обновлена успешно',
      studio
    });
  } catch (error) {
    console.error('Ошибка обновления студии:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Delete studio (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const studio = await Studio.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!studio) {
      return res.status(404).json({ message: 'Студия не найдена' });
    }

    res.json({ message: 'Студия деактивирована' });
  } catch (error) {
    console.error('Ошибка удаления студии:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;