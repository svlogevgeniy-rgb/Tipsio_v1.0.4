#!/bin/bash

# Tipsio Deployment Script
# Usage: ./deploy.sh
# 
# Required environment variables:
#   DEPLOY_SERVER - Server IP or hostname
#   DEPLOY_USER - SSH user (default: deploy)
#   DEPLOY_DOMAIN - Domain name (default: app.example.com)

set -euo pipefail

SERVER="${DEPLOY_SERVER:?Error: DEPLOY_SERVER environment variable is required}"
USER="${DEPLOY_USER:-deploy}"
DOMAIN="${DEPLOY_DOMAIN:-app.example.com}"
APP_DIR="/opt/tipsio"

echo "🚀 Starting Tipsio deployment..."

# Create app directory on server
ssh "${USER}@${SERVER}" "mkdir -p ${APP_DIR}"

# Copy files to server
echo "📦 Copying files to server..."
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  ./ "${USER}@${SERVER}:${APP_DIR}/"

# Deploy on server
ssh "${USER}@${SERVER}" "DOMAIN=${DOMAIN} APP_DIR=${APP_DIR} bash -s" << 'ENDSSH'
set -euo pipefail

cd "${APP_DIR}"

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "📥 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose plugin or binary if not available
if ! docker compose version >/dev/null 2>&1 && ! command -v docker-compose >/dev/null 2>&1; then
    echo "📥 Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

if docker compose version >/dev/null 2>&1; then
    COMPOSE_IS_PLUGIN=1
elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_IS_PLUGIN=0
else
    echo "❌ Docker Compose is required but not installed" >&2
    exit 1
fi

compose() {
    if [ "${COMPOSE_IS_PLUGIN}" -eq 1 ]; then
        docker compose "$@"
    else
        docker-compose "$@"
    fi
}

wait_for_app_health() {
    local max_attempts=20
    local attempt=1
    while [ "${attempt}" -le "${max_attempts}" ]; do
        if compose exec -T app node -e "fetch('http://localhost:3000/api/health').then(res => process.exit(res.ok ? 0 : 1)).catch(() => process.exit(1))"; then
            echo "✅ Application passed health check"
            return 0
        fi
        echo "⏳ Waiting for application health (${attempt}/${max_attempts})..."
        sleep 5
        attempt=$((attempt + 1))
    done
    echo "❌ Application failed health checks" >&2
    exit 1
}

# Create .env file if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Generated secrets - DO NOT COMMIT
NEXTAUTH_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -base64 24)
DB_USER=tipsio
DB_NAME=tipsio

# Payment gateway - MUST BE CONFIGURED
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# Domain
NEXTAUTH_URL=https://${DOMAIN}
EOF
    echo "⚠️  Please edit .env file with your Midtrans keys!"
fi

# Create nginx config for initial cert
cat > nginx-init.conf << NGINX
events {
    worker_connections 1024;
}
http {
    server {
        listen 80;
        server_name ${DOMAIN};
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        location / {
            return 200 'Tipsio is being configured...';
            add_header Content-Type text/plain;
        }
    }
}
NGINX

# Create certbot directories
mkdir -p certbot/conf certbot/www

# Start nginx for cert generation
echo "🔐 Getting SSL certificate..."
docker run -d --name nginx-init -p 80:80 \
    -v $(pwd)/nginx-init.conf:/etc/nginx/nginx.conf:ro \
    -v $(pwd)/certbot/www:/var/www/certbot:ro \
    nginx:alpine

sleep 3

# Get certificate
docker run --rm \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    -v $(pwd)/certbot/www:/var/www/certbot \
    certbot/certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@example.com \
    --agree-tos \
    --no-eff-email \
    -d ${DOMAIN}

# Stop init nginx
docker stop nginx-init && docker rm nginx-init
rm nginx-init.conf

# Build and start services
echo "🏗️  Building and starting services..."
compose down || true
compose build --no-cache
compose up -d

echo "⏳ Waiting for database..."
compose run --rm app npm run db:wait

echo "🩺 Running application health checks..."
wait_for_app_health

# Run migrations
echo "🗄️  Running database migrations..."
compose exec -T app npx prisma migrate deploy

echo "✅ Deployment complete!"
echo "🌐 Visit https://${DOMAIN}"
ENDSSH

echo "🎉 Done!"
