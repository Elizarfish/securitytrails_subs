const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Studio = require('../models/Studio');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all bookings for a user
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('studio', 'name address')
      .sort({ date: -1, startTime: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Ошибка получения бронирований:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Get all bookings (admin only)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .populate('studio', 'name address')
      .sort({ date: -1, startTime: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Ошибка получения всех бронирований:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Create new booking
router.post('/create', auth, [
  body('studioId').isMongoId().withMessage('Неверный ID студии'),
  body('date').isISO8601().withMessage('Неверный формат даты'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Неверный формат времени начала'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Неверный формат времени окончания'),
  body('duration').isNumeric().withMessage('Продолжительность должна быть числом')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studioId, date, startTime, endTime, duration, notes, equipment, specialRequests } = req.body;

    // Check if studio exists
    const studio = await Studio.findById(studioId);
    if (!studio) {
      return res.status(404).json({ message: 'Студия не найдена' });
    }

    // Check for time conflicts
    const existingBooking = await Booking.findOne({
      studio: studioId,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Выбранное время уже занято' });
    }

    // Calculate total price
    const totalPrice = studio.pricePerHour * duration;

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      studio: studioId,
      date: new Date(date),
      startTime,
      endTime,
      duration,
      totalPrice,
      notes,
      equipment: equipment || [],
      specialRequests
    });

    await booking.save();
    await booking.populate('studio', 'name address pricePerHour');

    res.status(201).json({
      message: 'Бронирование создано успешно',
      booking
    });
  } catch (error) {
    console.error('Ошибка создания бронирования:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Update booking status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;

    // Check if user is admin or booking owner
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Бронирование не найдено' });
    }

    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    booking.status = status;
    await booking.save();

    res.json({
      message: 'Статус бронирования обновлен',
      booking
    });
  } catch (error) {
    console.error('Ошибка обновления статуса:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Cancel booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Бронирование не найдено' });
    }

    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Бронирование отменено' });
  } catch (error) {
    console.error('Ошибка отмены бронирования:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Get available time slots for a specific date
router.get('/available-slots', async (req, res) => {
  try {
    const { studioId, date } = req.query;

    if (!studioId || !date) {
      return res.status(400).json({ message: 'ID студии и дата обязательны' });
    }

    const studio = await Studio.findById(studioId);
    if (!studio) {
      return res.status(404).json({ message: 'Студия не найдена' });
    }

    // Get existing bookings for the date
    const existingBookings = await Booking.find({
      studio: studioId,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] }
    });

    // Generate available time slots (every hour from 9 AM to 9 PM)
    const availableSlots = [];
    const startHour = 9;
    const endHour = 21;

    for (let hour = startHour; hour < endHour; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      const nextTimeSlot = `${(hour + 1).toString().padStart(2, '0')}:00`;

      // Check if this time slot is available
      const isBooked = existingBookings.some(booking => {
        return timeSlot >= booking.startTime && timeSlot < booking.endTime;
      });

      if (!isBooked) {
        availableSlots.push({
          startTime: timeSlot,
          endTime: nextTimeSlot,
          price: studio.pricePerHour
        });
      }
    }

    res.json(availableSlots);
  } catch (error) {
    console.error('Ошибка получения доступных слотов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;