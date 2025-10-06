const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'booking.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Studios table
  db.run(`
    CREATE TABLE IF NOT EXISTS studios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      location TEXT,
      price_per_hour REAL NOT NULL,
      capacity INTEGER,
      amenities TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bookings table
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      studio_id INTEGER NOT NULL,
      booking_date DATE NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      total_price REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (studio_id) REFERENCES studios (id)
    )
  `);

  // Insert sample studios
  db.get("SELECT COUNT(*) as count FROM studios", (err, row) => {
    if (row.count === 0) {
      const studios = [
        {
          name: 'Студия "Светлая"',
          description: 'Просторная студия с естественным освещением и минималистичным интерьером',
          location: 'Москва, ул. Тверская, 15',
          price: 2500,
          capacity: 10,
          amenities: 'Циклорама, софтбоксы, фоны, гримерная',
          image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800'
        },
        {
          name: 'Студия "Креатив"',
          description: 'Современная студия с разнообразными локациями и декорациями',
          location: 'Москва, ул. Арбат, 28',
          price: 3000,
          capacity: 8,
          amenities: 'Разные фоны, реквизит, кольцевой свет, студийный свет',
          image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800'
        },
        {
          name: 'Студия "Лофт"',
          description: 'Индустриальный лофт с кирпичными стенами и высокими потолками',
          location: 'Москва, ул. Новослободская, 45',
          price: 3500,
          capacity: 15,
          amenities: 'Кирпичные стены, панорамные окна, профессиональное оборудование',
          image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
        },
        {
          name: 'Студия "Винтаж"',
          description: 'Уютная студия с винтажным интерьером и ретро-декорациями',
          location: 'Москва, ул. Маросейка, 7',
          price: 2800,
          capacity: 6,
          amenities: 'Винтажная мебель, декорации, мягкий свет',
          image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO studios (name, description, location, price_per_hour, capacity, amenities, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      studios.forEach(studio => {
        stmt.run(
          studio.name,
          studio.description,
          studio.location,
          studio.price,
          studio.capacity,
          studio.amenities,
          studio.image
        );
      });

      stmt.finalize();
      console.log('Sample studios inserted');
    }
  });
});

module.exports = db;
