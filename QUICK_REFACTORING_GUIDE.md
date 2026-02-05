# 🚀 Быстрая шпаргалка по рефакторингу

## ⚡ Быстрый старт

### 1. Импорты (добавить в начало файла)

```typescript
// Удалить
import { auth } from "@/lib/auth";

// Добавить
import { requireAuth, requireVenueAccess, getVenueIdFromQuery } from '@/lib/api/middleware';
import { handleApiError, validationError, successResponse } from '@/lib/api/error-handler';
```

### 2. Замены (найти и заменить)

#### Auth проверка
```typescript
// БЫЛО:
const session = await auth();
if (!session?.user) {
  return NextResponse.json(
    { code: "AUTH_REQUIRED", message: "Authentication required" },
    { status: 401 }
  );
}

// СТАЛО:
const authResult = await requireAuth();
if ('error' in authResult) return authResult.error;
const { session } = authResult;
```

#### VenueId из query
```typescript
// БЫЛО:
const { searchParams } = new URL(request.url);
const venueId = searchParams.get("venueId");
if (!venueId) {
  return NextResponse.json(
    { code: "VALIDATION_ERROR", message: "venueId is required" },
    { status: 400 }
  );
}

// СТАЛО:
const venueIdResult = getVenueIdFromQuery(request.url);
if ('error' in venueIdResult) return venueIdResult.error;
const { venueId } = venueIdResult;
```

#### Venue access проверка
```typescript
// БЫЛО:
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

// СТАЛО:
const venueResult = await requireVenueAccess(venueId, session);
if ('error' in venueResult) return venueResult.error;
```

#### Validation error
```typescript
// БЫЛО:
return NextResponse.json(
  { code: "VALIDATION_ERROR", message: "Error message" },
  { status: 400 }
);

// СТАЛО:
return validationError('Error message');
```

#### Success response
```typescript
// БЫЛО:
return NextResponse.json({ data }, { status: 201 });

// СТАЛО:
return successResponse({ data }, 201);
```

#### Error handling
```typescript
// БЫЛО:
} catch (error) {
  console.error("Error:", error);
  return NextResponse.json(
    { code: "INTERNAL_ERROR", message: "Internal server error" },
    { status: 500 }
  );
}

// СТАЛО:
} catch (error) {
  return handleApiError(error, 'Operation name');
}
```

## 📋 Чеклист рефакторинга файла

- [ ] Обновить импорты
- [ ] Заменить `auth()` на `requireAuth()`
- [ ] Заменить venue access на `requireVenueAccess()`
- [ ] Заменить venueId extraction на `getVenueIdFromQuery()`
- [ ] Заменить validation errors на `validationError()`
- [ ] Заменить success responses на `successResponse()`
- [ ] Заменить error handling на `handleApiError()`
- [ ] Удалить неиспользуемые импорты
- [ ] Запустить `npm run build`
- [ ] Запустить `npm run test`
- [ ] Закоммитить изменения

## 🎯 Полный пример

### До (240 строк)
```typescript
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });

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

    // Бизнес-логика
    const data = await fetchData(venueId);

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

### После (160 строк)
```typescript
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { requireAuth, requireVenueAccess, getVenueIdFromQuery } from '@/lib/api/middleware';
import { handleApiError, successResponse } from '@/lib/api/error-handler';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { session } = authResult;

    const venueIdResult = getVenueIdFromQuery(request.url);
    if ('error' in venueIdResult) return venueIdResult.error;
    const { venueId } = venueIdResult;

    const venueResult = await requireVenueAccess(venueId, session);
    if ('error' in venueResult) return venueResult.error;

    // Бизнес-логика
    const data = await fetchData(venueId);

    return successResponse({ data });
  } catch (error) {
    return handleApiError(error, 'Get data');
  }
}
```

## 🔧 Команды для проверки

```bash
# Сборка
npm run build

# Тесты
npm run test

# Линтер
npm run lint

# TypeScript проверка
npx tsc --noEmit

# Все вместе
npm run build && npm run test && npm run lint
```

## 📁 Файлы для рефакторинга (приоритет)

### Высокий приоритет
```
src/app/api/staff/[id]/route.ts
src/app/api/menu/items/[id]/route.ts
src/app/api/menu/categories/[id]/route.ts
src/app/api/venues/[id]/route.ts
src/app/api/qr/[id]/route.ts
```

### Средний приоритет
```
src/app/api/venues/[id]/settings/route.ts
src/app/api/venues/[id]/distribution/route.ts
src/app/api/menu/categories/reorder/route.ts
src/app/api/menu/items/reorder/route.ts
```

## 💡 Советы

1. **Рефакторьте по одному файлу**
2. **Тестируйте после каждого изменения**
3. **Коммитьте часто**
4. **Используйте git diff для проверки**
5. **Не меняйте бизнес-логику**

## ⚠️ Что НЕ трогать

- Файлы с mock данными (dashboard, history)
- Webhook endpoints
- Публичные API (tip, tips)
- NextAuth роуты

## 🎓 Дополнительно

Полная документация:
- `REFACTORING_SUMMARY.md` - полный отчет
- `REFACTORING_GUIDE.md` - детальное руководство
- `.kiro/refactoring-structure.md` - архитектура

---

**Время на файл**: ~10-15 минут  
**Экономия кода**: ~30% на файл  
**Сложность**: Низкая (copy-paste паттерн)
