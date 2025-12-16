# Структура рефакторинга

## 📁 Созданная инфраструктура

```
src/
├── types/
│   └── api.ts                          # Типы API (коды ошибок, ответы, сессии)
│
├── lib/
│   └── api/
│       ├── index.ts                    # Централизованный экспорт
│       ├── middleware.ts               # Auth & Access проверки
│       ├── error-handler.ts            # Обработка ошибок
│       └── client.ts                   # HTTP клиент для фронтенда
│
└── hooks/
    ├── use-session-storage.ts          # SessionStorage хуки
    ├── use-api.ts                      # API состояние и мутации
    └── use-optimistic-update.ts        # Оптимистичные обновления
```

## 🔄 Паттерн использования

### API Route (Backend)

```typescript
// 1. Импорты
import { requireAuth, requireVenueAccess, getVenueIdFromQuery } from '@/lib/api/middleware';
import { handleApiError, successResponse } from '@/lib/api/error-handler';

export async function GET(request: NextRequest) {
  try {
    // 2. Проверка аутентификации
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { session } = authResult;

    // 3. Получение параметров
    const venueIdResult = getVenueIdFromQuery(request.url);
    if ('error' in venueIdResult) return venueIdResult.error;
    const { venueId } = venueIdResult;

    // 4. Проверка доступа
    const venueResult = await requireVenueAccess(venueId, session);
    if ('error' in venueResult) return venueResult.error;

    // 5. Бизнес-логика
    const data = await fetchData();

    // 6. Успешный ответ
    return successResponse({ data });
  } catch (error) {
    // 7. Обработка ошибок
    return handleApiError(error, 'Operation name');
  }
}
```

### React Hook (Frontend)

```typescript
// 1. Импорты
import { apiGet, apiPost } from '@/lib/api/client';
import { useApiMutation } from '@/hooks/use-api';
import { useOptimisticUpdate } from '@/hooks/use-optimistic-update';

export function useMyFeature() {
  // 2. Состояние
  const [data, setData] = useState([]);
  const { mutate, loading, error } = useApiMutation();
  const { performUpdate } = useOptimisticUpdate();

  // 3. Fetch данных
  const fetchData = async () => {
    const result = await apiGet('/api/endpoint');
    setData(result.data);
  };

  // 4. Мутация с оптимистичным обновлением
  const updateItem = async (id, updates) => {
    await performUpdate(
      data,
      () => setData(optimisticUpdate(data, id, updates)),
      () => apiPost(`/api/endpoint/${id}`, updates),
      (snapshot) => setData(snapshot)
    );
  };

  return { data, updateItem, loading, error };
}
```

## 🎯 Преимущества архитектуры

### До рефакторинга
```
API Route (240 строк)
├── Auth проверка (15 строк) ❌ Дублируется
├── VenueId извлечение (10 строк) ❌ Дублируется
├── Venue access проверка (20 строк) ❌ Дублируется
├── Бизнес-логика (150 строк) ✅
└── Error handling (45 строк) ❌ Дублируется
```

### После рефакторинга
```
API Route (160 строк)
├── requireAuth() (1 строка) ✅ Переиспользуется
├── getVenueIdFromQuery() (1 строка) ✅ Переиспользуется
├── requireVenueAccess() (1 строка) ✅ Переиспользуется
├── Бизнес-логика (150 строк) ✅
└── handleApiError() (1 строка) ✅ Переиспользуется
```

**Экономия**: 80 строк (33%) на каждом роуте!

## 📊 Зависимости

```
┌─────────────────────────────────────────┐
│         API Routes (42 файла)           │
│  /api/staff, /api/qr, /api/menu, etc.  │
└────────────────┬────────────────────────┘
                 │
                 ├─────────────────────────┐
                 │                         │
        ┌────────▼────────┐       ┌───────▼────────┐
        │  API Middleware │       │  Error Handler │
        │  - requireAuth  │       │  - handleError │
        │  - requireAccess│       │  - validation  │
        └────────┬────────┘       └───────┬────────┘
                 │                        │
                 └────────┬───────────────┘
                          │
                  ┌───────▼────────┐
                  │   API Types    │
                  │  - ErrorCode   │
                  │  - Session     │
                  └────────────────┘
```

```
┌─────────────────────────────────────────┐
│      React Components & Hooks           │
│  useVenueMenu, useStaffManagement, etc. │
└────────────────┬────────────────────────┘
                 │
                 ├─────────────────────────┐
                 │                         │
        ┌────────▼────────┐       ┌───────▼────────┐
        │   API Client    │       │   API Hooks    │
        │  - apiGet       │       │  - useApiState │
        │  - apiPost      │       │  - useMutation │
        └────────┬────────┘       └───────┬────────┘
                 │                        │
                 └────────┬───────────────┘
                          │
                  ┌───────▼────────┐
                  │   API Types    │
                  │  - ApiError    │
                  │  - Response    │
                  └────────────────┘
```

## 🔍 Примеры использования

### Пример 1: Простой GET запрос

**До**:
```typescript
const session = await auth();
if (!session?.user) {
  return NextResponse.json({ code: "AUTH_REQUIRED", ... }, { status: 401 });
}
const venueId = searchParams.get("venueId");
if (!venueId) {
  return NextResponse.json({ code: "VALIDATION_ERROR", ... }, { status: 400 });
}
const venue = await prisma.venue.findUnique({ where: { id: venueId } });
if (!venue) {
  return NextResponse.json({ code: "NOT_FOUND", ... }, { status: 404 });
}
if (session.user.role !== "ADMIN" && venue.managerId !== session.user.id) {
  return NextResponse.json({ code: "FORBIDDEN", ... }, { status: 403 });
}
```

**После**:
```typescript
const authResult = await requireAuth();
if ('error' in authResult) return authResult.error;
const venueIdResult = getVenueIdFromQuery(request.url);
if ('error' in venueIdResult) return venueIdResult.error;
const venueResult = await requireVenueAccess(venueIdResult.venueId, authResult.session);
if ('error' in venueResult) return venueResult.error;
```

### Пример 2: POST с валидацией

**До**:
```typescript
const parsed = schema.safeParse(data);
if (!parsed.success) {
  return NextResponse.json(
    { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message },
    { status: 400 }
  );
}
```

**После**:
```typescript
const parsed = schema.safeParse(data);
if (!parsed.success) {
  return validationError(parsed.error.issues[0].message);
}
```

### Пример 3: Обработка ошибок

**До**:
```typescript
} catch (error) {
  console.error("Error:", error);
  return NextResponse.json(
    { code: "INTERNAL_ERROR", message: "Internal server error" },
    { status: 500 }
  );
}
```

**После**:
```typescript
} catch (error) {
  return handleApiError(error, 'Operation name');
}
```

## 📈 Масштабируемость

### Добавление нового API роута

**До рефакторинга** (нужно написать):
- Auth проверка: ~15 строк
- Access проверка: ~20 строк
- Error handling: ~45 строк
- Бизнес-логика: ~100 строк
**Итого**: ~180 строк

**После рефакторинга** (нужно написать):
- Использование утилит: ~5 строк
- Бизнес-логика: ~100 строк
**Итого**: ~105 строк

**Экономия времени**: ~40%

### Изменение логики auth

**До рефакторинга**:
- Нужно изменить ~42 файла
- Риск пропустить файл
- Сложно тестировать

**После рефакторинга**:
- Изменить 1 файл (`middleware.ts`)
- Автоматически применяется везде
- Легко тестировать

## 🎓 Обучение команды

### Новый разработчик

**До**:
- Изучить 42 разных роута
- Понять разные паттерны
- Риск ошибок

**После**:
- Изучить 1 паттерн
- Применять везде одинаково
- Меньше ошибок

### Code Review

**До**:
- Проверять auth/access в каждом файле
- Проверять error handling
- Много времени

**После**:
- Проверять только бизнес-логику
- Утилиты уже проверены
- Быстрее

## 🔐 Безопасность

### Централизованная проверка

```typescript
// Все проверки в одном месте
export async function requireAuth() {
  // Единая логика для всех роутов
  // Легко добавить дополнительные проверки
  // Легко аудировать
}
```

### Типизация

```typescript
// Невозможно забыть проверку
const authResult = await requireAuth();
if ('error' in authResult) return authResult.error;
// TypeScript гарантирует, что мы обработали ошибку
```

## 📝 Тестирование

### Юнит-тесты утилит

```typescript
describe('requireAuth', () => {
  it('should return error when not authenticated', async () => {
    const result = await requireAuth();
    expect('error' in result).toBe(true);
  });
});
```

### Интеграционные тесты роутов

```typescript
// Теперь можно мокировать утилиты
jest.mock('@/lib/api/middleware');

describe('GET /api/staff', () => {
  it('should return staff list', async () => {
    // Мокируем auth
    requireAuth.mockResolvedValue({ session: mockSession });
    // Тестируем только бизнес-логику
  });
});
```

---

**Создано**: 16 декабря 2024  
**Версия**: 1.0  
**Статус**: Готово к использованию
