# Tipsio Deployment Guide

## Обзор стека

- **Runtime**: Node.js 20.18, npm >= 10.8
- **Framework**: Next.js 14.2 + React 18 + NextAuth v5 beta
- **ORM**: Prisma 7 + PostgreSQL 15+
- **UI**: Tailwind CSS + Radix UI
- **Payments**: Midtrans SDK
- **Container**: Docker (non-root, standalone build)

---

## A) QUICK START (DEV)

### A1) Локальный запуск (npm)

```bash
# 1. Проверка версий
node -v  # должно быть v20.18.x
npm -v   # должно быть >= 10.8

# 2. Установка зависимостей
npm install --legacy-peer-deps

# 3. Создание .env
cp .env.example .env

# 4. Запуск PostgreSQL (через Docker)
npm run db:up
# или docker compose -f docker-compose.yml -f docker-compose.local.yml up -d db

# 5. Ожидание готовности БД + миграции + seed
npm run db:init
# Это выполнит: db:up -> db:wait -> db:push -> db:seed

# 6. Запуск dev-сервера
npm run dev

# 7. Проверка health
curl http://localhost:3000/api/health
# Ожидаемый ответ: {"status":"ok","uptimeMs":...,"checks":{"database":{"status":"ok",...}}}
```

### A2) Docker Compose (dev)

```bash
# 1. Создать .env
cp .env.example .env

# 2. Запуск всего стека
docker compose up -d

# 3. Проверка статуса
docker compose ps

# 4. Проверка логов
docker compose logs -f app

# 5. Проверка health (после старта ~15-30 сек)
curl http://localhost:3000/api/health

# Volumes:
# - postgres_data: /var/lib/docker/volumes/tipsio_postgres_data
# - uploads_data: /var/lib/docker/volumes/tipsio_uploads_data
```

---

## B) PRODUCTION DEPLOYMENT

### B1) Автоматический деплой через deploy.sh

#### Подготовка сервера

```bash
# SSH на сервер (password auth)
ssh root@YOUR_SERVER_IP
# Password: YOUR_SECURE_PASSWORD

# Или с sshpass (для автоматизации)
sshpass -p 'YOUR_SECURE_PASSWORD' ssh root@YOUR_SERVER_IP

# Создание пользователя deploy
adduser deploy
usermod -aG sudo deploy

# Настройка SSH ключей (опционально)
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/ 2>/dev/null || true
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh

# UFW firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

#### Запуск deploy.sh

```bash
# На локальной машине
export DEPLOY_SERVER="YOUR_SERVER_IP"
export DEPLOY_USER="deploy"
export DEPLOY_DOMAIN="app.example.com"

./deploy.sh
```

**Что делает скрипт:**
1. Копирует файлы через rsync
2. Устанавливает Docker/Compose если нет
3. Генерирует секреты в `.env` (NEXTAUTH_SECRET, ENCRYPTION_KEY, DB_PASSWORD)
4. Получает SSL сертификат через certbot
5. Собирает и запускает контейнеры
6. Ждёт готовности БД
7. Проверяет health endpoint
8. Запускает миграции

**После деплоя:**
```bash
# SSH на сервер
ssh deploy@YOUR_SERVER_IP
cd /opt/tipsio

# Добавить Midtrans ключи
nano .env
# Вставить MIDTRANS_SERVER_KEY и MIDTRANS_CLIENT_KEY

# Перезапуск
docker compose restart app
```



### B2) Ручной деплой (Manual)

#### Шаг 1: Копирование на сервер

**С паролем (sshpass):**
```bash
# Установка sshpass (macOS)
brew install hudochenkov/sshpass/sshpass

# Копирование
sshpass -p 'YOUR_PASSWORD' rsync -avz \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  ./ deploy@YOUR_SERVER_IP:/opt/tipsio/
```

**С SSH ключом:**
```bash
rsync -avz -e "ssh -i ~/.ssh/your_key" \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  ./ deploy@YOUR_SERVER_IP:/opt/tipsio/
```

#### Шаг 2: Генерация секретов

```bash
# На локальной машине
./generate-secrets.sh

# Или вручную:
openssl rand -base64 32  # NEXTAUTH_SECRET
openssl rand -hex 32     # ENCRYPTION_KEY (256-bit)
openssl rand -base64 24  # DB_PASSWORD
```

#### Шаг 3: Создание .env на сервере

```bash
ssh deploy@YOUR_SERVER_IP
cd /opt/tipsio
nano .env
```

Вставить содержимое (см. секцию D ниже).

#### Шаг 4: SSL сертификат

```bash
cd /opt/tipsio
mkdir -p certbot/conf certbot/www

# Временный nginx для ACME challenge
cat > nginx-init.conf << 'EOF'
events { worker_connections 1024; }
http {
    server {
        listen 80;
        server_name YOUR_DOMAIN;
        location /.well-known/acme-challenge/ { root /var/www/certbot; }
        location / { return 200 'Configuring...'; add_header Content-Type text/plain; }
    }
}
EOF

# Запуск временного nginx
docker run -d --name nginx-init -p 80:80 \
    -v $(pwd)/nginx-init.conf:/etc/nginx/nginx.conf:ro \
    -v $(pwd)/certbot/www:/var/www/certbot:ro \
    nginx:alpine

sleep 3

# Получение сертификата
docker run --rm \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    -v $(pwd)/certbot/www:/var/www/certbot \
    certbot/certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email YOUR_EMAIL@domain.com \
    --agree-tos --no-eff-email \
    -d YOUR_DOMAIN

# Остановка временного nginx
docker stop nginx-init && docker rm nginx-init
rm nginx-init.conf
```

#### Шаг 5: Запуск приложения

```bash
# Сборка и запуск
docker compose build --no-cache
docker compose up -d

# Ожидание готовности БД
docker compose run --rm app npm run db:wait

# Миграции
docker compose exec -T app npx prisma migrate deploy

# Опционально: seed
docker compose exec -T app npm run db:seed

# Проверка
curl http://localhost:3000/api/health
```

---

## C) NGINX: Host-level vs In-Compose

### C1) Host-level nginx (РЕКОМЕНДУЕТСЯ)

**Преимущества:**
- Проще управление сертификатами (certbot на хосте)
- Меньше сложности в compose
- Легче отладка
- Можно обслуживать несколько приложений

**Установка на хосте:**
```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx

# Конфиг
sudo nano /etc/nginx/sites-available/tipsio
```

**Конфиг `/etc/nginx/sites-available/tipsio`:**
```nginx
upstream tipsio_app {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name YOUR_DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name YOUR_DOMAIN;

    ssl_certificate /etc/letsencrypt/live/YOUR_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/YOUR_DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    client_max_body_size 10M;

    location / {
        proxy_pass http://tipsio_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }
}
```

```bash
# Активация
sudo ln -s /etc/nginx/sites-available/tipsio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL через certbot
sudo certbot --nginx -d YOUR_DOMAIN
```



### C2) Nginx в Docker Compose

**Преимущества:**
- Всё в одном месте
- Портативность
- Единый docker compose up

**docker-compose.prod.yml (override):**
```yaml
version: "3.8"

services:
  app:
    ports: []  # Убираем внешний порт, только через nginx
    expose:
      - "3000"

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      app:
        condition: service_healthy
    networks:
      - tipsio-network
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s
      timeout: 5s
      retries: 3

  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
    networks:
      - tipsio-network
```

**Запуск:**
```bash
# Первый раз (без SSL)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d nginx

# Получение сертификата
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot \
  certonly --webroot --webroot-path=/var/www/certbot \
  --email YOUR_EMAIL -d YOUR_DOMAIN --agree-tos --no-eff-email

# Перезапуск с SSL
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## D) REQUIRED ENV VARS & SECRET GENERATION

### Шаблон .env.prod

```bash
# ============================================
# DATABASE (PostgreSQL)
# ============================================
DB_HOST=db
DB_PORT=5432
DB_USER=tipsio
DB_PASSWORD=<СГЕНЕРИРОВАТЬ: openssl rand -base64 24>
DB_NAME=tipsio
# DATABASE_URL формируется автоматически в docker-compose

# ============================================
# NEXTAUTH
# ============================================
NEXTAUTH_SECRET=<СГЕНЕРИРОВАТЬ: openssl rand -base64 32>
NEXTAUTH_URL=https://YOUR_DOMAIN

# ============================================
# ENCRYPTION (256-bit key)
# ============================================
ENCRYPTION_KEY=<СГЕНЕРИРОВАТЬ: openssl rand -hex 32>

# ============================================
# MIDTRANS (ВРУЧНУЮ из dashboard)
# ============================================
MIDTRANS_SERVER_KEY=<ВАШ_SERVER_KEY>
MIDTRANS_CLIENT_KEY=<ВАШ_CLIENT_KEY>
MIDTRANS_IS_PRODUCTION=true  # false для sandbox

# ============================================
# EMAIL (Resend) - опционально
# ============================================
RESEND_API_KEY=

# ============================================
# SMS (Twilio) - опционально
# ============================================
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### Команды генерации секретов

```bash
# Все секреты одной командой
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)"
echo "DB_PASSWORD=$(openssl rand -base64 24)"

# Или через скрипт
./generate-secrets.sh
```

### Таблица переменных

| Переменная | Обязательна | Генерация | Описание |
|------------|-------------|-----------|----------|
| DB_USER | Да | Фиксированная | Пользователь PostgreSQL |
| DB_PASSWORD | Да | `openssl rand -base64 24` | Пароль БД |
| DB_NAME | Да | Фиксированная | Имя базы данных |
| NEXTAUTH_SECRET | Да | `openssl rand -base64 32` | Секрет для JWT |
| NEXTAUTH_URL | Да | Вручную | URL приложения с https:// |
| ENCRYPTION_KEY | Да | `openssl rand -hex 32` | 256-bit ключ шифрования |
| MIDTRANS_SERVER_KEY | Да | Из Midtrans Dashboard | Server key |
| MIDTRANS_CLIENT_KEY | Да | Из Midtrans Dashboard | Client key |
| MIDTRANS_IS_PRODUCTION | Да | `true`/`false` | Режим Midtrans |
| RESEND_API_KEY | Нет | Из Resend Dashboard | Email API |
| TWILIO_* | Нет | Из Twilio Dashboard | SMS API |

**⚠️ ВАЖНО:** Секреты уникальны для каждого окружения (dev/staging/prod)!

---

## E) DATABASE LIFECYCLE

### Порядок инициализации

```
1. PostgreSQL ready (healthcheck: pg_isready)
      ↓
2. prisma migrate deploy (применение миграций)
      ↓
3. prisma db seed (опционально, начальные данные)
      ↓
4. Application ready (healthcheck: /api/health)
```

### Команды

```bash
# В Docker
docker compose exec -T app npx prisma migrate deploy
docker compose exec -T app npm run db:seed

# Локально
npm run db:wait      # Ждать готовности БД
npm run db:push      # Применить схему (dev)
npm run db:seed      # Заполнить данными

# Полный сброс (dev only!)
npm run db:reset     # db:up -> db:wait -> db:reset:schema -> db:seed
```

### Бэкапы

```bash
# Создание бэкапа
docker exec tipsio-db-1 pg_dump -U tipsio tipsio > backup-$(date +%Y%m%d-%H%M%S).sql

# Восстановление
cat backup-20251231.sql | docker exec -i tipsio-db-1 psql -U tipsio -d tipsio

# Бэкап volumes (полный)
docker run --rm -v tipsio_postgres_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/postgres_data_backup.tar.gz -C /data .

docker run --rm -v tipsio_uploads_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/uploads_data_backup.tar.gz -C /data .
```

### Почему dummy DATABASE_URL в Dockerfile?

В Dockerfile используется `ARG DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"` потому что:
1. `prisma generate` требует DATABASE_URL для генерации клиента
2. На этапе build реальной БД нет
3. Клиент генерируется с типами из schema.prisma, а не из БД
4. Реальный DATABASE_URL передаётся в runtime через environment



---

## F) VERIFICATION CHECKLIST

### После деплоя проверить:

```bash
# 1. Контейнеры запущены
docker compose ps
# Ожидается: app (healthy), db (healthy)

# 2. Логи без ошибок
docker compose logs app --tail=50
docker compose logs db --tail=20

# 3. Health endpoint
curl -s https://YOUR_DOMAIN/api/health | jq
# Ожидается: {"status":"ok","checks":{"database":{"status":"ok"}}}

# 4. SSL сертификат
curl -vI https://YOUR_DOMAIN 2>&1 | grep -E "SSL|subject|expire"

# 5. Порты (на хосте)
sudo netstat -tlnp | grep -E "80|443|3000"
# или
sudo ss -tlnp | grep -E "80|443|3000"

# 6. UFW статус
sudo ufw status
# Должны быть открыты: 22, 80, 443
```

### Функциональные проверки:

- [ ] Главная страница загружается
- [ ] `/api/health` возвращает `{"status":"ok"}`
- [ ] Регистрация venue работает
- [ ] Логин работает (NextAuth)
- [ ] Dashboard venue загружается
- [ ] QR код генерируется
- [ ] Tip страница открывается по shortCode

### Проверка Midtrans:

```bash
# Проверить что ключи установлены
docker compose exec app env | grep MIDTRANS
# Должны быть MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY, MIDTRANS_IS_PRODUCTION
```

---

## G) TROUBLESHOOTING

### Prisma / Database

| Проблема | Причина | Решение |
|----------|---------|---------|
| `Can't reach database server` | БД не готова или неверный URL | Проверить `docker compose logs db`, ждать healthcheck |
| `Migration failed` | Конфликт схемы | `prisma migrate reset` (dev) или исправить миграцию |
| `P1001: Can't reach database` | Неверный DB_HOST в compose | Должен быть `db`, не `localhost` |
| `Permission denied` | Неверные права на volume | `chown -R 1001:1001` на volume |

```bash
# Проверка подключения к БД
docker compose exec db psql -U tipsio -d tipsio -c "SELECT 1"

# Сброс миграций (ОСТОРОЖНО - удалит данные!)
docker compose exec app npx prisma migrate reset --force
```

### NextAuth

| Проблема | Причина | Решение |
|----------|---------|---------|
| `NEXTAUTH_SECRET missing` | Не установлен секрет | Добавить в .env |
| `Callback URL mismatch` | NEXTAUTH_URL неверный | Должен совпадать с доменом |
| `JWT decode error` | Секрет изменился | Очистить cookies, перелогиниться |
| `CSRF token mismatch` | Проблема с cookies | Проверить NEXTAUTH_URL (https!) |

```bash
# Проверка переменных
docker compose exec app env | grep NEXTAUTH
```

### Midtrans

| Проблема | Причина | Решение |
|----------|---------|---------|
| `Invalid server key` | Неверный ключ | Проверить в Midtrans Dashboard |
| `Sandbox/Production mismatch` | Режим не совпадает | MIDTRANS_IS_PRODUCTION=true/false |
| `Transaction not found` | Webhook не дошёл | Проверить URL webhook в Midtrans |

### 502 / SSL / Nginx

| Проблема | Причина | Решение |
|----------|---------|---------|
| `502 Bad Gateway` | App не запущен или не на 3000 | `docker compose logs app` |
| `SSL handshake failed` | Сертификат не найден | Проверить пути в nginx.conf |
| `Connection refused` | Порт закрыт | `ufw allow 443/tcp` |
| `Cert expired` | Не обновился | `certbot renew` |

```bash
# Проверка nginx
sudo nginx -t
sudo systemctl status nginx

# Проверка сертификата
sudo certbot certificates
```

### Healthcheck fails

| Проблема | Причина | Решение |
|----------|---------|---------|
| App unhealthy | Приложение не стартовало | Смотреть логи app |
| DB unhealthy | PostgreSQL не готов | Смотреть логи db |
| `fetch failed` | Сеть внутри контейнера | Проверить networks в compose |

```bash
# Ручная проверка health изнутри контейнера
docker compose exec app node -e "fetch('http://localhost:3000/api/health').then(r=>r.json()).then(console.log)"
```

### Общие советы по производительности

1. **Минимум ресурсов**: 2 vCPU / 4GB RAM / 40GB SSD
2. **Масштабирование**: 
   - Горизонтальное: несколько app контейнеров + load balancer
   - Вертикальное: увеличить RAM/CPU
3. **БД**: Для >10k транзакций/день рассмотреть managed PostgreSQL
4. **CDN**: Для статики использовать Cloudflare/Vercel Edge

---

## H) SYSTEMD UNIT (опционально)

Для автозапуска docker compose при перезагрузке сервера:

```bash
sudo nano /etc/systemd/system/tipsio.service
```

```ini
[Unit]
Description=Tipsio Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/tipsio
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable tipsio
sudo systemctl start tipsio
sudo systemctl status tipsio
```

---

## Рекомендация

**Для production рекомендую: Host-level nginx (вариант C1)**

Причины:
1. Проще управление SSL (certbot --nginx автообновление)
2. Меньше движущихся частей в compose
3. Легче отладка проблем с SSL/proxy
4. Можно обслуживать несколько приложений на одном сервере

**Порядок деплоя:**
1. Подготовить сервер (user deploy, docker, ufw)
2. Сгенерировать секреты локально (`./generate-secrets.sh`)
3. Скопировать проект на сервер (rsync)
4. Создать .env с секретами и Midtrans ключами
5. Установить nginx на хосте + certbot
6. `docker compose up -d`
7. Применить миграции
8. Проверить /api/health

---

*Документ создан: 31 декабря 2025*
