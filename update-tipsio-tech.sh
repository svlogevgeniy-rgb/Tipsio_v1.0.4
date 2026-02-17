#!/bin/bash

# Скрипт для обновления tipsio.tech из GitHub репозитория
# Использование: ./update-tipsio-tech.sh [branch]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Параметры сервера
SERVER_IP="31.130.155.71"
SERVER_USER="root"
SERVER_PASSWORD="yM*4r-ysQ+e2ag"
PROJECT_DIR="/var/www/tipsio"
GITHUB_REPO="https://github.com/svlogevgeniy-rgb/Tipsio_v1.0.4"
BRANCH="${1:-server-sync/2026-02-08}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 Updating tipsio.tech from GitHub                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Server:${NC} $SERVER_IP"
echo -e "${GREEN}Project directory:${NC} $PROJECT_DIR"
echo -e "${GREEN}Repository:${NC} $GITHUB_REPO"
echo -e "${GREEN}Branch:${NC} $BRANCH"
echo ""

# Функция для выполнения команд на сервере
ssh_exec() {
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$@"
}

# Проверка доступности сервера
echo -e "${YELLOW}📡 Step 1: Checking server connection...${NC}"
if ! ssh_exec "echo 'Server is reachable'"; then
    echo -e "${RED}❌ Cannot connect to server${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Server connection OK${NC}"
echo ""

# Создание бэкапа
echo -e "${YELLOW}💾 Step 2: Creating backup...${NC}"
BACKUP_NAME="tipsio_backup_$(date +%Y%m%d_%H%M%S)"
ssh_exec "cd $PROJECT_DIR && tar -czf /tmp/$BACKUP_NAME.tar.gz --exclude='node_modules' --exclude='.next' ."
echo -e "${GREEN}✅ Backup created: /tmp/$BACKUP_NAME.tar.gz${NC}"
echo ""

# Остановка приложения
echo -e "${YELLOW}⏸️  Step 3: Stopping application...${NC}"
ssh_exec "pm2 stop tipsio || true"
echo -e "${GREEN}✅ Application stopped${NC}"
echo ""

# Обновление кода из GitHub
echo -e "${YELLOW}📥 Step 4: Pulling latest code from GitHub...${NC}"
ssh_exec "cd $PROJECT_DIR && git fetch origin $BRANCH"
ssh_exec "cd $PROJECT_DIR && git reset --hard origin/$BRANCH"
echo -e "${GREEN}✅ Code updated from GitHub${NC}"
echo ""

# Установка зависимостей
echo -e "${YELLOW}📦 Step 5: Installing dependencies...${NC}"
ssh_exec "cd $PROJECT_DIR && rm -rf node_modules package-lock.json"
ssh_exec "cd $PROJECT_DIR && npm install"
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Генерация Prisma клиента
echo -e "${YELLOW}🔧 Step 6: Generating Prisma client...${NC}"
ssh_exec "cd $PROJECT_DIR && npx prisma generate"
echo -e "${GREEN}✅ Prisma client generated${NC}"
echo ""

# Применение миграций базы данных
echo -e "${YELLOW}🗄️  Step 7: Running database migrations...${NC}"
ssh_exec "cd $PROJECT_DIR && npx prisma migrate deploy"
echo -e "${GREEN}✅ Database migrations applied${NC}"
echo ""

# Сборка приложения
echo -e "${YELLOW}🏗️  Step 8: Building application...${NC}"
ssh_exec "cd $PROJECT_DIR && npm run build"
echo -e "${GREEN}✅ Application built${NC}"
echo ""

# Запуск приложения
echo -e "${YELLOW}▶️  Step 9: Starting application...${NC}"
ssh_exec "cd $PROJECT_DIR && pm2 restart tipsio"
ssh_exec "pm2 save"
echo -e "${GREEN}✅ Application started${NC}"
echo ""

# Проверка статуса
echo -e "${YELLOW}📊 Step 10: Checking application status...${NC}"
ssh_exec "pm2 status"
echo ""

# Проверка логов
echo -e "${YELLOW}📝 Step 11: Checking recent logs...${NC}"
ssh_exec "pm2 logs tipsio --lines 20 --nostream"
echo ""

# Проверка доступности
echo -e "${YELLOW}🌐 Step 12: Checking application availability...${NC}"
sleep 5
if curl -s -o /dev/null -w "%{http_code}" https://tipsio.tech | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Application is accessible at https://tipsio.tech${NC}"
else
    echo -e "${YELLOW}⚠️  Application may still be starting up...${NC}"
fi
echo ""

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ✅ Update completed successfully!                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}🌐 Application URL:${NC} https://tipsio.tech"
echo -e "${GREEN}💾 Backup location:${NC} /tmp/$BACKUP_NAME.tar.gz"
echo ""
echo -e "${YELLOW}📋 Useful commands:${NC}"
echo "   View logs:    ssh root@$SERVER_IP 'pm2 logs tipsio'"
echo "   Restart app:  ssh root@$SERVER_IP 'pm2 restart tipsio'"
echo "   Rollback:     ssh root@$SERVER_IP 'cd $PROJECT_DIR && tar -xzf /tmp/$BACKUP_NAME.tar.gz && pm2 restart tipsio'"
echo ""
