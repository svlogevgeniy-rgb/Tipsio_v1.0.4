-- ============================================
-- ИСПРАВЛЕННЫЙ ЗАПРОС ДЛЯ ПОЛУЧЕНИЯ ID ЗАВЕДЕНИЯ
-- ============================================

-- ИСПРАВЛЕННАЯ ВЕРСИЯ (была опечатка в алиасе)
SELECT 
    v.id,
    v.name,
    u.email as "managerEmail"  -- Исправлено: было "test8@test.ru"
FROM "Venue" v
JOIN "User" u ON v."managerId" = u.id
WHERE u.email = 'manager@example.com';

-- АЛЬТЕРНАТИВНЫЙ ВАРИАНТ (без JOIN)
SELECT 
    v.id,
    v.name,
    (SELECT email FROM "User" WHERE id = v."managerId") as "managerEmail"
FROM "Venue" v
WHERE v."managerId" IN (
    SELECT id 
    FROM "User" 
    WHERE email = 'manager@example.com'
);

-- ПРОСТОЙ ВАРИАНТ (если знаете email менеджера)
SELECT 
    id,
    name,
    "managerId"
FROM "Venue"
WHERE "managerId" = (
    SELECT id 
    FROM "User" 
    WHERE email = 'manager@example.com'
    LIMIT 1
);

