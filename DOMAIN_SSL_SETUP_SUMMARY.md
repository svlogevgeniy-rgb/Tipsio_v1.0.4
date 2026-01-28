# Domain and SSL Setup - Summary

## Текущая ситуация

### Сервер
- **IP**: 31.130.155.71
- **Статус**: ✅ Работает, приложение доступно по IP
- **Доступ**: http://31.130.155.71

### Домен
- **Домен**: tipsio.id
- **Текущий DNS**: 91.195.240.123 (старый сервер)
- **Требуется**: Изменить DNS на 31.130.155.71 (новый сервер)

## Что подготовлено

### 1. Конфигурационные файлы

#### `nginx-tipsio-domain.conf`
Временная HTTP конфигурация для получения SSL сертификата через Let's Encrypt ACME challenge.

#### `nginx-tipsio-ssl.conf`
Финальная HTTPS конфигурация с:
- SSL/TLS 1.2 и 1.3
- HTTP → HTTPS редирект
- Security headers (HSTS, X-Frame-Options, etc.)
- Gzip сжатие
- Кэширование статики
- Оптимизированные настройки proxy

### 2. Скрипты автоматизации

#### `check-dns.sh`
Проверяет текущее состояние DNS и показывает, готов ли домен к настройке SSL.

**Использование:**
```bash
./check-dns.sh
```

**Вывод:**
- Текущий IP для tipsio.id
- Текущий IP для www.tipsio.id
- Сравнение с ожидаемым IP (31.130.155.71)
- Рекомендации по дальнейшим действиям

#### `setup-domain-ssl.sh`
Автоматически выполняет все шаги настройки домена и SSL:
1. Проверяет DNS
2. Загружает конфигурацию Nginx
3. Устанавливает Certbot
4. Получает SSL сертификат
5. Обновляет NEXTAUTH_URL
6. Перезапускает приложение

**Использование:**
```bash
./setup-domain-ssl.sh
```

### 3. Документация

#### `DOMAIN_SSL_SETUP.md`
Полное руководство с:
- Автоматической установкой (через скрипт)
- Ручной установкой (пошаговые команды)
- Проверкой работоспособности
- Troubleshooting
- Мониторингом

## Пошаговый план действий

### Шаг 1: Изменить DNS (ОБЯЗАТЕЛЬНО)

**Где:** Панель управления регистратора домена tipsio.id

**Что изменить:**
- A-запись `tipsio.id` → `31.130.155.71`
- A-запись `www.tipsio.id` → `31.130.155.71`

**Время ожидания:** 5-30 минут (зависит от TTL)

### Шаг 2: Проверить DNS

```bash
./check-dns.sh
```

Дождитесь, пока оба домена будут указывать на 31.130.155.71

### Шаг 3: Запустить автоматическую настройку

```bash
./setup-domain-ssl.sh
```

Скрипт выполнит все необходимые действия автоматически.

### Шаг 4: Проверить работу

```bash
# Проверить HTTP → HTTPS редирект
curl -I http://tipsio.id

# Проверить HTTPS доступ
curl -I https://tipsio.id

# Открыть в браузере
open https://tipsio.id
```

## Альтернативный план (ручная установка)

Если автоматический скрипт не работает, следуйте инструкциям в `DOMAIN_SSL_SETUP.md` раздел "Ручная установка".

## Что произойдет после настройки

### Изменения на сервере

1. **Nginx конфигурация**
   - Файл: `/etc/nginx/sites-available/tipsio`
   - HTTPS на порту 443
   - HTTP редирект на HTTPS
   - SSL сертификат от Let's Encrypt

2. **SSL сертификат**
   - Путь: `/etc/letsencrypt/live/tipsio.id/`
   - Автообновление через systemd timer
   - Срок действия: 90 дней (автообновление за 30 дней до истечения)

3. **Переменные окружения**
   - Файл: `/var/www/tipsio/.env.production`
   - `NEXTAUTH_URL` изменится с `http://31.130.155.71` на `https://tipsio.id`

4. **Приложение**
   - PM2 перезапустит приложение
   - Новый URL: https://tipsio.id

### Доступ к приложению

**До настройки:**
- http://31.130.155.71 ✅

**После настройки:**
- http://31.130.155.71 ✅ (продолжит работать)
- http://tipsio.id → https://tipsio.id ✅
- https://tipsio.id ✅ (основной URL)
- http://www.tipsio.id → https://www.tipsio.id ✅
- https://www.tipsio.id ✅

## Проверка качества SSL

После настройки проверьте SSL конфигурацию:

**SSL Labs Test:**
https://www.ssllabs.com/ssltest/analyze.html?d=tipsio.id

**Цель:** Рейтинг A или A+

## Troubleshooting

### DNS не обновляется

```bash
# Проверить DNS с разных серверов
dig @8.8.8.8 tipsio.id +short
dig @1.1.1.1 tipsio.id +short

# Очистить локальный DNS кэш (macOS)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

### Certbot не может получить сертификат

**Причины:**
1. DNS еще не обновился → Подождите еще
2. Порт 80 закрыт → Проверьте UFW: `sudo ufw status`
3. Nginx не работает → Проверьте: `sudo systemctl status nginx`

**Решение:**
```bash
# Проверить доступность ACME challenge
curl http://tipsio.id/.well-known/acme-challenge/test

# Проверить логи Nginx
sudo tail -f /var/log/nginx/error.log

# Проверить логи Certbot
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### 502 Bad Gateway после настройки

```bash
# Проверить PM2
pm2 status

# Проверить логи
pm2 logs tipsio --lines 50

# Перезапустить
pm2 restart tipsio
```

## Мониторинг после настройки

### Проверить статус SSL сертификата

```bash
sshpass -p 'yM*4r-ysQ+e2ag' ssh root@31.130.155.71 'sudo certbot certificates'
```

### Проверить автообновление

```bash
sshpass -p 'yM*4r-ysQ+e2ag' ssh root@31.130.155.71 'sudo systemctl status certbot.timer'
```

### Проверить логи Nginx

```bash
sshpass -p 'yM*4r-ysQ+e2ag' ssh root@31.130.155.71 'sudo tail -f /var/log/nginx/tipsio_access.log'
```

## Следующие шаги после настройки SSL

1. ✅ Проверить работу сайта в браузере
2. ✅ Проверить SSL рейтинг на SSL Labs
3. ⚠️ Добавить Midtrans ключи в .env.production (если еще не добавлены)
4. ✅ Обновить ссылки в документации на https://tipsio.id
5. ✅ Настроить мониторинг uptime (опционально)
6. ✅ Настроить Google Analytics / Yandex Metrika (опционально)

## Файлы в проекте

```
Tipsio/
├── nginx-tipsio-domain.conf      # Временная HTTP конфигурация
├── nginx-tipsio-ssl.conf         # Финальная HTTPS конфигурация
├── setup-domain-ssl.sh           # Автоматический скрипт настройки
├── check-dns.sh                  # Скрипт проверки DNS
├── DOMAIN_SSL_SETUP.md           # Полное руководство
└── DOMAIN_SSL_SETUP_SUMMARY.md   # Этот файл (краткая сводка)
```

## Контакты и доступы

- **Сервер**: 31.130.155.71
- **Логин**: root
- **Пароль**: yM*4r-ysQ+e2ag
- **Проект**: /var/www/tipsio
- **Домен**: tipsio.id (после настройки DNS)

## Статус

- ✅ Сервер настроен и работает
- ✅ Приложение развернуто
- ✅ Конфигурационные файлы подготовлены
- ✅ Скрипты автоматизации созданы
- ✅ Документация написана
- ⏳ DNS нужно изменить на 31.130.155.71
- ⏳ SSL сертификат нужно получить (после DNS)

---

**Дата создания**: 27 января 2026  
**Следующий шаг**: Изменить DNS на 31.130.155.71
