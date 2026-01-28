#!/bin/bash

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Параметры сервера
SERVER_IP="31.130.155.71"
SERVER_USER="root"
SERVER_PASSWORD="yM*4r-ysQ+e2ag"
PROJECT_DIR="/var/www/tipsio"
DOMAIN="tipsio.ru"

echo -e "${GREEN}🚀 Starting deployment to production server${NC}"
echo "Server: $SERVER_IP"
echo "Project directory: $PROJECT_DIR"
echo ""

# Функция для выполнения команд на сервере
ssh_exec() {
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$@"
}

# Функция для копирования файлов
scp_copy() {
    sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no "$@"
}

echo -e "${YELLOW}📋 Step 1: Checking server requirements${NC}"
ssh_exec "apt update && apt install -y curl git"

echo -e "${YELLOW}📋 Step 2: Installing Node.js 20${NC}"
ssh_exec "curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs"
ssh_exec "node --version && npm --version"

echo -e "${YELLOW}📋 Step 3: Installing PostgreSQL${NC}"
ssh_exec "apt install -y postgresql postgresql-contrib"
ssh_exec "systemctl start postgresql && systemctl enable postgresql"

echo -e "${YELLOW}📋 Step 4: Creating database${NC}"
ssh_exec "sudo -u postgres psql -c \"CREATE DATABASE tipsio_prod;\" || echo 'Database already exists'"
ssh_exec "sudo -u postgres psql -c \"CREATE USER tipsio_user WITH ENCRYPTED PASSWORD 'tipsio_secure_pass_2026';\" || echo 'User already exists'"
ssh_exec "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE tipsio_prod TO tipsio_user;\""
ssh_exec "sudo -u postgres psql -c \"ALTER DATABASE tipsio_prod OWNER TO tipsio_user;\""

echo -e "${YELLOW}📋 Step 5: Installing PM2${NC}"
ssh_exec "npm install -g pm2"

echo -e "${YELLOW}📋 Step 6: Installing Nginx${NC}"
ssh_exec "apt install -y nginx"
ssh_exec "systemctl start nginx && systemctl enable nginx"

echo -e "${YELLOW}📋 Step 7: Creating project directory${NC}"
ssh_exec "mkdir -p $PROJECT_DIR"

echo -e "${YELLOW}📋 Step 8: Copying project files${NC}"
sshpass -p "$SERVER_PASSWORD" rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude 'docker-archive' \
  --exclude '.env' \
  --exclude '.env.local' \
  --exclude '.env.production' \
  -e "ssh -o StrictHostKeyChecking=no" \
  ./ "$SERVER_USER@$SERVER_IP:$PROJECT_DIR/"

echo -e "${YELLOW}📋 Step 9: Generating secrets${NC}"
NEXTAUTH_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)

echo -e "${YELLOW}📋 Step 10: Creating .env.production${NC}"
cat > /tmp/env.production << EOF
# Database
DATABASE_URL="postgresql://tipsio_user:tipsio_secure_pass_2026@localhost:5432/tipsio_prod"

# NextAuth
NEXTAUTH_URL="http://$SERVER_IP"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"

# Encryption
ENCRYPTION_KEY="$ENCRYPTION_KEY"

# Midtrans (нужно будет добавить вручную)
MIDTRANS_SERVER_KEY=""
MIDTRANS_CLIENT_KEY=""
MIDTRANS_IS_PRODUCTION="false"

# App
NODE_ENV="production"
PORT=3000
EOF

scp_copy /tmp/env.production "$SERVER_USER@$SERVER_IP:$PROJECT_DIR/.env.production"
rm /tmp/env.production

echo -e "${YELLOW}📋 Step 11: Installing dependencies${NC}"
ssh_exec "cd $PROJECT_DIR && npm ci --production=false"

echo -e "${YELLOW}📋 Step 12: Running database migrations${NC}"
ssh_exec "cd $PROJECT_DIR && npx prisma generate"
ssh_exec "cd $PROJECT_DIR && npx prisma migrate deploy"

echo -e "${YELLOW}📋 Step 13: Building application${NC}"
ssh_exec "cd $PROJECT_DIR && npm run build"

echo -e "${YELLOW}📋 Step 14: Creating logs directory${NC}"
ssh_exec "mkdir -p $PROJECT_DIR/logs"

echo -e "${YELLOW}📋 Step 15: Starting application with PM2${NC}"
ssh_exec "cd $PROJECT_DIR && pm2 delete tipsio || true"
ssh_exec "cd $PROJECT_DIR && pm2 start ecosystem.config.js"
ssh_exec "pm2 save"
ssh_exec "pm2 startup systemd -u root --hp /root | tail -1 | bash"

echo -e "${YELLOW}📋 Step 16: Configuring Nginx${NC}"
cat > /tmp/nginx-tipsio << 'NGINX_EOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

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
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /_next/static {
        proxy_pass http://localhost:3000;
        expires 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
NGINX_EOF

scp_copy /tmp/nginx-tipsio "$SERVER_USER@$SERVER_IP:/etc/nginx/sites-available/tipsio"
rm /tmp/nginx-tipsio

ssh_exec "ln -sf /etc/nginx/sites-available/tipsio /etc/nginx/sites-enabled/tipsio"
ssh_exec "rm -f /etc/nginx/sites-enabled/default"
ssh_exec "nginx -t && systemctl reload nginx"

echo -e "${YELLOW}📋 Step 17: Configuring firewall${NC}"
ssh_exec "ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp"
ssh_exec "ufw --force enable || true"

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo -e "${GREEN}📊 Application status:${NC}"
ssh_exec "pm2 status"
echo ""
echo -e "${GREEN}🌐 Application URL: http://$SERVER_IP${NC}"
echo ""
echo -e "${YELLOW}⚠️  ВАЖНО: Добавьте Midtrans ключи в .env.production:${NC}"
echo "   ssh root@$SERVER_IP"
echo "   nano $PROJECT_DIR/.env.production"
echo "   pm2 restart tipsio"
echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
