-- ============================================
-- ЗАПРОСЫ ДЛЯ ПОДСЧЕТА ЧАЕВЫХ КОНКРЕТНОГО ЗАВЕДЕНИЯ
-- ============================================

-- 1. ВСЕГО ЧАЕВЫХ ДЛЯ КОНКРЕТНОГО ЗАВЕДЕНИЯ (по ID)
-- Замените 'venue-id-here' на ID заведения
SELECT 
    v.name as "venueName",
    SUM(t."netAmount") as "totalTips",
    COUNT(*) as "totalTransactions",
    AVG(t."netAmount") as "averageTip",
    MIN(t."netAmount") as "minTip",
    MAX(t."netAmount") as "maxTip"
FROM "Tip" t
JOIN "Venue" v ON t."venueId" = v.id
WHERE t."status" = 'PAID'
  AND t."venueId" = 'venue-id-here'  -- Замените на ID заведения
GROUP BY v.id, v.name;

-- 2. ВСЕГО ЧАЕВЫХ ПО НАЗВАНИЮ ЗАВЕДЕНИЯ
SELECT 
    v.name as "venueName",
    SUM(t."netAmount") as "totalTips",
    COUNT(*) as "totalTransactions",
    AVG(t."netAmount") as "averageTip"
FROM "Tip" t
JOIN "Venue" v ON t."venueId" = v.id
WHERE t."status" = 'PAID'
  AND v.name ILIKE '%название заведения%'  -- Замените на название
GROUP BY v.id, v.name;

-- 3. ВСЕГО ЧАЕВЫХ ПО EMAIL МЕНЕДЖЕРА
SELECT 
    v.name as "venueName",
    u.email as "managerEmail",
    SUM(t."netAmount") as "totalTips",
    COUNT(*) as "totalTransactions",
    AVG(t."netAmount") as "averageTip"
FROM "Tip" t
JOIN "Venue" v ON t."venueId" = v.id
JOIN "User" u ON v."managerId" = u.id
WHERE t."status" = 'PAID'
  AND u.email = 'manager@example.com'  -- Замените на email менеджера
GROUP BY v.id, v.name, u.email;

-- 4. ДЕТАЛЬНАЯ СТАТИСТИКА ЧАЕВЫХ (с комиссией)
SELECT 
    v.name as "venueName",
    SUM(t."amount") as "totalAmountPaid",        -- Общая сумма (до комиссии)
    SUM(t."netAmount") as "totalNetAmount",     -- Чистая сумма (после комиссии)
    SUM(t."platformFee") as "totalPlatformFee", -- Комиссия платформы
    COUNT(*) as "totalTransactions",
    AVG(t."netAmount") as "averageTip"
FROM "Tip" t
JOIN "Venue" v ON t."venueId" = v.id
WHERE t."status" = 'PAID'
  AND t."venueId" = 'venue-id-here'  -- Замените на ID заведения
GROUP BY v.id, v.name;

-- 5. ЧАЕВЫЕ ПО ПЕРИОДАМ (для конкретного заведения)
SELECT 
    DATE_TRUNC('day', t."createdAt") as "date",
    SUM(t."netAmount") as "dailyTips",
    COUNT(*) as "dailyTransactions"
FROM "Tip" t
WHERE t."status" = 'PAID'
  AND t."venueId" = 'venue-id-here'  -- Замените на ID заведения
GROUP BY DATE_TRUNC('day', t."createdAt")
ORDER BY "date" DESC
LIMIT 30;  -- Последние 30 дней

-- 6. ЧАЕВЫЕ ЗА ПОСЛЕДНИЕ 30 ДНЕЙ
SELECT 
    v.name as "venueName",
    SUM(t."netAmount") as "totalTipsLast30Days",
    COUNT(*) as "totalTransactionsLast30Days",
    AVG(t."netAmount") as "averageTipLast30Days"
FROM "Tip" t
JOIN "Venue" v ON t."venueId" = v.id
WHERE t."status" = 'PAID'
  AND t."venueId" = 'venue-id-here'  -- Замените на ID заведения
  AND t."createdAt" >= NOW() - INTERVAL '30 days'
GROUP BY v.id, v.name;

-- 7. ЧАЕВЫЕ ПО ТИПАМ (PERSONAL/POOL) для заведения
SELECT 
    v.name as "venueName",
    t."type",
    COUNT(*) as "count",
    SUM(t."netAmount") as "totalTips",
    AVG(t."netAmount") as "averageTip"
FROM "Tip" t
JOIN "Venue" v ON t."venueId" = v.id
WHERE t."status" = 'PAID'
  AND t."venueId" = 'venue-id-here'  -- Замените на ID заведения
GROUP BY v.id, v.name, t."type"
ORDER BY t."type";

-- 8. ТОП ПЕРСОНАЛ ЗАВЕДЕНИЯ (кто получил больше всего чаевых)
SELECT 
    s."displayName" as "staffName",
    SUM(ta."amount") as "totalTipsReceived",
    COUNT(DISTINCT ta."tipId") as "tipsCount",
    AVG(ta."amount") as "averageTip"
FROM "TipAllocation" ta
JOIN "Staff" s ON ta."staffId" = s.id
JOIN "Tip" t ON ta."tipId" = t.id
WHERE t."status" = 'PAID'
  AND t."venueId" = 'venue-id-here'  -- Замените на ID заведения
GROUP BY s.id, s."displayName"
ORDER BY "totalTipsReceived" DESC
LIMIT 10;

-- 9. ПРОСТОЙ ЗАПРОС - ТОЛЬКО СУММА
SELECT SUM("netAmount") as "totalTips"
FROM "Tip"
WHERE "status" = 'PAID'
  AND "venueId" = 'venue-id-here';  -- Замените на ID заведения

-- 10. ЧАЕВЫЕ ПО МЕСЯЦАМ (для конкретного заведения)
SELECT 
    DATE_TRUNC('month', t."createdAt") as "month",
    SUM(t."netAmount") as "monthlyTips",
    COUNT(*) as "monthlyTransactions"
FROM "Tip" t
WHERE t."status" = 'PAID'
  AND t."venueId" = 'venue-id-here'  -- Замените на ID заведения
GROUP BY DATE_TRUNC('month', t."createdAt")
ORDER BY "month" DESC;

