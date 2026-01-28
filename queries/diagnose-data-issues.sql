-- ============================================
-- ДИАГНОСТИКА ПРОБЛЕМ С ДАННЫМИ
-- ============================================

-- 1. ОСНОВНАЯ ПРОВЕРКА - ЕСТЬ ЛИ ДАННЫЕ ВООБЩЕ
SELECT 
    'Total Tips' as "metric",
    COUNT(*) as "value"
FROM "Tip"
UNION ALL
SELECT 
    'PAID Tips',
    COUNT(*)
FROM "Tip"
WHERE "status" = 'PAID'
UNION ALL
SELECT 
    'PENDING Tips',
    COUNT(*)
FROM "Tip"
WHERE "status" = 'PENDING'
UNION ALL
SELECT 
    'FAILED Tips',
    COUNT(*)
FROM "Tip"
WHERE "status" = 'FAILED';

-- 2. ПРОВЕРИТЬ СТАТУСЫ ВСЕХ ЧАЕВЫХ
SELECT 
    "status",
    COUNT(*) as "count",
    MIN("createdAt") as "oldest",
    MAX("createdAt") as "newest"
FROM "Tip"
GROUP BY "status"
ORDER BY "count" DESC;

-- 3. ПРОВЕРИТЬ ПОСЛЕДНИЕ ЧАЕВЫЕ (ВСЕ СТАТУСЫ)
SELECT 
    id,
    "venueId",
    "status",
    "amount",
    "netAmount",
    "midtransOrderId",
    "midtransTransactionStatus",
    "createdAt",
    "updatedAt"
FROM "Tip"
ORDER BY "createdAt" DESC
LIMIT 10;

-- 4. ПРОВЕРИТЬ ЗАВЕДЕНИЯ И ИХ НАСТРОЙКИ
SELECT 
    v.id,
    v.name,
    v.status as "venueStatus",
    v."midtransConnected",
    COUNT(t.id) as "totalTips",
    COUNT(CASE WHEN t."status" = 'PAID' THEN 1 END) as "paidTips",
    COUNT(CASE WHEN t."status" = 'PENDING' THEN 1 END) as "pendingTips"
FROM "Venue" v
LEFT JOIN "Tip" t ON v.id = t."venueId"
GROUP BY v.id, v.name, v.status, v."midtransConnected"
ORDER BY "totalTips" DESC;

-- 5. ПРОВЕРИТЬ WEBHOOK ЛОГИ (обрабатываются ли платежи)
SELECT 
    id,
    provider,
    processed,
    error,
    "createdAt",
    (payload->>'order_id') as "orderId",
    (payload->>'transaction_status') as "transactionStatus"
FROM "WebhookLog"
WHERE provider = 'midtrans'
ORDER BY "createdAt" DESC
LIMIT 20;

-- 6. ПРОВЕРИТЬ НЕОБРАБОТАННЫЕ WEBHOOK
SELECT 
    id,
    error,
    "createdAt",
    (payload->>'order_id') as "orderId"
FROM "WebhookLog"
WHERE provider = 'midtrans'
  AND processed = false
ORDER BY "createdAt" DESC;

-- 7. ПРОВЕРИТЬ ЧАЕВЫЕ БЕЗ MIDTRANS ORDER ID
SELECT 
    id,
    "venueId",
    "status",
    "midtransOrderId",
    "createdAt"
FROM "Tip"
WHERE "midtransOrderId" IS NULL
   OR "midtransOrderId" = '';

-- 8. ПРОВЕРИТЬ АКТИВНЫЕ QR-КОДЫ
SELECT 
    qr.id,
    qr."shortCode",
    qr.status as "qrStatus",
    v.name as "venueName",
    v.status as "venueStatus",
    v."midtransConnected",
    COUNT(t.id) as "tipsCount"
FROM "QrCode" qr
JOIN "Venue" v ON qr."venueId" = v.id
LEFT JOIN "Tip" t ON qr.id = t."qrCodeId"
WHERE qr.status = 'ACTIVE'
GROUP BY qr.id, qr."shortCode", qr.status, v.name, v.status, v."midtransConnected"
ORDER BY "tipsCount" DESC;

-- 9. ПРОВЕРИТЬ ЧАЕВЫЕ С MIDTRANS ДАННЫМИ
SELECT 
    id,
    "status",
    "midtransOrderId",
    "midtransTransactionId",
    "midtransPaymentType",
    "midtransTransactionTime",
    "createdAt"
FROM "Tip"
WHERE "midtransOrderId" IS NOT NULL
ORDER BY "createdAt" DESC
LIMIT 10;

-- 10. ПРОВЕРИТЬ ALLOCATIONS (распределение чаевых)
SELECT 
    COUNT(*) as "totalAllocations",
    SUM("amount") as "totalAllocatedAmount"
FROM "TipAllocation";

-- 11. ПРОВЕРИТЬ СВЯЗЬ ЧАЕВЫХ И ALLOCATIONS
SELECT 
    t.id as "tipId",
    t."status" as "tipStatus",
    t."netAmount",
    COUNT(ta.id) as "allocationsCount",
    SUM(ta."amount") as "allocatedAmount"
FROM "Tip" t
LEFT JOIN "TipAllocation" ta ON t.id = ta."tipId"
WHERE t."status" = 'PAID'
GROUP BY t.id, t."status", t."netAmount"
HAVING COUNT(ta.id) = 0  -- PAID tips без allocations
LIMIT 10;

