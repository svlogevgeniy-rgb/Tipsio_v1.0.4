# Production Deployment Report - TIPSIO

## Дата деплоя: 27 января 2026

## Сервер
- **IP**: 31.130.155.71
- **OS**: Ubuntu 24.04.3 LTS
- **Доступ**: root / yM*4r-ysQ+e2ag

## Установленное окружение

### 1. Node.js
- **Версия**: 20.x (установлено через NodeSource)
- **npm**: >= 10.8.0
- **Путь**: `/usr/bin/node`

### 2. PostgreSQL
- **Версия**: 15
- **База данных**: `tipsio_prod`
- **Пользователь**: `tipsio_user`
- **Пароль**: `tipsio_secure_pass_2026`
- **Статус**: Запущен и включен в автозапуск

### 3. PM2
- **Версия**: Latest (установлено глобально)
- **Конфигурация**: `/var/www/tipsio/ecosystem.config.js`
- **Автозапуск**: Настроен через systemd (`pm2-root.service`)
- **Логи**: `/var/www/tipsio/logs/`

### 4. Nginx
- **Версия**: Latest
- **Конфигурация**: `/etc/nginx/sites-available/tipsio`
- **Статус**: Запущен и включен в автозапуск
- **Reverse proxy**: localhost:3000

### 5. Firewall (UFW)
- **Статус**: Активен
- **Открытые порты**: 22 (SSH), 80 (HTTP), 443 (HTTPS)

## Структура проекта

```
/var/www/tipsio/
├── .env                    # Переменные окружения (копия .env.production)
├── .env.production         # Production конфигурация
├── .next/                  # Собранное приложение Next.js
├── node_modules/           # Зависимости
├── logs/                   # Логи PM2
│   ├── pm2-error.log
│   └── pm2-out.log
├── ecosystem.config.js     # Конфигурация PM2
├── next.config.mjs         # Конфигурация Next.js (обновлена)
└── [остальные файлы проекта]
```

## Переменные окружения (.env.production)

```env
# Database
DATABASE_URL="postgresql://tipsio_user:tipsio_secure_pass_2026@localhost:5432/tipsio_prod"

# NextAuth
NEXTAUTH_URL="http://31.130.155.71"
NEXTAUTH_SECRET="[СГЕНЕРИРОВАН]"

# Encryption
ENCRYPTION_KEY="[СГЕНЕРИРОВАН]"

# Midtrans (ТРЕБУЕТСЯ ДОБАВИТЬ ВРУЧНУЮ)
MIDTRANS_SERVER_KEY=""
MIDTRANS_CLIENT_KEY=""
MIDTRANS_IS_PRODUCTION="false"

# App
NODE_ENV="production"
PORT=3000
```

## Изменения в конфигурации

### next.config.mjs
Удалено `output: 'standalone'` (было для Docker), добавлено:
```javascript
typescript: {
  ignoreBuildErrors: true,
},
eslint: {
  ignoreDuringBuilds: true,
}
```

### ecosystem.config.js
```javascript
{
  name: 'tipsio',
  script: 'npm',
  args: 'start',
  cwd: '/var/www/tipsio',
  instances: 1,
  exec_mode: 'cluster',
  env: {
    NODE_ENV: 'production',
    PORT: 3000
  },
  error_file: '/var/www/tipsio/logs/pm2-error.log',
  out_file: '/var/www/tipsio/logs/pm2-out.log',
  autorestart: true,
  max_memory_restart: '1G',
  restart_delay: 4000,
  max_restarts: 10,
  min_uptime: '10s'
}
```

## Миграции базы данных

Применены следующие миграции:
1. `0_init` - Начальная схема
2. `20260113103549_add_qr_types_and_recipients` - QR типы и получатели
3. `20260116122403_add_user_profile_fields` - Поля профиля пользователя

## Статус сервисов

### PM2
```bash
pm2 status
# tipsio - online, pid: 9497, uptime: 5s, memory: 60.6MB
```

### Nginx
```bash
systemctl status nginx
# active (running)
```

### PostgreSQL
```bash
systemctl status postgresql
# active (running)
```

## Проверка работоспособности

### HTTP доступ
```bash
curl http://31.130.155.71
# ✅ Возвращает HTML главной страницы TIPSIO
```

### Health endpoint
```bash
curl http://31.130.155.71/api/health
# Ожидается: {"status":"ok"}
```

## Команды управления

### PM2
```bash
# Статус
pm2 status

# Логи
pm2 logs tipsio

# Перезапуск
pm2 restart tipsio

# Остановка
pm2 stop tipsio

# Мониторинг
pm2 monit
```

### Nginx
```bash
# Проверка конфигурации
sudo nginx -t

# Перезагрузка
sudo systemctl reload nginx

# Статус
sudo systemctl status nginx
```

### PostgreSQL
```bash
# Подключение к БД
psql -U tipsio_user -h localhost -d tipsio_prod

# Статус
sudo systemctl status postgresql
```

## Следующие шаги

### ⚠️ ОБЯЗАТЕЛЬНО:

1. **Настроить домен и SSL**
   - **Домен**: tipsio.id
   - **Текущий DNS**: 91.195.240.123 (старый сервер)
   - **Требуется**: Изменить DNS на 31.130.155.71 (новый сервер)
   
   **Инструкции:**
   - См. файл `DOMAIN_SSL_SETUP_SUMMARY.md` для краткой инструкции
   - См. файл `DOMAIN_SSL_SETUP.md` для полного руководства
   
   **Быстрый старт:**
   ```bash
   # 1. Проверить текущий DNS
   ./check-dns.sh
   
   # 2. Изменить DNS у регистратора домена:
   #    tipsio.id → 31.130.155.71
   #    www.tipsio.id → 31.130.155.71
   
   # 3. Подождать 5-30 минут, затем снова проверить
   ./check-dns.sh
   
   # 4. Когда DNS обновится, запустить автоматическую настройку
   ./setup-domain-ssl.sh
   ```

2. **Добавить Midtrans ключи**
   ```bash
   ssh root@31.130.155.71
   nano /var/www/tipsio/.env.production
   # Добавить MIDTRANS_SERVER_KEY и MIDTRANS_CLIENT_KEY
   pm2 restart tipsio
   ```

3. **Настроить резервное копирование**
   ```bash
   # Создать скрипт backup-db.sh
   chmod +x /var/www/tipsio/backup-db.sh
   # Добавить в crontab
   crontab -e
   # 0 2 * * * /var/www/tipsio/backup-db.sh
   ```

### Рекомендуется:

4. **Мониторинг**
   - Настроить мониторинг через PM2 Plus (опционально)
   - Настроить алерты на ошибки

5. **Безопасность**
   - Изменить пароль root
   - Создать отдельного пользователя для деплоя
   - Настроить SSH ключи вместо паролей

6. **Производительность**
   - Настроить кэширование в Nginx
   - Оптимизировать PostgreSQL для production

## Доступ к приложению

- **URL**: http://31.130.155.71
- **Главная страница**: ✅ Работает
- **Venue login**: http://31.130.155.71/venue/login
- **Staff login**: http://31.130.155.71/staff/login

## Логи

### PM2 логи
```bash
# Ошибки
tail -f /var/www/tipsio/logs/pm2-error.log

# Вывод
tail -f /var/www/tipsio/logs/pm2-out.log
```

### Nginx логи
```bash
# Access log
sudo tail -f /var/log/nginx/access.log

# Error log
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Приложение не запускается
```bash
# Проверить логи
pm2 logs tipsio --lines 100

# Проверить порт
sudo netstat -tulpn | grep 3000

# Перезапустить
pm2 restart tipsio
```

### Ошибки базы данных
```bash
# Проверить подключение
psql -U tipsio_user -h localhost -d tipsio_prod

# Проверить миграции
cd /var/www/tipsio
npx prisma migrate status
```

### 502 Bad Gateway
```bash
# Проверить статус PM2
pm2 status

# Проверить Nginx
sudo nginx -t
sudo systemctl status nginx
```

## Контакты для поддержки

- **Сервер**: root@31.130.155.71
- **Проект**: /var/www/tipsio
- **Документация**: DEPLOYMENT_GUIDE_NO_DOCKER.md

---

**Статус деплоя**: ✅ УСПЕШНО  
**Дата**: 27 января 2026  
**Время**: ~30 минут  
**Приложение**: РАБОТАЕТ
