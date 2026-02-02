# Руководство по завершению рефакторинга

## 📋 Обзор

Создана инфраструктура для упрощения и стандартизации API роутов и хуков. Рефакторинг выполнен на ~10% кодовой базы, демонстрируя паттерны для остальных файлов.

## 🎯 Созданная инфраструктура

### 1. API Middleware (`src/lib/api/middleware.ts`)

Функции для стандартизации проверок:

```typescript
// Проверка аутентификации
const authResult = await requireAuth();
if ('error' in authResult) return authResult.error;
const { session } = authResult;

// Проверка доступа к venue
const venueResult = await requireVenueAccess(venueId, session);
if ('error' in venueResult) return venueResult.error;

// Извлечение venueId из query
const venueIdResult = getVenueIdFromQuery(request.url);
if ('error' in venueIdResult) return venueIdResult.error;
const { venueId } = venueIdResult;

// Проверка роли
const roleResult = requireRole(session, ['ADMIN', 'MANAGER']);
if ('error' in roleResult) return roleResult.error;
```

### 2. Error Handler (`src/lib/api/error-handler.ts`)

Централизованная обработка ошибок:

```typescript
// Обработка любых ошибок
return handleApiError(error, 'Context description');

// Специфичные ошибки
return validationError('Field is required');
return notFoundError('Resource');

// Успешный ответ
return successResponse({ data }, 201);
```

### 3. API Client (`src/lib/api/client.ts`)

Типизированные запросы для клиента:

```typescript
// GET запрос
const data = await apiGet<ResponseType>('/api/endpoint');

// POST запрос
const result = await apiPost<ResponseType>('/api/endpoint', { payload });

// С параметрами
const url = buildUrl('/api/endpoint', { venueId: '123', filter: 'active' });
```

### 4. Хуки

```typescript
// Session storage
const [value, setValue, clearValue] = useSessionStorage('key', initialValue);

// Группа значений
const { values, setValue, clearAll } = useSessionStorageGroup('prefix', initialValues);

// API мутации
const { mutate, loading, error } = useApiMutation();

// Оптимистичные обновления
const { performUpdate } = useOptimisticUpdate();
```

## 📝 Паттерн рефакторинга API роута

### До:
```typescript
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { code: "AUTH_REQUIRED", message: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venueId");

    if (!venueId) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "venueId is required" },
        { status: 400 }
      );
    }

    const venue = await prisma.venue.findUnique({ where: { id: venueId } });

    if (!venue) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Venue not found" },
        { status: 404 }
      );
    }

    if (session.user.role !== "ADMIN" && venue.managerId !== session.user.id) {
      return NextResponse.json(
        { code: "FORBIDDEN", message: "Access denied" },
        { status: 403 }
      );
    }

    // Бизнес-логика...
    const data = await fetchData();

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### После:
```typescript
import { requireAuth, requireVenueAccess, getVenueIdFromQuery } from '@/lib/api/middleware';
import { handleApiError, successResponse } from '@/lib/api/error-handler';

export async function GET(request: NextRequest) {
  try {
    // Проверка аутентификации
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { session } = authResult;

    // Получение venueId
    const venueIdResult = getVenueIdFromQuery(request.url);
    if ('error' in venueIdResult) return venueIdResult.error;
    const { venueId } = venueIdResult;

    // Проверка доступа
    const venueResult = await requireVenueAccess(venueId, session);
    if ('error' in venueResult) return venueResult.error;

    // Бизнес-логика...
    const data = await fetchData();

    return successResponse({ data });
  } catch (error) {
    return handleApiError(error, 'Context');
  }
}
```

**Результат**: Код сокращается на 30-40%, улучшается читаемость.

## 🔄 Список файлов для рефакторинга

### Высокий приоритет (часто используемые):

#### API Routes:
- [ ] `src/app/api/staff/[id]/route.ts` (GET, PATCH, DELETE)
- [ ] `src/app/api/menu/items/[id]/route.ts` (GET, PUT, DELETE, PATCH)
- [ ] `src/app/api/menu/categories/[id]/route.ts` (GET, PUT, DELETE)
- [ ] `src/app/api/venues/[id]/route.ts` (GET, PUT)
- [ ] `src/app/api/venues/[id]/settings/route.ts` (GET, PUT)
- [ ] `src/app/api/venues/[id]/distribution/route.ts` (GET, PUT)
- [ ] `src/app/api/qr/[id]/route.ts` (GET, DELETE)
- [ ] `src/app/api/menu/categories/reorder/route.ts` (PUT)
- [ ] `src/app/api/menu/items/reorder/route.ts` (PUT)

#### Хуки:
- [ ] `src/components/venue/menu/use-venue-menu.ts`
- [ ] `src/components/venue/staff/use-staff-management.ts`

### Средний приоритет:

#### API Routes:
- [ ] `src/app/api/venues/[id]/midtrans/route.ts`
- [ ] `src/app/api/qr/[id]/download/route.ts`
- [ ] `src/app/api/qr/[id]/material/route.ts`
- [ ] `src/app/api/staff/[id]/payout/route.ts`
- [ ] `src/app/api/staff/payout-all/route.ts`
- [ ] `src/app/api/upload/route.ts`

### Низкий приоритет (специфичная логика):

- [ ] `src/app/api/venues/dashboard/route.ts` (содержит mock данные)
- [ ] `src/app/api/staff/dashboard/route.ts` (содержит mock данные)
- [ ] `src/app/api/staff/history/route.ts` (содержит mock данные)
- [ ] `src/app/api/payouts/route.ts` (содержит mock данные)

### Не требуют рефакторинга:

- `src/app/api/auth/[...nextauth]/route.ts` (NextAuth)
- `src/app/api/webhook/midtrans/route.ts` (webhook, специфичная логика)
- `src/app/api/tip/[shortCode]/route.ts` (публичный endpoint)
- `src/app/api/tips/route.ts` (публичный endpoint)
- `src/app/api/otp/*` (специфичная логика)

## 🛠️ Пошаговый процесс рефакторинга файла

### 1. Подготовка
```bash
# Создать резервную копию
cp src/app/api/path/route.ts src/app/api/path/route.ts.backup
```

### 2. Обновить импорты
```typescript
// Удалить
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server"; // если не используется напрямую

// Добавить
import { requireAuth, requireVenueAccess, getVenueIdFromQuery } from '@/lib/api/middleware';
import { handleApiError, validationError, successResponse } from '@/lib/api/error-handler';
```

### 3. Заменить проверку аутентификации
```typescript
// Было:
const session = await auth();
if (!session?.user) {
  return NextResponse.json({ code: "AUTH_REQUIRED", ... }, { status: 401 });
}

// Стало:
const authResult = await requireAuth();
if ('error' in authResult) return authResult.error;
const { session } = authResult;
```

### 4. Заменить проверку venue
```typescript
// Было:
const venue = await prisma.venue.findUnique({ where: { id: venueId } });
if (!venue) { return NextResponse.json({ code: "NOT_FOUND", ... }, { status: 404 }); }
if (session.user.role !== "ADMIN" && venue.managerId !== session.user.id) {
  return NextResponse.json({ code: "FORBIDDEN", ... }, { status: 403 });
}

// Стало:
const venueResult = await requireVenueAccess(venueId, session);
if ('error' in venueResult) return venueResult.error;
```

### 5. Заменить обработку ошибок
```typescript
// Было:
} catch (error) {
  console.error("Error:", error);
  return NextResponse.json({ code: "INTERNAL_ERROR", ... }, { status: 500 });
}

// Стало:
} catch (error) {
  return handleApiError(error, 'Operation name');
}
```

### 6. Заменить успешные ответы
```typescript
// Было:
return NextResponse.json({ data }, { status: 201 });

// Стало:
return successResponse({ data }, 201);
```

### 7. Проверка
```bash
# Проверить сборку
npm run build

# Запустить тесты
npm run test

# Проверить линтер
npm run lint
```

### 8. Удалить backup
```bash
rm src/app/api/path/route.ts.backup
```

## 📊 Метрики успеха

После завершения рефакторинга:

- ✅ Сокращение кода на 20-30%
- ✅ Единообразие всех API роутов
- ✅ Улучшенная типизация
- ✅ Упрощенное тестирование
- ✅ Легкость добавления новых роутов
- ✅ Централизованная обработка ошибок

## 🚀 Следующие шаги после рефакторинга API

### 1. Консолидация схем валидации
Создать структуру:
```
src/lib/schemas/
  ├── auth.ts      # Схемы аутентификации
  ├── venue.ts     # Схемы venue
  ├── staff.ts     # Схемы staff
  ├── menu.ts      # Схемы меню
  └── index.ts     # Экспорты
```

### 2. Рефакторинг хуков
- Применить `useOptimisticUpdate` к `useVenueMenu`
- Применить `useApiMutation` к `useStaffManagement`
- Создать общий `useFetch` хук

### 3. Очистка устаревших файлов
```bash
# Проверить использование
git log --all --full-history -- src/app/page-old.tsx
git log --all --full-history -- src/app/page-dark.tsx

# Если не используются - удалить
rm src/app/page-old.tsx
rm src/app/page-dark.tsx
```

### 4. Улучшение middleware
Вынести конфигурацию роутов:
```typescript
// src/config/routes.ts
export const PROTECTED_ROUTES = {
  admin: {
    paths: ['/admin', '/api/admin'],
    roles: ['ADMIN'],
  },
  venue: {
    paths: ['/venue/dashboard', '/api/venues'],
    roles: ['MANAGER', 'ADMIN'],
  },
  // ...
};
```

## 💡 Советы

1. **Рефакторьте постепенно**: По 2-3 файла за раз
2. **Тестируйте после каждого изменения**: `npm run build && npm run test`
3. **Коммитьте часто**: Каждый рефакторенный файл - отдельный коммит
4. **Используйте git diff**: Проверяйте изменения перед коммитом
5. **Не меняйте логику**: Только структуру и стиль

## ⚠️ Предостережения

1. **Не трогайте файлы с mock данными** без тщательной проверки
2. **Не рефакторьте webhook endpoints** - они имеют специфичную логику
3. **Не меняйте публичные API** без проверки клиентов
4. **Сохраняйте обратную совместимость** API контрактов

## 📚 Дополнительные ресурсы

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Zod Documentation](https://zod.dev/)
