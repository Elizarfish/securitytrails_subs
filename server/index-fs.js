const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const STUDIOS_FILE = path.join(DATA_DIR, 'studios.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

// Helper functions
const readData = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeData = async (filePath, data) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Токен доступа не предоставлен' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await readData(USERS_FILE);
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Недействительный токен' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Недействительный токен' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }
  next();
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Все поля обязательны' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Пароль должен содержать минимум 6 символов' });
    }

    const users = await readData(USERS_FILE);
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: generateId(),
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeData(USERS_FILE, users);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль обязательны' });
    }

    const users = await readData(USERS_FILE);
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(400).json({ message: 'Неверные учетные данные' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверные учетные данные' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Успешный вход в систему',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role
    }
  });
});

// Studio routes
app.get('/api/studio', async (req, res) => {
  try {
    const studios = await readData(STUDIOS_FILE);
    res.json(studios.filter(studio => studio.isActive));
  } catch (error) {
    console.error('Ошибка получения студий:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/api/studio/:id', async (req, res) => {
  try {
    const studios = await readData(STUDIOS_FILE);
    const studio = studios.find(s => s._id === req.params.id);
    
    if (!studio) {
      return res.status(404).json({ message: 'Студия не найдена' });
    }
    
    res.json(studio);
  } catch (error) {
    console.error('Ошибка получения студии:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Booking routes
app.get('/api/bookings/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await readData(BOOKINGS_FILE);
    const userBookings = bookings.filter(booking => booking.user === req.user.id);
    
    // Populate studio data
    const studios = await readData(STUDIOS_FILE);
    const populatedBookings = userBookings.map(booking => {
      const studio = studios.find(s => s._id === booking.studio);
      return {
        ...booking,
        studio: studio || { name: 'Неизвестная студия' }
      };
    });
    
    res.json(populatedBookings);
  } catch (error) {
    console.error('Ошибка получения бронирований:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/api/bookings/all', auth, adminAuth, async (req, res) => {
  try {
    const bookings = await readData(BOOKINGS_FILE);
    const users = await readData(USERS_FILE);
    const studios = await readData(STUDIOS_FILE);
    
    const populatedBookings = bookings.map(booking => {
      const user = users.find(u => u.id === booking.user);
      const studio = studios.find(s => s._id === booking.studio);
      return {
        ...booking,
        user: user || { name: 'Неизвестный пользователь', email: 'Неизвестно', phone: 'Неизвестно' },
        studio: studio || { name: 'Неизвестная студия' }
      };
    });
    
    res.json(populatedBookings);
  } catch (error) {
    console.error('Ошибка получения всех бронирований:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.post('/api/bookings/create', auth, async (req, res) => {
  try {
    const { studioId, date, startTime, endTime, duration, notes, specialRequests } = req.body;

    if (!studioId || !date || !startTime || !endTime || !duration) {
      return res.status(400).json({ message: 'Все обязательные поля должны быть заполнены' });
    }

    const studios = await readData(STUDIOS_FILE);
    const studio = studios.find(s => s._id === studioId);
    
    if (!studio) {
      return res.status(404).json({ message: 'Студия не найдена' });
    }

    // Check for time conflicts
    const bookings = await readData(BOOKINGS_FILE);
    const existingBooking = bookings.find(booking => 
      booking.studio === studioId &&
      booking.date === date &&
      booking.status !== 'cancelled' &&
      ((startTime >= booking.startTime && startTime < booking.endTime) ||
       (endTime > booking.startTime && endTime <= booking.endTime) ||
       (startTime <= booking.startTime && endTime >= booking.endTime))
    );

    if (existingBooking) {
      return res.status(400).json({ message: 'Выбранное время уже занято' });
    }

    const totalPrice = studio.pricePerHour * duration;
    const newBooking = {
      _id: generateId(),
      user: req.user.id,
      studio: studioId,
      date,
      startTime,
      endTime,
      duration,
      totalPrice,
      status: 'pending',
      notes: notes || '',
      specialRequests: specialRequests || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    bookings.push(newBooking);
    await writeData(BOOKINGS_FILE, bookings);

    res.status(201).json({
      message: 'Бронирование создано успешно',
      booking: {
        ...newBooking,
        studio: studio
      }
    });
  } catch (error) {
    console.error('Ошибка создания бронирования:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.patch('/api/bookings/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;

    const bookings = await readData(BOOKINGS_FILE);
    const booking = bookings.find(b => b._id === bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Бронирование не найдено' });
    }

    if (req.user.role !== 'admin' && booking.user !== req.user.id) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    booking.status = status;
    booking.updatedAt = new Date().toISOString();
    
    await writeData(BOOKINGS_FILE, bookings);

    res.json({
      message: 'Статус бронирования обновлен',
      booking
    });
  } catch (error) {
    console.error('Ошибка обновления статуса:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.delete('/api/bookings/:id', auth, async (req, res) => {
  try {
    const bookingId = req.params.id;

    const bookings = await readData(BOOKINGS_FILE);
    const booking = bookings.find(b => b._id === bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Бронирование не найдено' });
    }

    if (req.user.role !== 'admin' && booking.user !== req.user.id) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    booking.status = 'cancelled';
    booking.updatedAt = new Date().toISOString();
    
    await writeData(BOOKINGS_FILE, bookings);

    res.json({ message: 'Бронирование отменено' });
  } catch (error) {
    console.error('Ошибка отмены бронирования:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/api/bookings/available-slots', async (req, res) => {
  try {
    const { studioId, date } = req.query;

    if (!studioId || !date) {
      return res.status(400).json({ message: 'ID студии и дата обязательны' });
    }

    const studios = await readData(STUDIOS_FILE);
    const studio = studios.find(s => s._id === studioId);
    
    if (!studio) {
      return res.status(404).json({ message: 'Студия не найдена' });
    }

    // Get existing bookings for the date
    const bookings = await readData(BOOKINGS_FILE);
    const existingBookings = bookings.filter(booking => 
      booking.studio === studioId &&
      booking.date === date &&
      booking.status !== 'cancelled'
    );

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

// Initialize default users
const initializeDefaultUsers = async () => {
  try {
    const users = await readData(USERS_FILE);
    
    if (users.length === 0) {
      const defaultUsers = [
        {
          id: 'admin1',
          name: 'Администратор',
          email: 'admin@photo-studio.com',
          password: await bcrypt.hash('admin123', 10),
          phone: '+7 (999) 123-45-67',
          role: 'admin',
          createdAt: new Date().toISOString()
        },
        {
          id: 'user1',
          name: 'Тестовый Пользователь',
          email: 'user@test.com',
          password: await bcrypt.hash('user123', 10),
          phone: '+7 (999) 987-65-43',
          role: 'user',
          createdAt: new Date().toISOString()
        }
      ];
      
      await writeData(USERS_FILE, defaultUsers);
      console.log('Созданы пользователи по умолчанию');
    }
  } catch (error) {
    console.error('Ошибка инициализации пользователей:', error);
  }
};

// Initialize data
initializeDefaultUsers();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log('Данные для входа:');
  console.log('Администратор: admin@photo-studio.com / admin123');
  console.log('Пользователь: user@test.com / user123');
});