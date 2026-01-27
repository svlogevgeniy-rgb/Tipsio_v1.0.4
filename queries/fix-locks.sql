-- ============================================
-- РЕШЕНИЕ ПРОБЛЕМЫ С БЛОКИРОВКАМИ ТАБЛИЦ
-- ============================================

-- 1. ПРОВЕРИТЬ ТЕКУЩИЕ БЛОКИРОВКИ
SELECT 
    locktype,
    relation::regclass as "table_name",
    mode,
    granted,
    pid,
    usename,
    application_name
FROM pg_locks l
JOIN pg_stat_activity a ON l.pid = a.pid
WHERE relation IS NOT NULL
ORDER BY relation;

-- 2. ПРОВЕРИТЬ АКТИВНЫЕ ТРАНЗАКЦИИ
SELECT 
    pid,
    usename,
    application_name,
    state,
    query_start,
    now() - query_start as "duration",
    query
FROM pg_stat_activity
WHERE state != 'idle'
  AND query NOT LIKE '%pg_stat_activity%'
ORDER BY query_start;

-- 3. ЗАВЕРШИТЬ ЗАВИСШИЕ ЗАПРОСЫ (ОСТОРОЖНО!)
-- Замените PID на номер процесса из запроса выше
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid = 12345;  -- Замените на реальный PID

-- 4. ЗАВЕРШИТЬ ВСЕ ЗАВИСШИЕ ЗАПРОСЫ (ОЧЕНЬ ОСТОРОЖНО!)
-- Это завершит ВСЕ активные подключения, кроме вашего
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid != pg_backend_pid()
  AND state != 'idle';

-- 5. ИСПРАВЛЕННЫЙ ЗАПРОС (была опечатка)
SELECT 
    v.id,
    v.name,
    u.email as "managerEmail"  -- Исправлено: было "test8@test.ru"
FROM "Venue" v
JOIN "User" u ON v."managerId" = u.id
WHERE u.email = 'manager@example.com';

-- 6. ВАРИАНТ БЕЗ JOIN (если JOIN вызывает проблемы)
SELECT 
    id,
    name,
    "managerId"
FROM "Venue"
WHERE "managerId" IN (
    SELECT id 
    FROM "User" 
    WHERE email = 'manager@example.com'
);

