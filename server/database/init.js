const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../database.sqlite');

let db;

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('📦 Подключение к SQLite базе данных установлено');
      
      // Создание таблиц
      createTables()
        .then(() => {
          insertSampleData();
          resolve();
        })
        .catch(reject);
    });
  });
};

const createTables = () => {
  return new Promise((resolve, reject) => {
    const queries = [
      // Таблица студий
      `CREATE TABLE IF NOT EXISTS studios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        address TEXT NOT NULL,
        price_per_hour REAL NOT NULL,
        capacity INTEGER NOT NULL,
        amenities TEXT,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Таблица пользователей
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Таблица бронирований
      `CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studio_id INTEGER NOT NULL,
        user_name TEXT NOT NULL,
        user_email TEXT NOT NULL,
        user_phone TEXT,
        start_datetime DATETIME NOT NULL,
        end_datetime DATETIME NOT NULL,
        total_price REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (studio_id) REFERENCES studios (id)
      )`
    ];

    let completed = 0;
    queries.forEach(query => {
      db.run(query, (err) => {
        if (err) {
          reject(err);
          return;
        }
        completed++;
        if (completed === queries.length) {
          console.log('✅ Таблицы созданы успешно');
          resolve();
        }
      });
    });
  });
};

const insertSampleData = () => {
  // Проверяем, есть ли уже данные
  db.get('SELECT COUNT(*) as count FROM studios', (err, row) => {
    if (err || row.count > 0) return;
    
    // Добавляем примеры студий
    const sampleStudios = [
      {
        name: 'Студия "Свет и Тень"',
        description: 'Просторная студия с профессиональным освещением и разнообразными фонами',
        address: 'ул. Пушкина, д. 10, Москва',
        price_per_hour: 2500,
        capacity: 8,
        amenities: 'Профессиональное освещение, разнообразные фоны, гримерная, Wi-Fi, кофе',
        image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500'
      },
      {
        name: 'Loft Studio',
        description: 'Стильная лофт-студия с большими окнами и естественным освещением',
        address: 'Невский пр., д. 25, Санкт-Петербург',
        price_per_hour: 3000,
        capacity: 12,
        amenities: 'Естественное освещение, лофт-интерьер, большие окна, парковка',
        image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'
      },
      {
        name: 'Минималист Студио',
        description: 'Минималистичная студия для портретной съемки',
        address: 'ул. Ленина, д. 5, Екатеринбург',
        price_per_hour: 1800,
        capacity: 4,
        amenities: 'Минималистичный дизайн, портретное освещение, белые фоны',
        image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500'
      }
    ];

    const stmt = db.prepare(`
      INSERT INTO studios (name, description, address, price_per_hour, capacity, amenities, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    sampleStudios.forEach(studio => {
      stmt.run([
        studio.name,
        studio.description,
        studio.address,
        studio.price_per_hour,
        studio.capacity,
        studio.amenities,
        studio.image_url
      ]);
    });

    stmt.finalize();
    console.log('📝 Примеры данных добавлены');
  });
};

const getDatabase = () => db;

module.exports = {
  initDatabase,
  getDatabase
};