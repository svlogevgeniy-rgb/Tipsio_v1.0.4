# Design Document: Structural Refactoring

## Overview

Структурный рефакторинг Tipsio — Next.js приложения для управления чаевыми. Цель: снижение технического долга без изменения observable-поведения системы.

**Ключевые ограничения:**
- 0 изменений DOM/CSS структуры
- 0 изменений API контрактов (URL, методы, response shape)
- 0 изменений i18n ключей
- 0 изменений событий аналитики

**Текущий стек:**
- Next.js 14 (App Router) + TypeScript
- Prisma ORM + PostgreSQL
- Tailwind CSS
- next-intl для i18n
- Vitest для тестирования

## Architecture

### Текущая структура

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (42 файла)
│   ├── admin/             # Admin pages
│   ├── staff/             # Staff pages
│   ├── tip/               # Tip flow pages
│   └── venue/             # Venue dashboard
├── components/
│   ├── animate-ui/        # Animation primitives
│   ├── landing/           # Landing page sections
│   ├── layout/            # Layout components
│   ├── providers/         # React providers
│   ├── ui/                # UI primitives (shadcn)
│   └── venue/             # Venue-specific components
├── hooks/                 # Custom React hooks
├── i18n/                  # i18n configuration
├── lib/                   # Business logic & utilities
│   ├── api/               # API middleware (уже рефакторено)
│   └── i18n/              # i18n utilities
├── test/                  # Test setup
└── types/                 # TypeScript types
```

### Целевая структура (без изменения путей)

Структура каталогов остаётся идентичной. Изменения только внутри файлов:
- Удаление мёртвого кода
- Централизация констант
- Декомпозиция крупных компонентов
- Унификация паттернов API

## Components and Interfaces

### API Middleware (существующий)

```typescript
// src/lib/api/middleware.ts
export async function requireAuth(): Promise<{ session: ApiContext } | { error: NextResponse }>;
export async function requireVenueAccess(venueId: string, session: ApiContext): Promise<{ venue: Venue } | { error: NextResponse }>;
export function requireRole(session: ApiContext, roles: Role[]): { authorized: true } | { error: NextResponse };
export function getVenueIdFromQuery(url: string): { venueId: string } | { error: NextResponse };

// src/lib/api/error-handler.ts
export function handleApiError(error: unknown, context?: string): NextResponse;
export function validationError(message: string): NextResponse;
export function notFoundError(resource: string): NextResponse;
export function successResponse<T>(data: T, status?: number): NextResponse;
```

### Constants (новый файл)

```typescript
// src/lib/constants.ts
export const STAFF_ROLES = ['WAITER', 'BARTENDER', 'BARISTA', 'HOSTESS', 'CHEF', 'ADMINISTRATOR', 'OTHER'] as const;
export type StaffRole = typeof STAFF_ROLES[number];

export const TIP_STATUS = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] as const;
export type TipStatus = typeof TIP_STATUS[number];

export const QR_CODE_TYPES = ['PERSONAL', 'VENUE', 'TABLE'] as const;
export type QrCodeType = typeof QR_CODE_TYPES[number];

// API paths (для клиентского кода)
export const API_PATHS = {
  STAFF: '/api/staff',
  VENUES: '/api/venues',
  QR: '/api/qr',
  TIPS: '/api/tips',
} as const;
```

### Component Decomposition Pattern

Для компонентов >300 строк:

```
src/app/venue/(dashboard)/dashboard/
├── page.tsx                    # Main page (существует)
├── use-dashboard-data.ts       # Data hook (существует)
└── components/
    └── dashboard-panels.tsx    # Subcomponents (существует)
```

Этот паттерн уже применён в dashboard. Применить к другим крупным компонентам.

## Data Models

Модели данных не изменяются. Prisma schema остаётся идентичной.

Усиление типизации через:
- Замена `any` на конкретные типы
- Добавление явных return types
- Использование `satisfies` для type narrowing

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Build Verification Invariant
*For any* refactoring change, the build pipeline (lint, typecheck, build, test) must pass without new errors or warnings.
**Validates: Requirements 9.1, 9.2, 9.3**

### Property 2: Test Suite Preservation
*For any* code removal or modification, all existing tests must continue to pass with identical assertions.
**Validates: Requirements 1.3**

### Property 3: Constants Centralization
*For any* magic string that appears in multiple files, after extraction to constants file, grep for the literal string should return only the constants definition file.
**Validates: Requirements 2.1, 2.2**

### Property 4: API Middleware Consistency
*For any* API route that performs authentication, venue access, or error handling, it must use the centralized middleware functions from `@/lib/api/middleware` and `@/lib/api/error-handler`.
**Validates: Requirements 5.1, 5.2, 5.3**

### Property 5: API Contract Preservation
*For any* API route refactoring, the HTTP status codes, response JSON structure, and error messages must remain identical to the original implementation.
**Validates: Requirements 5.4**

### Property 6: Component Boundary Preservation
*For any* component decomposition, the `'use client'` directive presence must remain unchanged in the parent component.
**Validates: Requirements 3.4**

### Property 7: Import Order Consistency
*For any* TypeScript file, imports must follow the order: external packages → internal absolute (`@/*`) → relative paths.
**Validates: Requirements 7.1, 7.2**

### Property 8: Type Safety Enhancement
*For any* exported function, explicit return type annotation must be present. No `any` types should exist except where explicitly justified.
**Validates: Requirements 6.1, 6.2, 6.3**

## Error Handling

Ошибки обрабатываются через существующий `handleApiError()`:

```typescript
try {
  // business logic
} catch (error) {
  return handleApiError(error, 'Context description');
}
```

Коды ошибок определены в `src/types/api.ts`:
- `AUTH_REQUIRED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `VALIDATION_ERROR` (400)
- `CONFLICT` (409)
- `INTERNAL_ERROR` (500)

## Testing Strategy

### Dual Testing Approach

**Unit Tests (Vitest):**
- Тестирование извлечённых utility функций
- Тестирование констант и типов
- Тестирование API middleware

**Property-Based Tests (fast-check):**
- Верификация build pipeline после каждого сегмента
- Проверка API contract preservation
- Валидация import order consistency

### Test Execution

```bash
# После каждого сегмента рефакторинга
npm run lint          # ESLint проверка
npm run build         # Next.js build
npm run test          # Vitest тесты
```

### Property Test Format

```typescript
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';

describe('Structural Refactoring Properties', () => {
  /**
   * **Feature: structural-refactoring, Property 1: Build Verification Invariant**
   * **Validates: Requirements 9.1, 9.2, 9.3**
   */
  it('should pass lint without errors', async () => {
    // Verified by CI pipeline
  });
});
```

### Verification Commands

| Command | Purpose | Expected Result |
|---------|---------|-----------------|
| `npm run lint` | ESLint check | 0 errors, 0 new warnings |
| `npm run build` | Next.js production build | Success |
| `npm run test` | Vitest test suite | All tests pass |
| `npx tsc --noEmit` | TypeScript check | 0 errors |
