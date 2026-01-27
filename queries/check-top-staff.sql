-- ============================================
-- ДИАГНОСТИКА "ЛУЧШИЕ СОТРУДНИКИ"
-- ============================================

-- 1. ПРОВЕРИТЬ ЕСТЬ ЛИ ALLOCATIONS (распределение чаевых)
SELECT 
    COUNT(*) as "totalAllocations",
    SUM("amount") as "totalAllocatedAmount"
FROM "TipAllocation";

-- 2. ПРОВЕРИТЬ СВЯЗЬ ЧАЕВЫХ И ALLOCATIONS
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
ORDER BY t."createdAt" DESC
LIMIT 10;

-- 3. ПРОВЕРИТЬ ТОП ПЕРСОНАЛ (как в API)
SELECT 
    s.id,
    s."displayName",
    SUM(ta."amount") as "totalTips",
    COUNT(DISTINCT ta."tipId") as "tipsCount"
FROM "TipAllocation" ta
JOIN "Staff" s ON ta."staffId" = s.id
JOIN "Tip" t ON ta."tipId" = t.id
WHERE t."status" = 'PAID'
GROUP BY s.id, s."displayName"
ORDER BY "totalTips" DESC
LIMIT 5;

-- 4. ПРОВЕРИТЬ ТОП ПЕРСОНАЛ ДЛЯ КОНКРЕТНОГО ЗАВЕДЕНИЯ
SELECT 
    s.id,
    s."displayName",
    SUM(ta."amount") as "totalTips",
    COUNT(DISTINCT ta."tipId") as "tipsCount"
FROM "TipAllocation" ta
JOIN "Staff" s ON ta."staffId" = s.id
JOIN "Tip" t ON ta."tipId" = t.id
WHERE t."status" = 'PAID'
  AND t."venueId" = 'venue-id-here'  -- Замените на ID заведения
GROUP BY s.id, s."displayName"
ORDER BY "totalTips" DESC
LIMIT 5;

-- 5. ПРОВЕРИТЬ PAID ЧАЕВЫЕ БЕЗ ALLOCATIONS
SELECT 
    t.id,
    t."midtransOrderId",
    t."status",
    t."netAmount",
    t."createdAt",
    COUNT(ta.id) as "allocationsCount"
FROM "Tip" t
LEFT JOIN "TipAllocation" ta ON t.id = ta."tipId"
WHERE t."status" = 'PAID'
GROUP BY t.id, t."midtransOrderId", t."status", t."netAmount", t."createdAt"
HAVING COUNT(ta.id) = 0
ORDER BY t."createdAt" DESC;

-- 6. ПРОВЕРИТЬ АКТИВНЫЙ ПЕРСОНАЛ
SELECT 
    s.id,
    s."displayName",
    s.status,
    v.name as "venueName"
FROM "Staff" s
JOIN "Venue" v ON s."venueId" = v.id
WHERE s.status = 'ACTIVE'
ORDER BY s."displayName";

-- 7. ПРОВЕРИТЬ РЕЖИМ РАСПРЕДЕЛЕНИЯ ЗАВЕДЕНИЯ
SELECT 
    v.id,
    v.name,
    v."distributionMode",
    COUNT(s.id) as "activeStaffCount"
FROM "Venue" v
LEFT JOIN "Staff" s ON v.id = s."venueId" AND s.status = 'ACTIVE'
GROUP BY v.id, v.name, v."distributionMode";

-- 8. ПОЛНАЯ ДИАГНОСТИКА (почему нет данных)
SELECT 
    'Total Tips' as "metric",
    COUNT(*)::text as "value"
FROM "Tip"
WHERE "status" = 'PAID'
UNION ALL
SELECT 
    'Tips with Allocations',
    COUNT(DISTINCT ta."tipId")::text
FROM "TipAllocation" ta
JOIN "Tip" t ON ta."tipId" = t.id
WHERE t."status" = 'PAID'
UNION ALL
SELECT 
    'Total Allocations',
    COUNT(*)::text
FROM "TipAllocation"
UNION ALL
SELECT 
    'Active Staff',
    COUNT(*)::text
FROM "Staff"
WHERE status = 'ACTIVE'
UNION ALL
SELECT 
    'Staff with Allocations',
    COUNT(DISTINCT "staffId")::text
FROM "TipAllocation";

