# Deployment Guide (без Docker)

## Требования к серверу

- Ubuntu 20.04+ / Debian 11+
- Node.js 20.18.0+
- PostgreSQL 14+
- Nginx
- PM2 (для управления процессом)
- Минимум 2GB RAM

## 1. Подготовка сервера

### Установка Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Должно быть >= 20.18.0
```

### Установка PostgreSQL

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Создание базы данных

```bash
sudo -u postgres psql

CREATE DATABASE tipsio_prod;
CREATE USER tipsio_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE tipsio_prod TO tipsio_user;
\q
```

### Установка PM2

```bash
sudo npm install -g pm2
```

### Установка Nginx

```bash
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 2. Настройка проекта

### Клонирование репозитория

```bash
cd /var/www
sudo git clone https://github.com/svlogevgeniy-rgb/Tipsio_v1.0.4.git tipsio
sudo chown -R $USER:$USER /var/www/tipsio
cd /var/www/tipsio
```

### Установка зависимостей

```bash
npm ci --production=false
```

### Настройка .env

```bash
cp .env.production.example .env.production
nano .env.production
```

Заполните переменные:

```env
# Database
DATABASE_URL="postgresql://tipsio_user:your_secure_password@localhost:5432/tipsio_prod"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate_with_openssl_rand_base64_32"

# Midtrans
MIDTRANS_SERVER_KEY="your_midtrans_server_key"
MIDTRANS_CLIENT_KEY="your_midtrans_client_key"
MIDTRANS_IS_PRODUCTION="true"

# App
NODE_ENV="production"
PORT=3000
```

### Генерация секретов

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# Другие секреты при необходимости
openssl rand -hex 32
```

### Миграция базы данных

```bash
npx prisma generate
npx prisma migrate deploy
```

### Сборка проекта

```bash
npm run build
```

## 3. Настройка PM2

### Создание ecosystem файла

```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'tipsio',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/tipsio',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/www/tipsio/logs/pm2-error.log',
    out_file: '/var/www/tipsio/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
}
```

### Создание директории для логов

```bash
mkdir -p /var/www/tipsio/logs
```

### Запуск приложения

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Выполните команду, которую выдаст `pm2 startup`.

### Полезные команды PM2

```bash
pm2 status              # Статус приложения
pm2 logs tipsio         # Просмотр логов
pm2 restart tipsio      # Перезапуск
pm2 stop tipsio         # Остановка
pm2 delete tipsio       # Удаление из PM2
pm2 monit               # Мониторинг в реальном времени
```

## 4. Настройка Nginx

### Создание конфигурации

```bash
sudo nano /etc/nginx/sites-available/tipsio
```

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (будет настроено через Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Client body size
    client_max_body_size 10M;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Images caching
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Logs
    access_log /var/log/nginx/tipsio_access.log;
    error_log /var/log/nginx/tipsio_error.log;
}
```

### Активация конфигурации

```bash
sudo ln -s /etc/nginx/sites-available/tipsio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. Настройка SSL (Let's Encrypt)

### Установка Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

### Получение сертификата

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Автообновление сертификата

```bash
sudo certbot renew --dry-run
```

Certbot автоматически добавит задачу в cron для обновления.

## 6. Скрипт деплоя

Создайте `deploy-no-docker.sh`:

```bash
#!/bin/bash

set -e

echo "🚀 Starting deployment..."

# Переход в директорию проекта
cd /var/www/tipsio

# Остановка приложения
echo "⏸️  Stopping application..."
pm2 stop tipsio || true

# Получение последних изменений
echo "📥 Pulling latest changes..."
git pull origin main

# Установка зависимостей
echo "📦 Installing dependencies..."
npm ci --production=false

# Миграция базы данных
echo "🗄️  Running database migrations..."
npx prisma generate
npx prisma migrate deploy

# Сборка проекта
echo "🔨 Building application..."
npm run build

# Запуск приложения
echo "▶️  Starting application..."
pm2 start ecosystem.config.js

# Сохранение конфигурации PM2
pm2 save

echo "✅ Deployment completed successfully!"
echo "📊 Application status:"
pm2 status tipsio
```

Сделайте скрипт исполняемым:

```bash
chmod +x deploy-no-docker.sh
```

## 7. Мониторинг и обслуживание

### Просмотр логов

```bash
# PM2 логи
pm2 logs tipsio

# Nginx логи
sudo tail -f /var/log/nginx/tipsio_access.log
sudo tail -f /var/log/nginx/tipsio_error.log

# PostgreSQL логи
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Мониторинг ресурсов

```bash
# Использование памяти и CPU
pm2 monit

# Системные ресурсы
htop

# Дисковое пространство
df -h

# Статус PostgreSQL
sudo systemctl status postgresql
```

### Резервное копирование базы данных

Создайте скрипт `backup-db.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/tipsio"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/tipsio_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

pg_dump -U tipsio_user -h localhost tipsio_prod > $BACKUP_FILE

# Сжатие
gzip $BACKUP_FILE

# Удаление старых бэкапов (старше 7 дней)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup created: $BACKUP_FILE.gz"
```

Добавьте в crontab:

```bash
crontab -e

# Ежедневный бэкап в 2:00
0 2 * * * /var/www/tipsio/backup-db.sh
```

## 8. Обновление приложения

### Простое обновление

```bash
cd /var/www/tipsio
./deploy-no-docker.sh
```

### Откат к предыдущей версии

```bash
cd /var/www/tipsio
git log --oneline -5  # Посмотреть последние коммиты
git checkout <commit-hash>
./deploy-no-docker.sh
```

## 9. Troubleshooting

### Приложение не запускается

```bash
# Проверить логи PM2
pm2 logs tipsio --lines 100

# Проверить порт
sudo netstat -tulpn | grep 3000

# Проверить переменные окружения
pm2 env 0
```

### Ошибки базы данных

```bash
# Проверить подключение
psql -U tipsio_user -h localhost -d tipsio_prod

# Проверить миграции
npx prisma migrate status

# Пересоздать клиент Prisma
npx prisma generate
```

### Nginx не работает

```bash
# Проверить конфигурацию
sudo nginx -t

# Проверить статус
sudo systemctl status nginx

# Перезапустить
sudo systemctl restart nginx
```

### Высокое использование памяти

```bash
# Перезапустить приложение
pm2 restart tipsio

# Настроить лимит памяти в ecosystem.config.js
max_memory_restart: '1G'
```

## 10. Сравнение с Docker

### Преимущества без Docker:

✅ Меньше использование RAM (~200-300MB экономии)
✅ Быстрее запуск приложения
✅ Проще отладка
✅ Прямой доступ к логам
✅ Нет overhead от контейнеризации

### Недостатки:

❌ Нужно вручную управлять зависимостями
❌ Сложнее изоляция окружения
❌ Нужно настраивать PostgreSQL вручную

## 11. Безопасность

### Firewall (UFW)

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Обновления системы

```bash
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y
```

### Ограничение доступа к PostgreSQL

```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Разрешить только локальные подключения
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
```

```bash
sudo systemctl restart postgresql
```

## 12. Производительность

### Оптимизация PostgreSQL

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf

# Настройки для 2GB RAM
shared_buffers = 512MB
effective_cache_size = 1536MB
maintenance_work_mem = 128MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB
```

```bash
sudo systemctl restart postgresql
```

### Оптимизация Next.js

В `next.config.mjs`:

```javascript
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  reactStrictMode: true,
}
```

## Готово! 🎉

Ваше приложение теперь работает без Docker и использует меньше ресурсов.
