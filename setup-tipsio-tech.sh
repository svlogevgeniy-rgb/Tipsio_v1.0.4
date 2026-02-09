
#!/bin/bash

# Скрипт для настройки домена tipsio.tech с SSL
# Использование: ./setup-tipsio-tech.sh

set -e

SERVER="root@31.130.155.71"
PASSWORD="yM*4r-ysQ+e2ag"
DOMAIN="tipsio.tech"
WWW_DOMAIN="www.tipsio.tech"

echo "=== Настройка домена $DOMAIN ==="
echo ""

# Проверка DNS
echo "1. Проверка DNS..."
CURRENT_IP=$(dig +short $DOMAIN | head -n1)
echo "Текущий IP для $DOMAIN: $CURRENT_IP"
echo "Требуемый IP: 31.130.155.71"

if [ "$CURRENT_IP" != "31.130.155.71" ]; then
    echo ""
    echo "⚠️  ВНИМАНИЕ: DNS еще не настроен!"
    echo ""
    echo "Пожалуйста, настройте DNS A-записи:"
    echo "  - $DOMAIN → 31.130.155.71"
    echo "  - $WWW_DOMAIN → 31.130.155.71"
    echo ""
    read -p "Нажмите Enter после настройки DNS для продолжения..."
    
    # Повторная проверка
    CURRENT_IP=$(dig +short $DOMAIN | head -n1)
    if [ "$CURRENT_IP" != "31.130.155.71" ]; then
        echo "❌ DNS все еще не настроен. Подождите распространения DNS (5-30 минут)"
        exit 1
    fi
fi

echo "✅ DNS настроен правильно"
echo ""

# Создание конфигурации Nginx
echo "2. Создание конфигурации Nginx..."
cat > /tmp/tipsio-tech.conf << 'EOF'
server {
    listen 80;
    server_name tipsio.tech www.tipsio.tech;

    client_max_body_size 10M;

    # Для certbot
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

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
EOF

# Загрузка конфигурации на сервер
echo "3. Загрузка конфигурации на сервер..."
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no /tmp/tipsio-tech.conf $SERVER:/tmp/

# Установка конфигурации
echo "4. Установка конфигурации Nginx..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER << 'ENDSSH'
# Backup старой конфигурации
if [ -f /etc/nginx/sites-available/tipsio ]; then
    sudo cp /etc/nginx/sites-available/tipsio /etc/nginx/sites-available/tipsio.backup
fi

# Установка новой конфигурации
sudo mv /tmp/tipsio-tech.conf /etc/nginx/sites-available/tipsio

# Создать директорию для certbot
sudo mkdir -p /var/www/certbot

# Проверка конфигурации
sudo nginx -t

# Перезагрузка Nginx
sudo systemctl reload nginx
ENDSSH

echo "✅ Конфигурация Nginx установлена"
echo ""

# Установка Certbot
echo "5. Проверка установки Certbot..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER << 'ENDSSH'
if ! command -v certbot &> /dev/null; then
    echo "Установка Certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
else
    echo "Certbot уже установлен"
fi
ENDSSH

echo "✅ Certbot готов"
echo ""

# Получение SSL сертификата
echo "6. Получение SSL сертификата..."
echo "Это может занять минуту..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER << 'ENDSSH'
sudo certbot --nginx \
  -d tipsio.tech \
  -d www.tipsio.tech \
  --non-interactive \
  --agree-tos \
  --email admin@tipsio.tech \
  --redirect
ENDSSH

echo "✅ SSL сертификат получен"
echo ""

# Обновление NEXTAUTH_URL
echo "7. Обновление NEXTAUTH_URL..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER << 'ENDSSH'
cd /var/www/tipsio
if [ -f .env.production ]; then
    sed -i 's|NEXTAUTH_URL=.*|NEXTAUTH_URL="https://tipsio.tech"|' .env.production
    echo "NEXTAUTH_URL обновлен:"
    grep NEXTAUTH_URL .env.production
else
    echo "⚠️  Файл .env.production не найден"
fi
ENDSSH

echo ""

# Перезапуск приложения
echo "8. Перезапуск приложения..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER << 'ENDSSH'
cd /var/www/tipsio
pm2 restart tipsio
pm2 status
ENDSSH

echo ""
echo "✅ Настройка завершена!"
echo ""
echo "=== Проверка ==="
echo ""
echo "1. HTTP редирект:"
echo "   curl -I http://tipsio.tech"
echo ""
echo "2. HTTPS доступ:"
echo "   curl -I https://tipsio.tech"
echo ""
echo "3. Откройте в браузере:"
echo "   https://tipsio.tech"
echo ""
echo "4. Проверьте SSL рейтинг:"
echo "   https://www.ssllabs.com/ssltest/analyze.html?d=tipsio.tech"
echo ""
