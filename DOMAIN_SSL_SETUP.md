# Domain and SSL Setup Guide - TIPSIO

## Цель
Настроить домен **tipsio.id** и **www.tipsio.id** с SSL сертификатом для production сервера.

## Предварительные требования

### ⚠️ ВАЖНО: DNS должен быть настроен!

**Текущее состояние DNS:**
```bash
# Проверка DNS
dig tipsio.id +short
# Текущий IP: 91.195.240.123

dig www.tipsio.id +short
# Текущий IP: 91.195.240.123
```

**Требуется изменить DNS на новый сервер:**
- Старый IP: `91.195.240.123`
- Новый IP: `31.130.155.71` (наш production сервер)

### Шаги для изменения DNS:

1. Войдите в панель управления вашего регистратора домена (где зарегистрирован tipsio.id)
2. Найдите раздел DNS Management / DNS Settings
3. Измените A-записи:
   - `tipsio.id` → `31.130.155.71`
   - `www.tipsio.id` → `31.130.155.71`
4. Сохраните изменения
5. Подождите 5-30 минут для распространения DNS (TTL)

### Проверка после изменения DNS:

```bash
# Проверить DNS (должен вернуть новый IP)
dig tipsio.id +short
# Ожидается: 31.130.155.71

dig www.tipsio.id +short
# Ожидается: 31.130.155.71

# Проверить доступность нового сервера
curl -I http://31.130.155.71
# Должен вернуть: 200 OK
```

## Автоматическая установка

### Вариант 1: Использовать скрипт (рекомендуется)

```bash
./setup-domain-ssl.sh
```

Скрипт выполнит все шаги автоматически. Перед получением SSL сертификата он попросит подтверждение, чтобы вы могли проверить DNS.

## Ручная установка

### Вариант 2: Пошаговая установка

#### Шаг 1: Загрузить временную конфигурацию Nginx

```bash
sshpass -p 'yM*4r-ysQ+e2ag' scp -o StrictHostKeyChecking=no \
  nginx-tipsio-domain.conf root@31.130.155.71:/tmp/
```

#### Шаг 2: Установить конфигурацию на сервере

```bash
sshpass -p 'yM*4r-ysQ+e2ag' ssh -o StrictHostKeyChecking=no root@31.130.155.71 << 'EOF'
# Переместить конфигурацию
sudo mv /tmp/nginx-tipsio-domain.conf /etc/nginx/sites-available/tipsio

# Создать symlink
sudo rm -f /etc/nginx/sites-enabled/tipsio
sudo ln -s /etc/nginx/sites-available/tipsio /etc/nginx/sites-enabled/tipsio

# Создать директорию для certbot
sudo mkdir -p /var/www/certbot

# Проверить конфигурацию
sudo nginx -t

# Перезагрузить Nginx
sudo systemctl reload nginx
EOF
```

#### Шаг 3: Установить Certbot

```bash
sshpass -p 'yM*4r-ysQ+e2ag' ssh -o StrictHostKeyChecking=no root@31.130.155.71 << 'EOF'
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
EOF
```

#### Шаг 4: Получить SSL сертификат

⚠️ **Убедитесь, что DNS настроен перед этим шагом!**

```bash
sshpass -p 'yM*4r-ysQ+e2ag' ssh -o StrictHostKeyChecking=no root@31.130.155.71 << 'EOF'
sudo certbot --nginx \
  -d tipsio.id \
  -d www.tipsio.id \
  --non-interactive \
  --agree-tos \
  --email admin@tipsio.id \
  --redirect
EOF
```

Certbot автоматически:
- Получит SSL сертификат от Let's Encrypt
- Обновит конфигурацию Nginx для HTTPS
- Настроит редирект с HTTP на HTTPS

#### Шаг 5: Загрузить финальную конфигурацию (опционально)

Если хотите использовать кастомную конфигурацию с оптимизациями:

```bash
sshpass -p 'yM*4r-ysQ+e2ag' scp -o StrictHostKeyChecking=no \
  nginx-tipsio-ssl.conf root@31.130.155.71:/tmp/

sshpass -p 'yM*4r-ysQ+e2ag' ssh -o StrictHostKeyChecking=no root@31.130.155.71 << 'EOF'
sudo mv /tmp/nginx-tipsio-ssl.conf /etc/nginx/sites-available/tipsio
sudo nginx -t
sudo systemctl reload nginx
EOF
```

#### Шаг 6: Обновить NEXTAUTH_URL

```bash
sshpass -p 'yM*4r-ysQ+e2ag' ssh -o StrictHostKeyChecking=no root@31.130.155.71 << 'EOF'
cd /var/www/tipsio
sed -i 's|NEXTAUTH_URL=.*|NEXTAUTH_URL="https://tipsio.id"|' .env.production
cat .env.production | grep NEXTAUTH_URL
EOF
```

#### Шаг 7: Перезапустить приложение

```bash
sshpass -p 'yM*4r-ysQ+e2ag' ssh -o StrictHostKeyChecking=no root@31.130.155.71 << 'EOF'
cd /var/www/tipsio
pm2 restart tipsio
pm2 status
EOF
```

#### Шаг 8: Проверить автообновление SSL

```bash
sshpass -p 'yM*4r-ysQ+e2ag' ssh -o StrictHostKeyChecking=no root@31.130.155.71 << 'EOF'
sudo certbot renew --dry-run
EOF
```

## Проверка работоспособности

### 1. Проверить HTTP → HTTPS редирект

```bash
curl -I http://tipsio.id
# Должен вернуть: 301 Moved Permanently
# Location: https://tipsio.id/
```

### 2. Проверить HTTPS доступ

```bash
curl -I https://tipsio.id
# Должен вернуть: 200 OK
```

### 3. Проверить SSL сертификат

```bash
curl -vI https://tipsio.id 2>&1 | grep -A 5 "SSL certificate"
```

### 4. Проверить в браузере

Откройте в браузере:
- https://tipsio.id
- https://www.tipsio.id

Должен отображаться замок 🔒 в адресной строке.

### 5. Проверить рейтинг SSL

Проверьте качество SSL конфигурации:
https://www.ssllabs.com/ssltest/analyze.html?d=tipsio.id

Цель: получить рейтинг **A** или **A+**

## Troubleshooting

### Проблема: DNS не резолвится

```bash
# Проверить DNS
dig tipsio.id +short

# Если не возвращает 31.130.155.71, подождите распространения DNS
# Обычно занимает 5-10 минут, иногда до 24 часов
```

### Проблема: Certbot не может получить сертификат

```bash
# Проверить, что Nginx работает
sudo systemctl status nginx

# Проверить, что порт 80 открыт
sudo ufw status

# Проверить логи Nginx
sudo tail -f /var/log/nginx/error.log

# Проверить доступность ACME challenge
curl http://tipsio.id/.well-known/acme-challenge/test
```

### Проблема: 502 Bad Gateway после настройки SSL

```bash
# Проверить статус PM2
pm2 status

# Проверить логи приложения
pm2 logs tipsio --lines 50

# Перезапустить приложение
pm2 restart tipsio
```

### Проблема: NextAuth ошибки после смены домена

```bash
# Проверить NEXTAUTH_URL
cat /var/www/tipsio/.env.production | grep NEXTAUTH_URL

# Должно быть: NEXTAUTH_URL="https://tipsio.id"

# Если неправильно, исправить:
cd /var/www/tipsio
nano .env.production
# Изменить NEXTAUTH_URL на https://tipsio.id
pm2 restart tipsio
```

## Автообновление SSL сертификата

Certbot автоматически добавляет задачу в systemd timer для обновления сертификатов.

### Проверить статус таймера

```bash
sudo systemctl status certbot.timer
```

### Проверить следующее обновление

```bash
sudo certbot certificates
```

### Ручное обновление (если нужно)

```bash
sudo certbot renew
```

## Конфигурация Nginx

### Основные настройки

Конфигурация находится в `/etc/nginx/sites-available/tipsio`

Включает:
- ✅ HTTP → HTTPS редирект
- ✅ SSL/TLS 1.2 и 1.3
- ✅ Security headers (HSTS, X-Frame-Options, etc.)
- ✅ Gzip сжатие
- ✅ Кэширование статики
- ✅ Proxy к Next.js на localhost:3000

### Просмотр конфигурации

```bash
sshpass -p 'yM*4r-ysQ+e2ag' ssh root@31.130.155.71 'cat /etc/nginx/sites-available/tipsio'
```

### Редактирование конфигурации

```bash
sshpass -p 'yM*4r-ysQ+e2ag' ssh root@31.130.155.71 'sudo nano /etc/nginx/sites-available/tipsio'
```

После изменений:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Мониторинг

### Логи Nginx

```bash
# Access log
sudo tail -f /var/log/nginx/tipsio_access.log

# Error log
sudo tail -f /var/log/nginx/tipsio_error.log
```

### Логи SSL

```bash
# Certbot логи
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### Статус сертификата

```bash
sudo certbot certificates
```

## Дополнительные настройки

### Добавить поддомен

Если нужно добавить еще поддомены (например, api.tipsio.id):

1. Добавить DNS A-запись
2. Обновить конфигурацию Nginx:

```bash
server_name tipsio.id www.tipsio.id api.tipsio.id;
```

3. Получить новый сертификат:

```bash
sudo certbot --nginx -d tipsio.id -d www.tipsio.id -d api.tipsio.id
```

### Настроить CDN (опционально)

Для улучшения производительности можно использовать Cloudflare:

1. Добавить домен в Cloudflare
2. Изменить NS записи у регистратора
3. Включить Proxy (оранжевое облако)
4. Настроить SSL/TLS mode: Full (strict)

## Итоговая конфигурация

После завершения настройки:

- ✅ Домен: https://tipsio.id
- ✅ WWW домен: https://www.tipsio.id
- ✅ SSL сертификат: Let's Encrypt (бесплатный, автообновление)
- ✅ HTTP → HTTPS редирект
- ✅ Security headers
- ✅ Gzip сжатие
- ✅ Кэширование статики
- ✅ NEXTAUTH_URL обновлен
- ✅ Приложение перезапущено

## Следующие шаги

1. ✅ Проверить работу сайта в браузере
2. ✅ Проверить SSL рейтинг на SSL Labs
3. ⚠️ Добавить Midtrans ключи в .env.production (если еще не добавлены)
4. ✅ Настроить мониторинг uptime (опционально)
5. ✅ Настроить резервное копирование (уже настроено через backup-db.sh)

## Контакты

- **Сервер**: root@31.130.155.71
- **Проект**: /var/www/tipsio
- **Домен**: https://tipsio.id
- **Документация**: DEPLOYMENT_GUIDE_NO_DOCKER.md

---

**Дата создания**: 27 января 2026  
**Статус**: Готово к выполнению
