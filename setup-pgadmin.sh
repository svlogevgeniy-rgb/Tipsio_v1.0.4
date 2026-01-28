#!/bin/bash

set -e

SERVER_IP="31.130.155.71"
SERVER_USER="root"
SERVER_PASS="yM*4r-ysQ+e2ag"

echo "🔧 Настройка pgAdmin на сервере..."

sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'ENDSSH'

# Остановим Apache
systemctl stop apache2 2>/dev/null || true
systemctl disable apache2 2>/dev/null || true

# Создадим конфигурационный файл pgAdmin
cat > /usr/pgadmin4/web/config_local.py << 'EOF'
import os

# Server Mode
SERVER_MODE = True

# Default server port
DEFAULT_SERVER = '0.0.0.0'
DEFAULT_SERVER_PORT = 5050

# SQLite database path
SQLITE_PATH = '/var/lib/pgadmin/pgadmin4.db'

# Session database path
SESSION_DB_PATH = '/var/lib/pgadmin/sessions'

# Storage Manager
STORAGE_DIR = '/var/lib/pgadmin/storage'

# Log file
LOG_FILE = '/var/log/pgadmin/pgadmin4.log'

# Master password is not required
MASTER_PASSWORD_REQUIRED = False

# Security
ENHANCED_COOKIE_PROTECTION = True
EOF

# Создадим необходимые директории
mkdir -p /var/lib/pgadmin
mkdir -p /var/log/pgadmin
chown -R www-data:www-data /var/lib/pgadmin
chown -R www-data:www-data /var/log/pgadmin

# Инициализируем БД pgAdmin вручную
cd /usr/pgadmin4/web
python3 << 'PYEOF'
import os
os.environ['PGADMIN_SETUP_EMAIL'] = 'admin@tipsio.id'
os.environ['PGADMIN_SETUP_PASSWORD'] = 'Admin123!'

from pgadmin import create_app
from pgadmin.model import db, User, ServerGroup, Server, Role
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # Создаем таблицы
    db.create_all()
    
    # Создаем администратора
    admin_email = 'admin@tipsio.id'
    admin_password = 'Admin123!'
    
    # Проверяем, существует ли пользователь
    user = User.query.filter_by(email=admin_email).first()
    
    if not user:
        # Создаем роль администратора
        admin_role = Role.query.filter_by(name='Administrator').first()
        if not admin_role:
            admin_role = Role(name='Administrator')
            db.session.add(admin_role)
            db.session.commit()
        
        # Создаем пользователя
        user = User(
            email=admin_email,
            password=generate_password_hash(admin_password),
            active=True,
            roles=[admin_role]
        )
        db.session.add(user)
        db.session.commit()
        print(f"✅ Создан администратор: {admin_email}")
    else:
        print(f"✅ Администратор уже существует: {admin_email}")

print("✅ База данных pgAdmin инициализирована")
PYEOF

# Настроим Nginx для pgAdmin
cat > /etc/nginx/sites-available/pgadmin << 'EOF'
server {
    listen 5050;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:5050;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Активируем конфигурацию
ln -sf /etc/nginx/sites-available/pgadmin /etc/nginx/sites-enabled/pgadmin

# Проверим и перезагрузим Nginx
nginx -t && systemctl reload nginx

# Создадим systemd service для pgAdmin
cat > /etc/systemd/system/pgadmin4.service << 'EOF'
[Unit]
Description=pgAdmin 4
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/usr/pgadmin4/web
Environment="PYTHONPATH=/usr/pgadmin4/web"
ExecStart=/usr/pgadmin4/venv/bin/python3 /usr/pgadmin4/web/pgAdmin4.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Запустим pgAdmin
systemctl daemon-reload
systemctl enable pgadmin4
systemctl start pgadmin4

# Откроем порт 5050 в firewall
ufw allow 5050/tcp

echo "✅ pgAdmin настроен и запущен"
echo ""
echo "📊 Доступ к pgAdmin:"
echo "  URL: http://31.130.155.71:5050"
echo "  Email: admin@tipsio.id"
echo "  Password: Admin123!"
echo ""
echo "📝 Для подключения к БД используйте:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: tipsio_prod"
echo "  Username: tipsio_user"
echo "  Password: tipsio_secure_pass_2026"

ENDSSH

echo ""
echo "✅ Настройка завершена!"
echo ""
echo "🌐 pgAdmin доступен по адресу: http://31.130.155.71:5050"
echo "📧 Email: admin@tipsio.id"
echo "🔑 Password: Admin123!"
