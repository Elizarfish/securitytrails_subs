const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/User');
const Studio = require('../models/Studio');

const initData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photo-studio-booking', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Подключено к MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Studio.deleteMany({});
    console.log('Очищены существующие данные');

    // Create admin user
    const adminUser = new User({
      name: 'Администратор',
      email: 'admin@photo-studio.com',
      password: 'admin123',
      phone: '+7 (999) 123-45-67',
      role: 'admin'
    });
    await adminUser.save();
    console.log('Создан администратор:', adminUser.email);

    // Create test user
    const testUser = new User({
      name: 'Тестовый Пользователь',
      email: 'user@test.com',
      password: 'user123',
      phone: '+7 (999) 987-65-43',
      role: 'user'
    });
    await testUser.save();
    console.log('Создан тестовый пользователь:', testUser.email);

    // Create studios
    const studios = [
      {
        name: 'Студия "Свет"',
        description: 'Просторная студия с профессиональным освещением и современным оборудованием. Идеально подходит для портретной и предметной съемки.',
        address: 'ул. Тверская, 15, Москва',
        pricePerHour: 2500,
        capacity: 8,
        amenities: ['Профессиональное освещение', 'Фоны', 'Зеркала', 'Wi-Fi', 'Кондиционер', 'Парковка'],
        images: [],
        workingHours: {
          monday: { start: '09:00', end: '21:00', isOpen: true },
          tuesday: { start: '09:00', end: '21:00', isOpen: true },
          wednesday: { start: '09:00', end: '21:00', isOpen: true },
          thursday: { start: '09:00', end: '21:00', isOpen: true },
          friday: { start: '09:00', end: '21:00', isOpen: true },
          saturday: { start: '10:00', end: '20:00', isOpen: true },
          sunday: { start: '10:00', end: '18:00', isOpen: true }
        }
      },
      {
        name: 'Арт-студия "Креатив"',
        description: 'Стильная студия в лофте с уникальным интерьером. Отлично подходит для fashion-съемки и творческих проектов.',
        address: 'пер. Арбатский, 8, Москва',
        pricePerHour: 3500,
        capacity: 12,
        amenities: ['Уникальный интерьер', 'Профессиональное освещение', 'Гримерная', 'Wi-Fi', 'Кондиционер', 'Кухня'],
        images: [],
        workingHours: {
          monday: { start: '10:00', end: '22:00', isOpen: true },
          tuesday: { start: '10:00', end: '22:00', isOpen: true },
          wednesday: { start: '10:00', end: '22:00', isOpen: true },
          thursday: { start: '10:00', end: '22:00', isOpen: true },
          friday: { start: '10:00', end: '22:00', isOpen: true },
          saturday: { start: '11:00', end: '21:00', isOpen: true },
          sunday: { start: '11:00', end: '19:00', isOpen: true }
        }
      },
      {
        name: 'Студия "Минимализм"',
        description: 'Чистая и светлая студия в минималистичном стиле. Идеальна для коммерческой съемки и портретов.',
        address: 'ул. Красная Площадь, 1, Москва',
        pricePerHour: 2000,
        capacity: 6,
        amenities: ['Минималистичный дизайн', 'Естественный свет', 'Профессиональное освещение', 'Wi-Fi', 'Кондиционер'],
        images: [],
        workingHours: {
          monday: { start: '09:00', end: '20:00', isOpen: true },
          tuesday: { start: '09:00', end: '20:00', isOpen: true },
          wednesday: { start: '09:00', end: '20:00', isOpen: true },
          thursday: { start: '09:00', end: '20:00', isOpen: true },
          friday: { start: '09:00', end: '20:00', isOpen: true },
          saturday: { start: '10:00', end: '18:00', isOpen: true },
          sunday: { start: '10:00', end: '18:00', isOpen: true }
        }
      },
      {
        name: 'Студия "Винтаж"',
        description: 'Студия в винтажном стиле с уникальными декорациями. Отлично подходит для тематических съемок и ретро-проектов.',
        address: 'ул. Старый Арбат, 25, Москва',
        pricePerHour: 3000,
        capacity: 10,
        amenities: ['Винтажные декорации', 'Профессиональное освещение', 'Костюмы', 'Wi-Fi', 'Кондиционер', 'Гримерная'],
        images: [],
        workingHours: {
          monday: { start: '10:00', end: '21:00', isOpen: true },
          tuesday: { start: '10:00', end: '21:00', isOpen: true },
          wednesday: { start: '10:00', end: '21:00', isOpen: true },
          thursday: { start: '10:00', end: '21:00', isOpen: true },
          friday: { start: '10:00', end: '21:00', isOpen: true },
          saturday: { start: '11:00', end: '20:00', isOpen: true },
          sunday: { start: '11:00', end: '18:00', isOpen: true }
        }
      }
    ];

    for (const studioData of studios) {
      const studio = new Studio(studioData);
      await studio.save();
      console.log('Создана студия:', studio.name);
    }

    console.log('\n✅ Инициализация данных завершена успешно!');
    console.log('\nДанные для входа:');
    console.log('Администратор: admin@photo-studio.com / admin123');
    console.log('Пользователь: user@test.com / user123');
    console.log('\nЗапустите сервер командой: npm run server');
    console.log('Запустите клиент командой: npm run client');

  } catch (error) {
    console.error('Ошибка инициализации данных:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Соединение с MongoDB закрыто');
  }
};

initData();