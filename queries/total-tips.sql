-- ============================================
-- ЗАПРОСЫ ДЛЯ ПОДСЧЕТА ВСЕХ ЧАЕВЫХ
-- ============================================

-- 1. ВСЕГО ЧАЕВЫХ (чистая сумма после комиссии) - только оплаченные
-- Это сумма, которую фактически получили заведения/персонал
SELECT 
    SUM("netAmount") as "totalTips",
    COUNT(*) as "totalTransactions",
    AVG("netAmount") as "averageTip"
FROM "Tip"
WHERE "status" = 'PAID';

-- 2. ВСЕГО ЧАЕВЫХ (общая сумма до вычета комиссии) - только оплаченные
-- Это сумма, которую заплатили гости
SELECT 
    SUM("amount") as "totalAmountPaid",
    SUM("netAmount") as "totalNetAmount",
    SUM("platformFee") as "totalPlatformFee",
    COUNT(*) as "totalTransactions"
FROM "Tip"
WHERE "status" = 'PAID';

-- 3. ВСЕГО ЧАЕВЫХ по заведению (venue)
-- Сначала узнайте ID заведения (см. queries/get-venue-id.sql)
-- Затем замените 'venue-id-here' на ID заведения
SELECT 
    v.name as "venueName",
    SUM(t."netAmount") as "totalTips",
    COUNT(*) as "totalTransactions",
    AVG(t."netAmount") as "averageTip"
FROM "Tip" t
JOIN "Venue" v ON t."venueId" = v.id
WHERE t."status" = 'PAID'
  AND t."venueId" = 'venue-id-here'  -- Замените на нужный ID (см. queries/get-venue-id.sql)
GROUP BY v.id, v.name;

-- 4. ВСЕГО ЧАЕВЫХ по всем заведениям (с группировкой)
SELECT 
    v.name as "venueName",
    SUM(t."netAmount") as "totalTips",
    COUNT(*) as "totalTransactions",
    AVG(t."netAmount") as "averageTip"
FROM "Tip" t
JOIN "Venue" v ON t."venueId" = v.id
WHERE t."status" = 'PAID'
GROUP BY v.id, v.name
ORDER BY "totalTips" DESC;

-- 5. ВСЕГО ЧАЕВЫХ по периодам
SELECT 
    DATE_TRUNC('day', "createdAt") as "date",
    SUM("netAmount") as "dailyTips",
    COUNT(*) as "dailyTransactions"
FROM "Tip"
WHERE "status" = 'PAID'
GROUP BY DATE_TRUNC('day', "createdAt")
ORDER BY "date" DESC;

-- 6. ВСЕГО ЧАЕВЫХ за последние 30 дней
SELECT 
    SUM("netAmount") as "totalTipsLast30Days",
    COUNT(*) as "totalTransactionsLast30Days",
    AVG("netAmount") as "averageTipLast30Days"
FROM "Tip"
WHERE "status" = 'PAID'
  AND "createdAt" >= NOW() - INTERVAL '30 days';

-- 7. ВСЕГО ЧАЕВЫХ по статусам (для анализа)
SELECT 
    "status",
    COUNT(*) as "count",
    SUM("amount") as "totalAmount",
    SUM("netAmount") as "totalNetAmount",
    SUM("platformFee") as "totalPlatformFee"
FROM "Tip"
GROUP BY "status"
ORDER BY "count" DESC;

-- 8. ВСЕГО ЧАЕВЫХ с детализацией по типам (PERSONAL/POOL)
SELECT 
    "type",
    COUNT(*) as "count",
    SUM("netAmount") as "totalTips",
    AVG("netAmount") as "averageTip"
FROM "Tip"
WHERE "status" = 'PAID'
GROUP BY "type";

-- 9. ВСЕГО ЧАЕВЫХ по персоналу (топ получателей)
SELECT 
    s."displayName" as "staffName",
    v.name as "venueName",
    SUM(ta."amount") as "totalTipsReceived",
    COUNT(DISTINCT ta."tipId") as "tipsCount"
FROM "TipAllocation" ta
JOIN "Staff" s ON ta."staffId" = s.id
JOIN "Tip" t ON ta."tipId" = t.id
JOIN "Venue" v ON t."venueId" = v.id
WHERE t."status" = 'PAID'
GROUP BY s.id, s."displayName", v.id, v.name
ORDER BY "totalTipsReceived" DESC
LIMIT 20;

-- 10. ВСЕГО ЧАЕВЫХ (самый простой запрос - только сумма)
SELECT SUM("netAmount") as "totalTips"
FROM "Tip"
WHERE "status" = 'PAID';

