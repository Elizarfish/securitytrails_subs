# 🚀 Руководство по развертыванию

## Локальная разработка

### Быстрый старт

1. **Клонирование и установка:**
   ```bash
   git clone <repository-url>
   cd photo-studio-booking
   npm run install-all
   ```

2. **Запуск в режиме разработки:**
   ```bash
   npm run dev
   ```
   - Backend: http://localhost:3001
   - Frontend: http://localhost:3000

3. **Запуск только backend:**
   ```bash
   npm run server
   ```

### Структура проекта

```
photo-studio-booking/
├── server/                 # Backend (Node.js + Express)
│   ├── routes/            # API маршруты
│   ├── database/          # Настройка базы данных
│   └── index.js           # Главный файл сервера
├── client/                # Frontend (React)
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── pages/         # Страницы приложения
│   │   ├── services/      # API сервисы
│   │   └── utils/         # Утилиты
│   └── public/            # Статические файлы
├── package.json           # Зависимости сервера
└── README.md              # Документация
```

## Продакшен развертывание

### Вариант 1: Heroku

1. **Подготовка:**
   ```bash
   # Создание Procfile
   echo "web: npm start" > Procfile
   
   # Обновление package.json для Heroku
   npm install --save-dev @heroku/buildpack-nodejs
   ```

2. **Развертывание:**
   ```bash
   heroku create your-app-name
   heroku buildpacks:add heroku/nodejs
   git push heroku main
   ```

### Вариант 2: VPS/Сервер

1. **Установка на сервер:**
   ```bash
   # Клонирование проекта
   git clone <repository-url>
   cd photo-studio-booking
   
   # Установка зависимостей
   npm run install-all
   
   # Сборка frontend
   npm run build
   ```

2. **Настройка PM2:**
   ```bash
   npm install -g pm2
   
   # Создание ecosystem файла
   cat > ecosystem.config.js << EOF
   module.exports = {
     apps: [{
       name: 'photo-studio-booking',
       script: 'server/index.js',
       env: {
         NODE_ENV: 'production',
         SERVER_PORT: 3001
       }
     }]
   }
   EOF
   
   # Запуск
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

3. **Nginx конфигурация:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Вариант 3: Docker

1. **Создание Dockerfile:**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   # Копирование package.json файлов
   COPY package*.json ./
   COPY client/package*.json ./client/
   
   # Установка зависимостей
   RUN npm install
   RUN cd client && npm install
   
   # Копирование исходного кода
   COPY . .
   
   # Сборка frontend
   RUN npm run build
   
   EXPOSE 3001
   
   CMD ["npm", "start"]
   ```

2. **Docker Compose:**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3001:3001"
       environment:
         - NODE_ENV=production
         - SERVER_PORT=3001
       volumes:
         - ./server/database.sqlite:/app/server/database.sqlite
   ```

## Переменные окружения

Создайте `.env` файл в корне проекта:

```env
# Сервер
SERVER_PORT=3001
NODE_ENV=production

# База данных
DB_PATH=./server/database.sqlite

# JWT (для будущих функций аутентификации)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Frontend URL (для CORS)
CLIENT_URL=http://localhost:3000
```

## База данных

### SQLite (по умолчанию)
- Файл: `server/database.sqlite`
- Автоматическое создание таблиц при запуске
- Подходит для небольших проектов

### Миграция на PostgreSQL (опционально)

1. **Установка pg:**
   ```bash
   npm install pg
   ```

2. **Обновление database/init.js:**
   ```javascript
   const { Pool } = require('pg');
   
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL
   });
   ```

## Мониторинг и логи

### PM2 мониторинг:
```bash
pm2 monit
pm2 logs photo-studio-booking
```

### Логи приложения:
```bash
# Просмотр логов
tail -f logs/app.log

# Ротация логов
pm2 install pm2-logrotate
```

## Резервное копирование

### SQLite база данных:
```bash
# Создание бэкапа
cp server/database.sqlite backups/database_$(date +%Y%m%d_%H%M%S).sqlite

# Автоматический бэкап (cron)
0 2 * * * /path/to/backup-script.sh
```

## SSL/HTTPS

### Let's Encrypt с Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Производительность

### Оптимизация:
- Включите gzip сжатие в Nginx
- Используйте CDN для статических файлов
- Настройте кэширование в браузере
- Мониторинг производительности с помощью PM2

### Масштабирование:
```bash
# Запуск нескольких инстансов
pm2 start ecosystem.config.js -i max
```

## Безопасность

1. **Обновите зависимости:**
   ```bash
   npm audit fix
   ```

2. **Настройте firewall:**
   ```bash
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

3. **Используйте HTTPS везде**

4. **Регулярные обновления системы**

## Troubleshooting

### Частые проблемы:

1. **Порт занят:**
   ```bash
   lsof -ti:3001
   kill -9 <PID>
   ```

2. **База данных заблокирована:**
   ```bash
   rm server/database.sqlite-wal
   rm server/database.sqlite-shm
   ```

3. **Ошибки сборки React:**
   ```bash
   cd client
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

## Поддержка

Для получения помощи:
1. Проверьте логи приложения
2. Убедитесь в правильности переменных окружения
3. Проверьте доступность портов
4. Создайте issue в репозитории проекта