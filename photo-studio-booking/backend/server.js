const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize, Studio, User, Booking } = require('./models');

// Загружаем переменные окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Инициализация базы данных
sequelize.sync({ force: false })
  .then(() => {
    console.log('Database synchronized...');
    // Создаем тестовые данные
    createInitialData();
  })
  .catch(err => console.log('Error: ' + err));

// Функция для создания тестовых данных
async function createInitialData() {
  try {
    // Создаем тестовую студию, если она не существует
    const studioCount = await Studio.count();
    if (studioCount === 0) {
      await Studio.create({
        name: 'Профессиональная фотостудия',
        description: 'Просторная студия с профессиональным оборудованием для любых видов съёмки',
        price_per_hour: 1500,
        image_url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800',
        equipment: 'Профессиональные вспышки, софтбоксы, фоны, штативы',
        max_capacity: 15,
        is_available: true
      });

      await Studio.create({
        name: 'Минималистичная студия',
        description: 'Светлая студия в минималистичном стиле для портретной и предметной съёмки',
        price_per_hour: 1200,
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        equipment: 'Естественный свет, белые фоны, рефлекторы',
        max_capacity: 8,
        is_available: true
      });
    }

    // Создаем тестового админа, если пользователей нет
    const userCount = await User.count();
    if (userCount === 0) {
      await User.create({
        name: 'Администратор',
        email: 'admin@photostudio.com',
        password: 'admin123',
        phone: '+7 (999) 123-45-67',
        is_admin: true
      });
    }
  } catch (error) {
    console.log('Error creating initial data:', error);
  }
}

// Базовые роуты
app.get('/', (req, res) => {
  res.json({ message: 'Photo Studio Booking API is running!' });
});

// API роуты для студий
app.get('/api/studios', async (req, res) => {
  try {
    const studios = await Studio.findAll({
      where: { is_available: true }
    });
    res.json(studios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/studios/:id', async (req, res) => {
  try {
    const studio = await Studio.findByPk(req.params.id);
    if (studio) {
      res.json(studio);
    } else {
      res.status(404).json({ error: 'Studio not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API роуты для бронирований
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Studio, as: 'Studio' },
        { model: User, as: 'User' }
      ]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { studio_id, user_id, date, start_time, end_time, notes } = req.body;

    // Рассчитываем стоимость
    const studio = await Studio.findByPk(studio_id);
    if (!studio) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    // Простой расчёт: разница во времени в часах
    const start = new Date(`2000-01-01T${start_time}`);
    const end = new Date(`2000-01-01T${end_time}`);
    const hours = (end - start) / (1000 * 60 * 60);

    const total_price = studio.price_per_hour * hours;

    const booking = await Booking.create({
      studio_id,
      user_id,
      date,
      start_time,
      end_time,
      total_price,
      notes,
      status: 'pending'
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;