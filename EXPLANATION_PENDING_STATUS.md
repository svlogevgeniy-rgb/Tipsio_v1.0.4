# Объяснение статуса PENDING

## Что означает PENDING = 15?

**PENDING = 15** означает, что в базе данных есть **15 чаевых со статусом "PENDING"** (ожидающие оплаты).

## Статусы чаевых в системе:

1. **PENDING** - Ожидает оплаты
   - Чаевые созданы, но платеж еще не завершен
   - Гость начал процесс оплаты, но не завершил
   - Или платеж обрабатывается Midtrans

2. **PAID** - Оплачено ✅
   - Платеж успешно завершен
   - Деньги получены
   - Чаевые распределены между персоналом

3. **FAILED** - Ошибка оплаты
   - Платеж не прошел
   - Проблема с картой/банком

4. **CANCELED** - Отменено
   - Гость отменил платеж

5. **EXPIRED** - Истек срок
   - Время на оплату истекло

## Почему запросы возвращают NULL?

**Проблема:** Ваши запросы ищут только чаевые со статусом `PAID`:

```sql
WHERE "status" = 'PAID'  -- Только оплаченные
```

Но у вас все 15 чаевых в статусе `PENDING`, поэтому запросы возвращают пустые результаты!

## Решение:

### Вариант 1: Включить PENDING в запросы

```sql
-- Вместо только PAID
SELECT SUM("netAmount") as "totalTips"
FROM "Tip"
WHERE "status" IN ('PAID', 'PENDING');  -- Включаем PENDING
```

### Вариант 2: Проверить, почему платежи не завершаются

1. **Проверить webhook логи:**
```sql
SELECT 
    processed,
    error,
    "createdAt",
    (payload->>'transaction_status') as "midtransStatus"
FROM "WebhookLog"
WHERE provider = 'midtrans'
ORDER BY "createdAt" DESC
LIMIT 10;
```

2. **Проверить последние чаевые:**
```sql
SELECT 
    id,
    "status",
    "midtransOrderId",
    "midtransTransactionId",
    "createdAt",
    "updatedAt"
FROM "Tip"
WHERE "status" = 'PENDING'
ORDER BY "createdAt" DESC
LIMIT 5;
```

### Вариант 3: Вручную обновить статус (только для тестирования!)

```sql
-- ВНИМАНИЕ: Только для разработки/тестирования!
-- В продакшене статусы должны обновляться через webhook
UPDATE "Tip"
SET "status" = 'PAID'
WHERE "status" = 'PENDING'
  AND id = 'tip-id-here';  -- Замените на конкретный ID
```

## Как работает процесс:

1. **Гость создает чаевые** → Статус: `PENDING`
2. **Гость оплачивает через Midtrans** → Midtrans отправляет webhook
3. **Webhook обрабатывается** → Статус меняется на `PAID`
4. **Чаевые распределяются** → Создаются `TipAllocation`

## Проверка работы webhook:

```sql
-- Проверить необработанные webhook
SELECT 
    id,
    error,
    "createdAt",
    (payload->>'order_id') as "orderId",
    (payload->>'transaction_status') as "transactionStatus"
FROM "WebhookLog"
WHERE provider = 'midtrans'
  AND processed = false
ORDER BY "createdAt" DESC;
```

## Вывод:

**PENDING = 15** означает, что:
- ✅ Чаевые создаются (15 штук)
- ❌ Платежи не завершаются (все в PENDING)
- ❌ Webhook не обновляет статус на PAID

**Нужно проверить:**
1. Работает ли webhook от Midtrans
2. Правильно ли настроен webhook URL в Midtrans Dashboard
3. Есть ли ошибки в webhook логах

