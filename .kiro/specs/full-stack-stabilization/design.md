# Design Document: Full-Stack Stabilization (TIPS-31)

## Overview

Этот документ описывает технический дизайн для комплексной стабилизации проекта TIPSIO. Основные области работы:

1. **Build стабильность** - устранение ошибок сборки и типизации
2. **Landing Page** - исправление hero-секции, текстов и адаптивной вёрстки
3. **Admin Panel** - оптимизация производительности и стабильности
4. **Backend** - устранение проблем с API

## Architecture

### Текущая архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App                          │
├─────────────────────────────────────────────────────────────┤
│  Landing Page (/)          │  Admin Panel (/admin/*)        │
│  - LandingHeroSection      │  - AdminDashboardPage          │
│  - LandingNavigation       │  - AdminVenuesPage             │
│  - Other sections          │  - AdminTransactionsPage       │
├─────────────────────────────────────────────────────────────┤
│                    API Routes (/api/*)                      │
│  - /api/admin/venues       │  - /api/admin/transactions     │
│  - /api/staff/*            │  - /api/venues/*               │
├─────────────────────────────────────────────────────────────┤
│                    Shared Components                        │
│  - UI components (Button, Input, Dialog, etc.)              │
│  - Layout components (AuroraBackground)                     │
│  - i18n system (next-intl)                                  │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                               │
│  - Prisma ORM                                               │
│  - PostgreSQL Database                                      │
└─────────────────────────────────────────────────────────────┘
```

### Проблемные области

1. **useEffect dependencies** - отсутствуют зависимости в хуках админки
2. **API запросы** - нет debounce при изменении фильтров
3. **Error handling** - недостаточная обработка ошибок в UI
4. **Loading states** - базовые, но можно улучшить

## Components and Interfaces

### 1. Landing Page Components

#### LandingHeroSection
- **Текущее состояние**: Работает корректно
- **Потенциальные проблемы**: 
  - Проверить контраст текста
  - Убедиться в корректности i18n ключей

#### LandingNavigation
- **Текущее состояние**: Работает корректно
- **Потенциальные проблемы**:
  - Hardcoded русский текст в dropdown меню (должен быть i18n)

### 2. Admin Panel Components

#### AdminVenuesPage (`src/app/admin/venues/page.tsx`)

**Текущие проблемы:**
```typescript
// Проблема: fetchVenues не в зависимостях useEffect
useEffect(() => {
  fetchVenues()
}, [search, statusFilter]) // Warning: missing dependency 'fetchVenues'
```

**Решение:**
```typescript
// Вариант 1: useCallback для fetchVenues
const fetchVenues = useCallback(async () => {
  // ... fetch logic
}, [search, statusFilter]);

useEffect(() => {
  fetchVenues();
}, [fetchVenues]);

// Вариант 2: Inline fetch в useEffect (предпочтительно для простоты)
useEffect(() => {
  const fetchVenues = async () => {
    // ... fetch logic
  };
  fetchVenues();
}, [search, statusFilter]);
```

#### AdminTransactionsPage (`src/app/admin/transactions/page.tsx`)

**Аналогичная проблема с useEffect dependencies.**

### 3. API Error Handling

#### Текущая структура
```typescript
// src/lib/api/error-handler.ts
export function handleApiError(error: unknown, context: string) {
  // Обработка ошибок
}

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}
```

**Улучшения не требуются** - текущая реализация достаточна.

## Data Models

Существующие модели Prisma не требуют изменений для этой задачи.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Translation Key Completeness

*For any* translation key used in a React component, that key SHALL exist in all locale files (en.json, ru.json, id.json).

**Validates: Requirements 3.4**

### Property 2: API Request Deduplication

*For any* admin page initial load with unchanged filters, the number of API calls to a specific endpoint SHALL equal exactly 1.

**Validates: Requirements 6.3**

## Error Handling

### Frontend Error Handling

#### Admin Panel Error States

```typescript
// Паттерн для обработки ошибок в админке
const [error, setError] = useState<string | null>(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  try {
    const res = await fetch('/api/admin/venues');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    setVenues(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to fetch data');
    console.error('Fetch error:', err);
  } finally {
    setLoading(false);
  }
};
```

### Backend Error Handling

Текущая реализация в `handleApiError` достаточна. Ошибки логируются и возвращаются с корректными HTTP статусами.

## Testing Strategy

### Dual Testing Approach

Используем комбинацию unit tests и property-based tests:

1. **Unit Tests** (Vitest + React Testing Library)
   - Тестирование рендеринга компонентов
   - Тестирование обработки ошибок
   - Тестирование loading states

2. **Property-Based Tests** (fast-check)
   - Проверка полноты переводов
   - Проверка корректности API контрактов

### Test Configuration

- **Framework**: Vitest (уже настроен)
- **PBT Library**: fast-check (уже установлен)
- **Minimum iterations**: 100 per property test

### Test Files Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── admin.test.tsx          # Existing
│   │   └── venues/
│   │       └── page.test.tsx       # New - venues page tests
│   └── page.test.tsx               # Existing - landing tests
├── components/
│   └── landing/
│       └── main/
│           └── sections/
│               └── LandingHeroSection.test.tsx  # Existing
└── lib/
    └── i18n/
        └── translations.test.ts    # Existing - extend for property tests
```

### Lint Fixes

Исправление lint warnings (import order) не является критичным, но улучшает качество кода. Можно исправить автоматически:

```bash
# Автоматическое исправление import order
npx eslint --fix src/
```

## Implementation Notes

### Приоритет исправлений

1. **Critical** - useEffect dependencies (вызывают warnings и потенциальные баги)
2. **High** - Error handling в админке (улучшает UX)
3. **Medium** - i18n hardcoded текст в навигации
4. **Low** - Lint warnings (import order)

### Файлы для изменения

| Файл | Изменение | Приоритет |
|------|-----------|-----------|
| `src/app/admin/venues/page.tsx` | Fix useEffect deps | Critical |
| `src/app/admin/transactions/page.tsx` | Fix useEffect deps | Critical |
| `src/components/venue/staff/use-staff-management.ts` | Fix useEffect deps | Critical |
| `src/components/landing/main/sections/LandingNavigation.tsx` | i18n for dropdown text | Medium |

### Не требуют изменений

- `src/app/page.tsx` - работает корректно
- `src/components/landing/main/sections/LandingHeroSection.tsx` - работает корректно
- API routes - работают корректно
- Build configuration - работает корректно

