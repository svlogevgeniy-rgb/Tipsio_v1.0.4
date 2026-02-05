# Отчёт о проблеме: Неправильное начисление чаевых

**Дата обнаружения:** 5 февраля 2026  
**Затронутый аккаунт:** TestMid@gmail.com  
**Venue ID:** cml7t8jaf000146v36zp19nhh  
**Venue Name:** TestMid

## 🔍 Описание проблемы

При оплате чаевых через Midtrans создаются записи `TipAllocation`, но **балансы сотрудников не обновляются**. В результате:
- Чаевые помечаются как оплаченные (PAID)
- Создаются записи распределения (TipAllocation)
- Но `Staff.balance` остаётся равным 0
- На странице `/venue/payouts` все сотрудники показываются как "Выплачено"

## 📊 Данные из production

### Venue: TestMid
- **Manager Email:** TestMid@gmail.com
- **Venue ID:** cml7t8jaf000146v36zp19nhh
- **Status:** ACTIVE

### Сотрудники
| ID | Имя | Роль | Баланс | Чаевых |
|----|-----|------|--------|--------|
| cml7t8jam000246v3ukmip3an | Admin | ADMINISTRATOR | 0 | 1 |
| cml99bi5n000085v3207vyxqj | Waiter | WAITER | 0 | 1 |

### Транзакции чаевых
| ID | Сумма | Статус | Дата | Сотрудник | Распределено |
|----|-------|--------|------|-----------|--------------|
| cml9lm1j8000d85v390qg3d2t | 150,000 | PAID | 2026-02-05 15:15 | Waiter | 142,500 |
| cml9li8bw000a85v3jttimbyq | 100,000 | PAID | 2026-02-05 15:12 | Admin | 95,000 |

**Проблема:** Чаевые распределены (allocated_amount), но балансы = 0!

## 🐛 Причина проблемы

### Код в `src/app/api/webhook/midtrans/route.ts` и `src/app/api/tips/[orderId]/route.ts`

Функция `allocateTip()` создаёт записи `TipAllocation`, но **не обновляет** `Staff.balance`:

```typescript
// ❌ СТАРЫЙ КОД (неправильный)
async function allocateTip(tipId: string) {
  // ...
  if (tip.type === "PERSONAL" && tip.staffId) {
    await prisma.tipAllocation.create({
      data: {
        tipId: tip.id,
        staffId: tip.staffId,
        amount: tip.netAmount,
        date: today,
      },
    });
    // ❌ Баланс НЕ обновляется!
  }
  // ...
}
```

## ✅ Решение

### 1. Исправлен код в двух файлах:
- `src/app/api/webhook/midtrans/route.ts`
- `src/app/api/tips/[orderId]/route.ts`

### 2. Новая логика с обновлением баланса:

```typescript
// ✅ НОВЫЙ КОД (правильный)
async function allocateTip(tipId: string) {
  // ...
  if (tip.type === "PERSONAL" && tip.staffId) {
    await prisma.$transaction([
      // Создаём запись распределения
      prisma.tipAllocation.create({
        data: {
          tipId: tip.id,
          staffId: tip.staffId,
          amount: tip.netAmount,
          date: today,
        },
      }),
      // ✅ Обновляем баланс сотрудника
      prisma.staff.update({
        where: { id: tip.staffId },
        data: {
          balance: {
            increment: tip.netAmount,
          },
        },
      }),
    ]);
  }
  // ...
}
```

### 3. Создан скрипт миграции

Файл: `scripts/fix-staff-balances.ts`

Скрипт пересчитывает балансы всех сотрудников на основе существующих `TipAllocation` записей.

## 🚀 План развёртывания

### Шаг 1: Деплой исправленного кода
```bash
# На локальной машине
git add src/app/api/webhook/midtrans/route.ts src/app/api/tips/[orderId]/route.ts
git commit -m "fix: update staff balance when allocating tips"
git push tipsio_v104 main

# На сервере
cd /var/www/tipsio
git pull origin main
npm install
npm run build
pm2 restart tipsio
```

### Шаг 2: Исправить существующие данные
```bash
# На сервере
cd /var/www/tipsio
npx ts-node scripts/fix-staff-balances.ts
```

### Шаг 3: Проверка
```bash
# Проверить балансы сотрудников
PGPASSWORD=tipsio_secure_pass_2026 psql -U tipsio_user -d tipsio_prod -h localhost \
  -c "SELECT s.\"displayName\", s.balance, COUNT(ta.id) as tips_count 
      FROM \"Staff\" s 
      LEFT JOIN \"TipAllocation\" ta ON ta.\"staffId\" = s.id AND ta.\"payoutId\" IS NULL
      WHERE s.\"venueId\" = 'cml7t8jaf000146v36zp19nhh' 
      GROUP BY s.id;"
```

## 📝 Ожидаемый результат

После исправления:
- **Admin**: balance = 95,000 (было 0)
- **Waiter**: balance = 142,500 (было 0)
- На странице `/venue/payouts` появятся кнопки "Выплачено"
- Новые чаевые будут корректно увеличивать балансы

## 🔒 Предотвращение повторения

1. ✅ Код исправлен в обоих местах
2. ✅ Используется транзакция для атомарности
3. ✅ Скрипт миграции для исправления старых данных
4. 📝 TODO: Добавить тесты для проверки обновления баланса

## 📞 Контакты

- **Venue Manager:** TestMid@gmail.com
- **Server:** root@31.130.155.71
- **Database:** tipsio_prod
