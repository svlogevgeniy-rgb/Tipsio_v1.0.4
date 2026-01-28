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
