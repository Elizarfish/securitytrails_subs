const express = require('express');
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all bookings for current user
router.get('/my-bookings', authenticateToken, (req, res) => {
  db.all(
    `SELECT b.*, s.name as studio_name, s.location, s.image_url
     FROM bookings b
     JOIN studios s ON b.studio_id = s.id
     WHERE b.user_id = ?
     ORDER BY b.booking_date DESC, b.start_time DESC`,
    [req.user.id],
    (err, bookings) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch bookings' });
      }
      res.json(bookings);
    }
  );
});

// Get bookings for a specific studio and date
router.get('/studio/:studioId/date/:date', (req, res) => {
  db.all(
    'SELECT * FROM bookings WHERE studio_id = ? AND booking_date = ? AND status != ?',
    [req.params.studioId, req.params.date, 'cancelled'],
    (err, bookings) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch bookings' });
      }
      res.json(bookings);
    }
  );
});

// Create booking
router.post('/', authenticateToken, (req, res) => {
  const { studio_id, booking_date, start_time, end_time, notes } = req.body;

  if (!studio_id || !booking_date || !start_time || !end_time) {
    return res.status(400).json({ error: 'All booking details are required' });
  }

  // Check if time slot is available
  db.all(
    `SELECT * FROM bookings 
     WHERE studio_id = ? AND booking_date = ? AND status != 'cancelled'
     AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?) OR (start_time >= ? AND end_time <= ?))`,
    [studio_id, booking_date, start_time, start_time, end_time, end_time, start_time, end_time],
    (err, existingBookings) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to check availability' });
      }

      if (existingBookings.length > 0) {
        return res.status(400).json({ error: 'Time slot is already booked' });
      }

      // Get studio price
      db.get('SELECT price_per_hour FROM studios WHERE id = ?', [studio_id], (err, studio) => {
        if (err || !studio) {
          return res.status(500).json({ error: 'Failed to fetch studio details' });
        }

        // Calculate duration and total price
        const startHour = parseInt(start_time.split(':')[0]);
        const endHour = parseInt(end_time.split(':')[0]);
        const duration = endHour - startHour;
        const total_price = duration * studio.price_per_hour;

        // Create booking
        db.run(
          'INSERT INTO bookings (user_id, studio_id, booking_date, start_time, end_time, total_price, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [req.user.id, studio_id, booking_date, start_time, end_time, total_price, notes],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to create booking' });
            }
            res.status(201).json({
              message: 'Booking created successfully',
              id: this.lastID,
              total_price
            });
          }
        );
      });
    }
  );
});

// Cancel booking
router.patch('/:id/cancel', authenticateToken, (req, res) => {
  db.run(
    'UPDATE bookings SET status = ? WHERE id = ? AND user_id = ?',
    ['cancelled', req.params.id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to cancel booking' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Booking not found or unauthorized' });
      }
      res.json({ message: 'Booking cancelled successfully' });
    }
  );
});

module.exports = router;
