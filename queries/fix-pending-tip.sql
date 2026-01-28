-- ============================================
-- ДИАГНОСТИКА И ИСПРАВЛЕНИЕ PENDING ЧАЕВЫХ
-- ============================================

-- 1. ПРОВЕРИТЬ WEBHOOK ЛОГИ ДЛЯ ЭТОГО ORDER_ID
SELECT 
    id,
    processed,
    error,
    "createdAt",
    (payload->>'order_id') as "orderId",
    (payload->>'transaction_status') as "transactionStatus",
    (payload->>'status_code') as "statusCode",
    (payload->>'fraud_status') as "fraudStatus",
    payload
FROM "WebhookLog"
WHERE provider = 'midtrans'
  AND (payload->>'order_id') = 'TIP-cmj8fyv8-1768577522136-idauo4'
ORDER BY "createdAt" DESC;

-- 2. ПРОВЕРИТЬ ВСЕ WEBHOOK ЛОГИ (последние)
SELECT 
    id,
    processed,
    error,
    "createdAt",
    (payload->>'order_id') as "orderId",
    (payload->>'transaction_status') as "transactionStatus"
FROM "WebhookLog"
WHERE provider = 'midtrans'
ORDER BY "createdAt" DESC
LIMIT 10;

-- 3. ПРОВЕРИТЬ ТЕКУЩИЙ СТАТУС ЧАЕВЫХ
SELECT 
    id,
    "midtransOrderId",
    "status",
    "amount",
    "netAmount",
    "midtransTransactionId",
    "midtransPaymentType",
    "midtransTransactionTime",
    "createdAt",
    "updatedAt"
FROM "Tip"
WHERE "midtransOrderId" = 'TIP-cmj8fyv8-1768577522136-idauo4';

-- 4. ВРУЧНУЮ ОБНОВИТЬ СТАТУС (если webhook не работает)
-- ВНИМАНИЕ: Только для разработки/тестирования!
UPDATE "Tip"
SET 
    "status" = 'PAID',
    "midtransTransactionId" = 'manual-update-' || NOW()::text,
    "midtransTransactionTime" = NOW(),
    "midtransPaymentType" = 'manual',
    "updatedAt" = NOW()
WHERE "midtransOrderId" = 'TIP-cmj8fyv8-1768577522136-idauo4'
  AND "status" = 'PENDING'
RETURNING id, "status", "updatedAt";

-- 5. ПРОВЕРИТЬ ALLOCATIONS (после обновления статуса)
SELECT 
    ta.id,
    ta."amount",
    ta."date",
    s."displayName" as "staffName",
    t."status" as "tipStatus"
FROM "TipAllocation" ta
JOIN "Tip" t ON ta."tipId" = t.id
JOIN "Staff" s ON ta."staffId" = s.id
WHERE t."midtransOrderId" = 'TIP-cmj8fyv8-1768577522136-idauo4';

-- 6. СОЗДАТЬ ALLOCATIONS ВРУЧНУЮ (если их нет после обновления)
-- Сначала узнайте tipId и staffId
SELECT 
    t.id as "tipId",
    t."staffId",
    t."venueId",
    t."netAmount",
    s."displayName" as "staffName"
FROM "Tip" t
LEFT JOIN "Staff" s ON t."staffId" = s.id
WHERE t."midtransOrderId" = 'TIP-cmj8fyv8-1768577522136-idauo4';

-- Затем создайте allocation (замените tipId и staffId)
-- INSERT INTO "TipAllocation" (id, "amount", "date", "tipId", "staffId", "createdAt")
-- VALUES (
--     gen_random_uuid()::text,
--     142500,  -- netAmount
--     CURRENT_DATE,
--     'tip-id-here',  -- Замените на tipId из запроса выше
--     'staff-id-here',  -- Замените на staffId из запроса выше
--     NOW()
-- );

