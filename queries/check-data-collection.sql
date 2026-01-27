-- ============================================
-- ПРОВЕРКА СБОРА ДАННЫХ И ДИАГНОСТИКА
-- ============================================

-- 1. ПРОВЕРИТЬ ВСЕ ЧАЕВЫЕ (ВСЕ СТАТУСЫ)
SELECT 
    "status",
    COUNT(*) as "count",
    SUM("amount") as "totalAmount",
    SUM("netAmount") as "totalNetAmount"
FROM "Tip"
GROUP BY "status"
ORDER BY "count" DESC;

-- 2. ПРОВЕРИТЬ ЕСТЬ ЛИ ВООБЩЕ ДАННЫЕ
SELECT 
    COUNT(*) as "totalTips",
    COUNT(CASE WHEN "status" = 'PAID' THEN 1 END) as "paidTips",
    COUNT(CASE WHEN "status" = 'PENDING' THEN 1 END) as "pendingTips",
    COUNT(CASE WHEN "status" = 'FAILED' THEN 1 END) as "failedTips"
FROM "Tip";

-- 3. ПОСЛЕДНИЕ ЧАЕВЫЕ (ВСЕ СТАТУСЫ)
SELECT 
    id,
    "venueId",
    "status",
    "amount",
    "netAmount",
    "createdAt",
    "midtransOrderId"
FROM "Tip"
ORDER BY "createdAt" DESC
LIMIT 20;

-- 4. ПРОВЕРИТЬ ЗАВЕДЕНИЯ И ИХ ЧАЕВЫЕ
SELECT 
    v.id as "venueId",
    v.name as "venueName",
    v.status as "venueStatus",
    COUNT(t.id) as "totalTips",
    COUNT(CASE WHEN t."status" = 'PAID' THEN 1 END) as "paidTips"
FROM "Venue" v
LEFT JOIN "Tip" t ON v.id = t."venueId"
GROUP BY v.id, v.name, v.status
ORDER BY "totalTips" DESC;

-- 5. ПРОВЕРИТЬ QR-КОДЫ И ИХ СВЯЗЬ С ЧАЕВЫМИ
SELECT 
    qr.id as "qrCodeId",
    qr."shortCode",
    qr."type",
    qr.status as "qrStatus",
    v.name as "venueName",
    COUNT(t.id) as "tipsCount"
FROM "QrCode" qr
JOIN "Venue" v ON qr."venueId" = v.id
LEFT JOIN "Tip" t ON qr.id = t."qrCodeId"
GROUP BY qr.id, qr."shortCode", qr."type", qr.status, v.name
ORDER BY "tipsCount" DESC;

-- 6. ПРОВЕРИТЬ MIDTRANS СТАТУСЫ
SELECT 
    "status",
    "midtransPaymentType",
    COUNT(*) as "count"
FROM "Tip"
WHERE "midtransOrderId" IS NOT NULL
GROUP BY "status", "midtransPaymentType"
ORDER BY "count" DESC;

-- 7. ПРОВЕРИТЬ ВРЕМЯ СОЗДАНИЯ ЧАЕВЫХ
SELECT 
    DATE_TRUNC('day', "createdAt") as "date",
    COUNT(*) as "tipsCount",
    COUNT(CASE WHEN "status" = 'PAID' THEN 1 END) as "paidCount"
FROM "Tip"
GROUP BY DATE_TRUNC('day', "createdAt")
ORDER BY "date" DESC
LIMIT 30;

-- 8. ПРОВЕРИТЬ WEBHOOK ЛОГИ
SELECT 
    id,
    provider,
    processed,
    error,
    "createdAt"
FROM "WebhookLog"
ORDER BY "createdAt" DESC
LIMIT 20;

-- 9. ПРОВЕРИТЬ АКТИВНЫЕ ЗАВЕДЕНИЯ
SELECT 
    id,
    name,
    status,
    "midtransConnected",
    "createdAt"
FROM "Venue"
WHERE status = 'ACTIVE'
ORDER BY "createdAt" DESC;

-- 10. ПРОВЕРИТЬ АКТИВНЫЕ QR-КОДЫ
SELECT 
    qr.id,
    qr."shortCode",
    qr.status,
    v.name as "venueName",
    v.status as "venueStatus"
FROM "QrCode" qr
JOIN "Venue" v ON qr."venueId" = v.id
WHERE qr.status = 'ACTIVE'
  AND v.status = 'ACTIVE'
ORDER BY qr."createdAt" DESC;

