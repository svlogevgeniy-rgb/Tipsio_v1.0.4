-- ============================================
-- ПРОВЕРКА СТАТУСА ЧАЕВЫХ ПО ORDER_ID
-- ============================================

-- 1. ПРОВЕРИТЬ СТАТУС КОНКРЕТНОГО ЧАЕВЫХ ПО ORDER_ID
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

-- 2. ПРОВЕРИТЬ ВСЕ ЧАЕВЫЕ С ЭТИМ ORDER_ID (если есть дубликаты)
SELECT 
    id,
    "midtransOrderId",
    "status",
    "venueId",
    "createdAt",
    "updatedAt"
FROM "Tip"
WHERE "midtransOrderId" LIKE '%TIP-cmj8fyv8-1768577522136-idauo4%'
   OR "midtransOrderId" = 'TIP-cmj8fyv8-1768577522136-idauo4';

-- 3. ПРОВЕРИТЬ WEBHOOK ЛОГИ ДЛЯ ЭТОГО ORDER_ID
SELECT 
    id,
    processed,
    error,
    "createdAt",
    (payload->>'order_id') as "orderId",
    (payload->>'transaction_status') as "transactionStatus",
    (payload->>'status_code') as "statusCode"
FROM "WebhookLog"
WHERE provider = 'midtrans'
  AND (payload->>'order_id') = 'TIP-cmj8fyv8-1768577522136-idauo4'
ORDER BY "createdAt" DESC;

-- 4. ПРОВЕРИТЬ ALLOCATIONS ДЛЯ ЭТОГО ЧАЕВЫХ
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

-- 5. ПОЛНАЯ ИНФОРМАЦИЯ О ЧАЕВЫХ
SELECT 
    t.id,
    t."midtransOrderId",
    t."status",
    t."amount",
    t."netAmount",
    t."platformFee",
    t."midtransTransactionId",
    t."midtransPaymentType",
    t."midtransTransactionTime",
    v.name as "venueName",
    COUNT(ta.id) as "allocationsCount",
    t."createdAt",
    t."updatedAt"
FROM "Tip" t
JOIN "Venue" v ON t."venueId" = v.id
LEFT JOIN "TipAllocation" ta ON t.id = ta."tipId"
WHERE t."midtransOrderId" = 'TIP-cmj8fyv8-1768577522136-idauo4'
GROUP BY t.id, v.name;

