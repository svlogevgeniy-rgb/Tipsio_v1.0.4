# Tipsio Deployment Guide

> **⚠️ ВАЖНО**: Этот проект больше не использует Docker для экономии ресурсов сервера.
> 
> **Для деплоя используйте**: [DEPLOYMENT_GUIDE_NO_DOCKER.md](./DEPLOYMENT_GUIDE_NO_DOCKER.md)
>
> Старые Docker-файлы перемещены в папку `docker-archive/` для справки.

## Обзор стека

- **Runtime**: Node.js 20.18, npm >= 10.8
- **Framework**: Next.js 14.2 + React 18 + NextAuth v5 beta
- **ORM**: Prisma 7 + PostgreSQL 15+
- **UI**: Tailwind CSS + Radix UI
- **Payments**: Midtrans SDK
- **Deployment**: PM2 + Nginx (без Docker)

---

## Локальная разработка

### Установка PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
createdb tipsio_dev
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb tipsio_dev
```

### Запуск проекта

```bash
# 1. Проверка версий
node -v  # v20.18.x
npm -v   # >= 10.8

# 2. Установка зависимостей
npm install --legacy-peer-deps

# 3. Настройка .env
cp .env.example .env
# Отредактируйте DATABASE_URL="postgresql://localhost:5432/tipsio_dev"

# 4. Миграции и seed
npx prisma generate
npx prisma db push
npm run db:seed

# 5. Запуск dev-сервера
npm run dev

# 6. Проверка
curl http://localhost:3000/api/health
```

---

## Production Deployment

**Полное руководство**: [DEPLOYMENT_GUIDE_NO_DOCKER.md](./DEPLOYMENT_GUIDE_NO_DOCKER.md)

### Краткая инструкция

1. **Подготовка сервера**: Ubuntu 20.04+, Node.js 20, PostgreSQL 14+, Nginx, PM2
2. **Клонирование**: `git clone` в `/var/www/tipsio`
3. **Настройка .env.production**: секреты, Midtrans ключи
4. **Установка зависимостей**: `npm ci --production=false`
5. **Миграции**: `npx prisma migrate deploy`
6. **Сборка**: `npm run build`
7. **Запуск через PM2**: `pm2 start ecosystem.config.js`
8. **Настройка Nginx**: reverse proxy на порт 3000
9. **SSL**: Let's Encrypt через certbot

**Автоматический деплой**: `./deploy-no-docker.sh`

---

## Почему без Docker?

### Преимущества:
- ✅ Экономия RAM (~200-300MB)
- ✅ Быстрее запуск приложения
- ✅ Проще отладка
- ✅ Прямой доступ к логам
- ✅ Нет overhead от контейнеризации

### Когда Docker был бы полезен:
- Несколько приложений на одном сервере
- Сложная микросервисная архитектура
- Необходимость изоляции окружений

Для VPS с одним приложением нативный подход эффективнее.

---

## Доступные npm скрипты

```bash
npm run dev              # Запуск dev-сервера
npm run build            # Сборка для production
npm start                # Запуск production сервера
npm run lint             # ESLint проверка
npm test                 # Запуск тестов
npm run db:seed          # Заполнение БД тестовыми данными
npm run db:push          # Применение схемы Prisma (dev)
npm run db:migrate       # Применение миграций (production)
npm run db:generate      # Генерация Prisma Client
```

---

## Архив Docker-файлов

Старые Docker-файлы находятся в `docker-archive/`:
- `Dockerfile`
- `docker-compose.yml`
- `docker-compose.local.yml`
- `docker-compose.prod.yml`
- `deploy.sh` (старый скрипт деплоя)
- `nginx.conf` (для Docker Compose)

Эти файлы сохранены для справки, но больше не используются в проекте.

---

## Дополнительная документация

- [DEPLOYMENT_GUIDE_NO_DOCKER.md](./DEPLOYMENT_GUIDE_NO_DOCKER.md) - Полное руководство по деплою
- [ecosystem.config.js](./ecosystem.config.js) - Конфигурация PM2
- [deploy-no-docker.sh](./deploy-no-docker.sh) - Скрипт автоматического деплоя
- [backup-db.sh](./backup-db.sh) - Скрипт резервного копирования БД
- [nginx.conf.example](./nginx.conf.example) - Пример конфигурации Nginx

---

*Обновлено: 27 января 2026*
