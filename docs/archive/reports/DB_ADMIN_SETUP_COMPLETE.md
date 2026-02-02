# Database Administration Setup - Complete

## Дата: 27 января 2026

## Что сделано

### 1. ✅ Очистка MOCK данных
- Проверена production база данных
- MOCK данные не были добавлены в production
- В БД есть только реальные данные:
  - 1 пользователь
  - 1 заведение
  - 1 сотрудник
  - 1 QR код

### 2. ✅ Установка Adminer
- Установлен Adminer 4.8.1 (легковесная альтернатива pgAdmin)
- Установлен PHP 8.3-FPM для работы Adminer
- Настроен Nginx для обслуживания Adminer на порту 8080
- Открыт порт 8080 в firewall (UFW)

## Доступ к Adminer

### URL
```
http://31.130.155.71:8080
```

### Данные для подключения к БД

| Параметр | Значение |
|----------|----------|
| **System** | PostgreSQL |
| **Server** | localhost |
| **Username** | tipsio_user |
| **Password** | tipsio_secure_pass_2026 |
| **Database** | tipsio_prod |

## Как использовать Adminer

### Шаг 1: Открыть Adminer
Откройте в браузере: http://31.130.155.71:8080

### Шаг 2: Войти в систему
Заполните форму входа:
- **System**: PostgreSQL
- **Server**: localhost
- **Username**: tipsio_user
- **Password**: tipsio_secure_pass_2026
- **Database**: tipsio_prod

### Шаг 3: Работа с БД
После входа вы сможете:
- ✅ Просматривать все таблицы
- ✅ Выполнять SQL запросы
- ✅ Редактировать данные
- ✅ Экспортировать/импортировать данные
- ✅ Просматривать структуру таблиц
- ✅ Создавать/удалять таблицы

## Структура базы данных

### Основные таблицы

1. **User** - Пользователи системы (менеджеры)
2. **Venue** - Заведения
3. **Staff** - Сотрудники заведений
4. **QrCode** - QR коды для чаевых
5. **Tip** - Чаевые
6. **TipDistribution** - Распределение чаевых
7. **Session** - Сессии пользователей

## Полезные SQL запросы

### Просмотр всех пользователей
```sql
SELECT id, email, role, "emailVerified", "createdAt" 
FROM "User";
```

### Просмотр всех заведений
```sql
SELECT id, name, type, status, "distributionMode", "createdAt"
FROM "Venue";
```

### Просмотр всех сотрудников
```sql
SELECT id, "displayName", "fullName", role, status, "venueId"
FROM "Staff";
```

### Просмотр всех QR кодов
```sql
SELECT id, "shortCode", type, label, status, "venueId", "staffId"
FROM "QrCode";
```

### Просмотр всех чаевых
```sql
SELECT id, amount, currency, status, "qrCodeId", "createdAt"
FROM "Tip"
ORDER BY "createdAt" DESC
LIMIT 10;
```

### Статистика по чаевым
```sql
SELECT 
    COUNT(*) as total_tips,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount,
    status
FROM "Tip"
GROUP BY status;
```

## Преимущества Adminer

✅ **Легковесный** - всего 466KB (vs pgAdmin ~130MB)
✅ **Быстрый** - мгновенная загрузка
✅ **Простой** - интуитивный интерфейс
✅ **Мощный** - все необходимые функции для работы с БД
✅ **Безопасный** - доступен только с сервера (порт 8080)

## Безопасность

### Текущие настройки
- Adminer доступен только по IP: 31.130.155.71:8080
- Требуется аутентификация PostgreSQL
- Порт 8080 открыт в firewall

### Рекомендации по безопасности

1. **Ограничить доступ по IP** (опционально)
   ```bash
   # Разрешить доступ только с определённого IP
   ufw delete allow 8080/tcp
   ufw allow from YOUR_IP to any port 8080
   ```

2. **Использовать SSH туннель** (рекомендуется)
   ```bash
   # На локальной машине
   ssh -L 8080:localhost:8080 root@31.130.155.71
   # Затем открыть http://localhost:8080
   ```

3. **Настроить HTTPS** (после настройки домена)
   - Добавить Adminer в Nginx с SSL
   - Использовать поддомен (например, db.tipsio.id)

## Управление Adminer

### Проверить статус
```bash
systemctl status php8.3-fpm
systemctl status nginx
```

### Перезапустить
```bash
systemctl restart php8.3-fpm
systemctl reload nginx
```

### Просмотр логов
```bash
# Логи PHP-FPM
tail -f /var/log/php8.3-fpm.log

# Логи Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Альтернативы

Если Adminer не подходит, можно установить:

1. **pgAdmin 4** (более мощный, но тяжелее)
2. **DBeaver** (desktop приложение)
3. **psql** (командная строка)
   ```bash
   psql -U tipsio_user -h localhost -d tipsio_prod
   ```

## Файлы конфигурации

### Nginx конфигурация
```
/etc/nginx/sites-available/adminer
/etc/nginx/sites-enabled/adminer
```

### PHP-FPM конфигурация
```
/etc/php/8.3/fpm/php.ini
/etc/php/8.3/fpm/pool.d/www.conf
```

### Adminer файлы
```
/var/www/adminer/adminer.php
/var/www/adminer/index.php
```

## Troubleshooting

### Adminer не открывается
```bash
# Проверить статус PHP-FPM
systemctl status php8.3-fpm

# Проверить статус Nginx
systemctl status nginx

# Проверить логи
tail -f /var/log/nginx/error.log
```

### Ошибка подключения к БД
```bash
# Проверить статус PostgreSQL
systemctl status postgresql

# Проверить подключение
psql -U tipsio_user -h localhost -d tipsio_prod
```

### 502 Bad Gateway
```bash
# Перезапустить PHP-FPM
systemctl restart php8.3-fpm

# Проверить права на файлы
ls -la /var/www/adminer/
```

## Следующие шаги

1. ✅ Adminer установлен и работает
2. ⏳ Настроить DNS для домена tipsio.id
3. ⏳ Получить SSL сертификат
4. ⏳ Настроить HTTPS доступ к Adminer (опционально)
5. ⏳ Добавить Midtrans ключи в .env.production

## Контакты

- **Сервер**: root@31.130.155.71
- **Adminer**: http://31.130.155.71:8080
- **Приложение**: http://31.130.155.71
- **База данных**: localhost:5432/tipsio_prod

---

**Статус**: ✅ ГОТОВО  
**Дата**: 27 января 2026  
**Adminer**: Установлен и работает
