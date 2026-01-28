#!/bin/bash

# Tipsio Update Deployment Script
# Repository: https://github.com/svlogevgeniy-rgb/Tipsio_dev_1

set -euo pipefail

SERVER="${DEPLOY_SERVER:?Error: DEPLOY_SERVER environment variable is required}"
USER="${DEPLOY_USER:-root}"
APP_DIR="${DEPLOY_APP_DIR:-/opt/tipsio}"
REPO_URL="${DEPLOY_REPO_URL:-https://github.com/svlogevgeniy-rgb/Tipsio_dev_1.git}"

echo "🚀 Starting Tipsio deployment to ${SERVER}..."
echo "📡 Connecting to server..."

# Execute deployment commands on server
ssh "${USER}@${SERVER}" "bash -s" << ENDSSH
set -euo pipefail

APP_DIR="${APP_DIR}"
REPO_URL="${REPO_URL}"

echo "📂 Checking if project directory exists..."
if [ -d "\${APP_DIR}" ]; then
    echo "🗑️  Removing old project files..."
    rm -rf "\${APP_DIR}"
fi

echo "📁 Creating fresh project directory..."
mkdir -p "\${APP_DIR}"
cd "\${APP_DIR}"

echo "📥 Cloning repository from GitHub..."
git clone "\${REPO_URL}" .

echo "🔧 Setting up environment..."
# Check if .env exists, if not create from example
if [ ! -f .env ]; then
    if [ -f .env.production.example ]; then
        echo "📝 Creating .env from .env.production.example..."
        cp .env.production.example .env
        echo "⚠️  WARNING: Please configure .env file with production values!"
    else
        echo "⚠️  WARNING: No .env file found. Please create one manually."
    fi
fi

echo "🛑 Stopping any running containers..."
docker-compose down || true

echo "🏗️  Building new containers (no cache)..."
docker-compose build --no-cache

echo "🚀 Starting containers..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 15

echo "🗄️  Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy || echo "⚠️  Migration failed or no migrations to run"

echo "✅ Checking container status..."
docker-compose ps

echo "📊 Checking application logs (last 30 lines)..."
docker-compose logs --tail=30 app

echo ""
echo "✅ Deployment complete!"
echo "🌐 Application should be running now"
echo ""
echo "📝 Next steps:"
echo "   1. Check .env file and configure production values"
echo "   2. Verify application is accessible"
echo "   3. Check logs: docker-compose logs -f"

ENDSSH

echo ""
echo "🎉 Done! Deployment completed successfully."
echo ""
echo "To check the application:"
echo "  ssh ${USER}@${SERVER}"
echo "  cd ${APP_DIR}"
echo "  docker-compose ps"
echo "  docker-compose logs -f"
