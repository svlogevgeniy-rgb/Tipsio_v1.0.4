-- ============================================
-- СПОСОБЫ ПОЛУЧЕНИЯ ID ЗАВЕДЕНИЯ
-- ============================================

-- 1. ВСЕ ЗАВЕДЕНИЯ С ИХ ID (самый простой способ)
SELECT 
    id,
    name,
    type,
    status,
    "managerId",
    "createdAt"
FROM "Venue"
ORDER BY "createdAt" DESC;

-- 2. ID ЗАВЕДЕНИЯ ПО ИМЕНИ (если знаете название)
SELECT 
    id,
    name,
    type,
    status
FROM "Venue"
WHERE name ILIKE '%название заведения%';  -- Замените на название

-- 3. ID ЗАВЕДЕНИЯ ПО ID МЕНЕДЖЕРА (если знаете ID пользователя-менеджера)
SELECT 
    id,
    name,
    type,
    status
FROM "Venue"
WHERE "managerId" = 'user-id-here';  -- Замените на ID пользователя

-- 4. ID ЗАВЕДЕНИЯ ПО EMAIL МЕНЕДЖЕРА
SELECT 
    v.id,
    v.name,
    v.type,
    v.status,
    u.email as "managerEmail"
FROM "Venue" v
JOIN "User" u ON v."managerId" = u.id
WHERE u.email = 'manager@example.com';  -- Замените на email менеджера

-- 5. ВСЕ ЗАВЕДЕНИЯ С ИНФОРМАЦИЕЙ О МЕНЕДЖЕРЕ
SELECT 
    v.id as "venueId",
    v.name as "venueName",
    v.type,
    v.status,
    u.id as "managerId",
    u.email as "managerEmail",
    u.role
FROM "Venue" v
JOIN "User" u ON v."managerId" = u.id
ORDER BY v."createdAt" DESC;

-- 6. ID ЗАВЕДЕНИЯ ПО ID ПЕРСОНАЛА (если знаете ID сотрудника)
SELECT 
    v.id as "venueId",
    v.name as "venueName",
    s.id as "staffId",
    s."displayName" as "staffName"
FROM "Venue" v
JOIN "Staff" s ON v.id = s."venueId"
WHERE s.id = 'staff-id-here';  -- Замените на ID сотрудника

-- 7. ID ЗАВЕДЕНИЯ ПО QR-КОДУ (если знаете ID QR-кода)
SELECT 
    v.id as "venueId",
    v.name as "venueName",
    qr.id as "qrCodeId",
    qr."shortCode"
FROM "Venue" v
JOIN "QrCode" qr ON v.id = qr."venueId"
WHERE qr.id = 'qr-code-id-here';  -- Замените на ID QR-кода

-- 8. ID ЗАВЕДЕНИЯ ПО SHORT CODE QR-КОДА
SELECT 
    v.id as "venueId",
    v.name as "venueName",
    qr."shortCode"
FROM "Venue" v
JOIN "QrCode" qr ON v.id = qr."venueId"
WHERE qr."shortCode" = 'shortcode-here';  -- Замените на short code

-- 9. ID ЗАВЕДЕНИЯ ПО ТРАНЗАКЦИИ (если знаете ID чаевых)
SELECT 
    v.id as "venueId",
    v.name as "venueName",
    t.id as "tipId",
    t."netAmount"
FROM "Venue" v
JOIN "Tip" t ON v.id = t."venueId"
WHERE t.id = 'tip-id-here';  -- Замените на ID транзакции

-- 10. АКТИВНЫЕ ЗАВЕДЕНИЯ (только активные)
SELECT 
    id,
    name,
    type,
    status
FROM "Venue"
WHERE status = 'ACTIVE'
ORDER BY name;

