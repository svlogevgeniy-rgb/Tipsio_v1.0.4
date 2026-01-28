-- ============================================
-- БЫСТРЫЕ СПОСОБЫ УЗНАТЬ ID ЗАВЕДЕНИЯ
-- ============================================

-- 1. САМЫЙ ПРОСТОЙ - ВСЕ ЗАВЕДЕНИЯ С ID
SELECT 
    id,
    name,
    type,
    status
FROM "Venue"
ORDER BY "createdAt" DESC;

-- 2. ПО НАЗВАНИЮ ЗАВЕДЕНИЯ
SELECT 
    id,
    name
FROM "Venue"
WHERE name ILIKE '%Cafe Organic%';  -- Замените на название вашего заведения

-- 3. ПО EMAIL МЕНЕДЖЕРА (если вы знаете email)
SELECT 
    v.id,
    v.name,
    u.email as "managerEmail"
FROM "Venue" v
JOIN "User" u ON v."managerId" = u.id
WHERE u.email = 'your-email@example.com';  -- Замените на ваш email

-- 4. ВСЕ ЗАВЕДЕНИЯ С EMAIL МЕНЕДЖЕРОВ (чтобы найти свое)
SELECT 
    v.id as "venueId",
    v.name as "venueName",
    u.email as "managerEmail"
FROM "Venue" v
JOIN "User" u ON v."managerId" = u.id
ORDER BY v.name;

-- 5. ЧЕРЕЗ API (если вы авторизованы)
-- Откройте в браузере: http://localhost:3000/api/venues/dashboard
-- В ответе будет: { venue: { id: "...", name: "..." } }

