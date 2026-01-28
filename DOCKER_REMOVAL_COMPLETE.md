# Docker Removal - Complete

## Задача

Убрать Docker из архитектуры проекта для экономии RAM на VPS с одним приложением.

## Выполненные изменения

### 1. Создана документация для деплоя без Docker

**Новые файлы:**
- `DEPLOYMENT_GUIDE_NO_DOCKER.md` - полное руководство по деплою
- `ecosystem.config.js` - конфигурация PM2
- `deploy-no-docker.sh` - скрипт автоматического деплоя
- `backup-db.sh` - скрипт резервного копирования БД
- `nginx.conf.example` - пример конфигурации Nginx

### 2. Архивированы Docker-файлы

**Перемещено в `docker-archive/`:**
- `Dockerfile`
- `docker-compose.yml`
- `docker-compose.local.yml`
- `docker-compose.prod.yml`
- `deploy.sh` (старый скрипт с Docker)
- `deploy-to-server.sh`
- `nginx.conf` (для Docker Compose)

**Создан:** `docker-archive/README.md` с объяснением

### 3. Обновлен package.json

**Удалены скрипты:**
- `db:up` - запуск PostgreSQL через Docker
- `db:stop` - остановка PostgreSQL
- `db:wait` - ожидание готовности БД в Docker
- `db:init` - инициализация через Docker
- `db:reset` - сброс через Docker
- `init-db` - алиас
- `reset-db` - алиас

**Добавлены скрипты:**
- `db:migrate` - применение миграций (для production)
- `db:generate` - генерация Prisma Client

### 4. Обновлен DEPLOYMENT_GUIDE.md

Главный deployment guide теперь:
- Указывает на `DEPLOYMENT_GUIDE_NO_DOCKER.md` как основной источник
- Содержит краткую инструкцию для локальной разработки
- Объясняет причины отказа от Docker
- Ссылается на архив Docker-файлов

## Новая архитектура деплоя

### Production:
```
VPS Server
├── Node.js 20.18+ (нативно)
├── PostgreSQL 15+ (нативно)
├── PM2 (управление процессом)
└── Nginx (reverse proxy + SSL)
```

### Локальная разработка:
```
Developer Machine
├── Node.js 20.18+
├── PostgreSQL (через Homebrew/apt)
└── npm run dev
```

## Преимущества нового подхода

### Экономия ресурсов:
- **RAM**: ~200-300MB экономии (нет Docker overhead)
- **CPU**: меньше нагрузка на процессор
- **Disk**: не нужны Docker volumes

### Упрощение:
- Прямой доступ к логам (не через `docker logs`)
- Быстрее запуск приложения
- Проще отладка проблем
- Меньше движущихся частей

### Производительность:
- Нет overhead от контейнеризации
- Прямой доступ к файловой системе
- Быстрее I/O операции

## Инструкции по деплою

### Автоматический деплой:

```bash
# На сервере
cd /var/www/tipsio
./deploy-no-docker.sh
```

### Ручной деплой:

```bash
# 1. Клонирование
git clone https://github.com/svlogevgeniy-rgb/Tipsio_v1.0.4.git /var/www/tipsio

# 2. Установка зависимостей
cd /var/www/tipsio
npm ci --production=false

# 3. Настройка .env.production
cp .env.production.example .env.production
nano .env.production

# 4. Миграции
npx prisma generate
npx prisma migrate deploy

# 5. Сборка
npm run build

# 6. Запуск через PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Локальная разработка

### Установка PostgreSQL:

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
createdb tipsio_dev
```

**Ubuntu/Debian:**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb tipsio_dev
```

### Запуск проекта:

```bash
npm install --legacy-peer-deps
cp .env.example .env
# Отредактировать DATABASE_URL в .env
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

## Проверка работоспособности

### Production:
```bash
# Статус PM2
pm2 status

# Логи
pm2 logs tipsio

# Health check
curl https://yourdomain.com/api/health
```

### Development:
```bash
# Health check
curl http://localhost:3000/api/health
```

## Откат к Docker (если понадобится)

Если в будущем понадобится вернуть Docker:

```bash
# Восстановить файлы из архива
cp docker-archive/* .

# Обновить package.json (добавить db:up, db:init и т.д.)

# Запустить
docker compose up -d
```

## Документация

- [DEPLOYMENT_GUIDE_NO_DOCKER.md](./DEPLOYMENT_GUIDE_NO_DOCKER.md) - полное руководство
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - обновленный главный guide
- [ecosystem.config.js](./ecosystem.config.js) - конфигурация PM2
- [deploy-no-docker.sh](./deploy-no-docker.sh) - скрипт деплоя
- [backup-db.sh](./backup-db.sh) - бэкап БД
- [nginx.conf.example](./nginx.conf.example) - пример Nginx
- [docker-archive/README.md](./docker-archive/README.md) - о Docker-архиве

## Следующие шаги

1. ✅ Docker-файлы архивированы
2. ✅ Документация создана
3. ✅ package.json обновлен
4. ✅ DEPLOYMENT_GUIDE.md обновлен
5. ⏳ Протестировать деплой на сервере
6. ⏳ Обновить CI/CD (если используется)

## Заметки

- Все секреты генерируются через `openssl rand`
- PM2 автоматически перезапускает приложение при сбоях
- Nginx обрабатывает SSL через Let's Encrypt
- PostgreSQL работает нативно на сервере
- Логи доступны через `pm2 logs` и `/var/log/nginx/`

---

**Статус**: ✅ Завершено  
**Дата**: 27 января 2026  
**Экономия RAM**: ~200-300MB  
**Упрощение архитектуры**: Да
