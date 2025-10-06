const express = require('express');
const db = require('../database');

const router = express.Router();

// Get all studios
router.get('/', (req, res) => {
  db.all('SELECT * FROM studios ORDER BY created_at DESC', (err, studios) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch studios' });
    }
    res.json(studios);
  });
});

// Get single studio
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM studios WHERE id = ?', [req.params.id], (err, studio) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch studio' });
    }
    if (!studio) {
      return res.status(404).json({ error: 'Studio not found' });
    }
    res.json(studio);
  });
});

// Create studio (admin only)
router.post('/', require('../middleware/auth').authenticateToken, (req, res) => {
  const { name, description, location, price_per_hour, capacity, amenities, image_url } = req.body;

  if (!name || !price_per_hour) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  db.run(
    'INSERT INTO studios (name, description, location, price_per_hour, capacity, amenities, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, description, location, price_per_hour, capacity, amenities, image_url],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create studio' });
      }
      res.status(201).json({
        message: 'Studio created successfully',
        id: this.lastID
      });
    }
  );
});

module.exports = router;
