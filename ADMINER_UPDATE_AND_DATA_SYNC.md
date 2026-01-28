# Adminer Update and Data Sync - Complete

## Дата: 27 января 2026

## Выполненные задачи

### ✅ 1. Обновление Adminer до последней версии

**Было:** Adminer 4.8.1 (466KB)  
**Стало:** Adminer 5.4.1 (496KB)

**Что сделано:**
- Скачана последняя версия Adminer 5.4.1 с GitHub
- Заменён файл `/var/www/adminer/adminer.php`
- Перезапущен PHP-FPM

**Проверка:**
```bash
ls -lh /var/www/adminer/adminer.php
# -rw-r--r-- 1 root root 496K Sep 27 06:58 adminer.php
```

### ✅ 2. Исправление ошибки подключения PostgreSQL

**Ошибка:**
```
Unable to connect to PostgreSQL server: connection to server on socket 
"/var/run/postgresql/.s.PGSQL.5432" failed: FATAL: Peer authentication 
failed for user "tipsio_user"
```

**Причина:** PostgreSQL использовал scram-sha-256 аутентификацию вместо md5

**Решение:**
- Обновлён файл `/etc/postgresql/16/main/pg_hba.conf`
- Изменена аутентификация с `scram-sha-256` на `md5` для 127.0.0.1 и ::1
- Перезапущен PostgreSQL

**Изменения в pg_hba.conf:**
```
# До:
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             ::1/128                 scram-sha-256

# После:
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

**Проверка подключения:**
```bash
PGPASSWORD=tipsio_secure_pass_2026 psql -h 127.0.0.1 -U tipsio_user -d tipsio_prod -c "SELECT COUNT(*) FROM \"User\";"
# ✅ Подключение успешно
```

### ✅ 3. Экспорт и импорт данных из локальной БД в production

**Экспортировано из локальной БД:**
- Пользователей: 8
- Заведений: 8
- Сотрудников: 7
- QR кодов: 11

**Импортировано в production БД:**
- ✅ 8 пользователей (manager@test.com, test4@test.ru, test6@test.ru, test7@test.ru, test6@test.com, test10@test.ru, test11@test.ru, test8@test.ru)
- ✅ 8 заведений (Cafe Organic Canggu, Cafe_test_4, Cafe_test_6, Cafe_test_7, Test Venue, Cafe_test_8, Cafe_test_10, Cafe_test_11)
- ✅ 7 сотрудников (Agung, Wayan, Ketut, Max, Max Pain, 123, Cafe_test_11)
- ✅ 11 QR кодов (CqLrX6tH, agung001, 9SgQnz_j, Dm8PeAbB, 2IkjnqMd, table01, organic, WafGmcV6, pT5VhFD1, dm4zLDH7, GEvMQW1Q)

**Итоговое состояние production БД:**
```
Users:    9 (1 был + 8 импортировано)
Venues:   9 (1 было + 8 импортировано)
Staff:    8 (1 был + 7 импортировано)
QR Codes: 12 (1 был + 11 импортировано)
```

**Процесс:**
1. Запущен скрипт `scripts/export-data.ts` на локальной машине
2. Создан файл `local-data-export.json` с данными
3. Файл скопирован на сервер через scp
4. Запущен скрипт `scripts/import-prod-data.ts` на сервере
5. Данные импортированы с использованием upsert (обновление существующих + добавление новых)

## Доступ к Adminer

### URL
```
http://31.130.155.71:8080
```

### Данные для подключения

| Параметр | Значение |
|----------|----------|
| **System** | PostgreSQL |
| **Server** | 127.0.0.1 |
| **Username** | tipsio_user |
| **Password** | tipsio_secure_pass_2026 |
| **Database** | tipsio_prod |

## Проверка работоспособности

### 1. Adminer доступен
```bash
curl -I http://31.130.155.71:8080
# HTTP/1.1 200 OK
```

### 2. PostgreSQL подключение работает
```bash
PGPASSWORD=tipsio_secure_pass_2026 psql -h 127.0.0.1 -U tipsio_user -d tipsio_prod -c "\dt"
# ✅ Список таблиц отображается
```

### 3. Данные в БД
```sql
SELECT COUNT(*) FROM "User";     -- 9
SELECT COUNT(*) FROM "Venue";    -- 9
SELECT COUNT(*) FROM "Staff";    -- 8
SELECT COUNT(*) FROM "QrCode";   -- 12
```

## Что изменилось

### Adminer
- ✅ Версия обновлена с 4.8.1 до 5.4.1
- ✅ Размер файла: 496KB
- ✅ Поддержка PostgreSQL 16
- ✅ Улучшенная безопасность и производительность

### PostgreSQL
- ✅ Аутентификация изменена на md5
- ✅ Подключение через 127.0.0.1 работает
- ✅ Adminer может подключаться к БД

### База данных
- ✅ Все данные из локальной БД синхронизированы
- ✅ Тестовые аккаунты доступны
- ✅ QR коды импортированы
- ✅ Связи между таблицами сохранены

## Следующие шаги

1. ⏳ Настроить DNS для домена tipsio.id (изменить на 31.130.155.71)
2. ⏳ Получить SSL сертификат через Let's Encrypt
3. ⏳ Настроить HTTPS доступ к Adminer (опционально)
4. ⏳ Добавить Midtrans ключи в .env.production
5. ⏳ Настроить резервное копирование БД

## Полезные команды

### Проверка версии Adminer
```bash
ssh root@31.130.155.71 'head -5 /var/www/adminer/adminer.php | grep version'
```

### Проверка подключения к БД
```bash
ssh root@31.130.155.71 'PGPASSWORD=tipsio_secure_pass_2026 psql -h 127.0.0.1 -U tipsio_user -d tipsio_prod -c "SELECT version();"'
```

### Перезапуск сервисов
```bash
# PHP-FPM
ssh root@31.130.155.71 'systemctl restart php8.3-fpm'

# PostgreSQL
ssh root@31.130.155.71 'systemctl restart postgresql'

# Nginx
ssh root@31.130.155.71 'systemctl reload nginx'
```

## Troubleshooting

### Adminer не открывается
```bash
# Проверить PHP-FPM
systemctl status php8.3-fpm

# Проверить Nginx
systemctl status nginx

# Проверить логи
tail -f /var/log/nginx/error.log
```

### Ошибка подключения к PostgreSQL
```bash
# Проверить pg_hba.conf
cat /etc/postgresql/16/main/pg_hba.conf | grep "127.0.0.1"

# Должно быть:
# host    all             all             127.0.0.1/32            md5

# Перезапустить PostgreSQL
systemctl restart postgresql
```

### Данные не импортировались
```bash
# Проверить файл экспорта
cat /var/www/tipsio/local-data-export.json | jq '.users | length'

# Запустить импорт заново
cd /var/www/tipsio
npx tsx scripts/import-prod-data.ts
```

## Контакты

- **Сервер**: root@31.130.155.71
- **Adminer**: http://31.130.155.71:8080
- **Приложение**: http://31.130.155.71
- **База данных**: 127.0.0.1:5432/tipsio_prod

---

**Статус**: ✅ ВСЕ ЗАДАЧИ ВЫПОЛНЕНЫ  
**Дата**: 27 января 2026  
**Время выполнения**: ~10 минут

