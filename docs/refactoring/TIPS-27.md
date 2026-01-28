# TIPS-27 — Refactoring Plan (Behavior Preserved)

> Никаких изменений в UI/UX, роутинге, API, аналитике, i18n, SEO, сборке деплое.

## 0. Inventory (текущая структура)

| Слой            | Путь/описание                                                                 |
|----------------|--------------------------------------------------------------------------------|
| Next.js App    | `src/app` (App Router, API routes под `src/app/api`)                           |
| UI компоненты  | `src/components` (`ui` — shadcn primitives, `landing`, `venue`, `legacy`, …)   |
| Hooks          | `src/hooks` (React hooks, client-only)                                         |
| Shared libs    | `src/lib` (api middleware, auth, constants, i18n utils, analytics helpers)     |
| Types          | `src/types` (API/Domain typings)                                               |
| Prisma         | `prisma/schema.prisma`, seed scripts                                            |
| Scripts/Tools  | `scripts/*`, `docker-compose.*`, `docs/*`                                      |

```
src/
├─ app/                 # Next app router + API routes
├─ components/
│  ├─ ui/               # Button, DropdownMenu etc (shadcn)
│  ├─ landing/          # landing-specific blocks
│  └─ venue/            # dashboard/admin widgets
├─ hooks/               # client hooks
├─ lib/
│  ├─ api/              # middleware + error handling
│  ├─ analytics/        # (пока разрозненные вызовы)
│  ├─ constants.ts
│  └─ i18n/             # formatters, locale utils
├─ test/                # integration tests
└─ types/               # DTO & shared types
```

### Apps / Packages модель

| Логический app | Фактическое расположение              | Пометки                                  |
|----------------|---------------------------------------|------------------------------------------|
| `apps/web`     | текущий Next.js под `src/app`         | включает landing, dashboards, API routes |
| `apps/api`     | включён в Next API routes             | вынос в отдельный Nest/Express слой позже|
| `packages/*`   | **пока нет**                          | планируем вынос shared модулей           |

## 1. Правила размещения кода (guardrails)

1. **Web (Next.js)**
   - Компоненты → `src/components/<area>/<Component>.tsx`
   - Логика/хелперы → `src/lib/<area>/` или `src/features/<area>/logic`
   - React hooks → `src/hooks/<useFoo>.ts`
   - Не трогаем `use client` пометки без необходимости.
   - DOM/className порядок неизменен; любые правки — только рефакторинг структуры.

2. **Shared packages (план)**
   - `packages/ui` — обёртки над shadcn, общие стили.
   - `packages/shared` — утилиты, константы, schema validators.
   - `packages/config` — env/schema (если появится).
   - При выносе: оставить экспорт через `src/*` для обратной совместимости (`path aliases`).

3. **Analytics**
   - Все вызовы отправки событий проходят через `src/lib/analytics/<channel>.ts`.
   - Файлы:
     - `analytics/client.ts` — общий `trackEvent(eventName, payload)`.
     - `analytics/events.ts` — enum событий (без смены имён).
     - `analytics/index.ts` — ре-экспорт для удобных импортов.
   - Никаких изменений payload/event-name/условий — только перемещение вызовов и унификация API.

4. **Features decomposition**
   - “Комбайны” бьем на `Component + hook + lib`:
     - `Component.tsx` — JSX.
     - `useComponent.ts` — state/effects.
     - `component.lib.ts` — вычисления, форматирование.
   - Классы/DOM/props не меняем, только внутреннюю организацию файлов.

5. **Type/alias rules**
   - TS paths: используем `@/components`, `@/lib`, `@/hooks`, `@/types`. При добавлении `packages/*` — реэкспортируем через `src` до глобального обновления.
   - Enum-like значения → `src/lib/constants.ts`, экспорт типов через `as const`.

## 2. Stage plan

### Stage 1 — Web → Shared → Analytics

1. **Docs**
   - Обновлять `docs/refactoring/TIPS-27.md` после каждого блока.
   - Фиксировать что/где переместили, какие alias добавили.

2. **Shared extraction**
   - Найти повторяющиеся helpers (форматирование сумм, даты, конфиги).
   - Вынести в `src/lib/shared/*` или `packages/shared` (позже) без изменения API.

3. **Analytics wrapper**
   - Создать `src/lib/analytics` со слоями `client`, `events`, `trackers`.
   - Все прямые вызовы `window.analytics.track` (и аналоги) заменить на импорт из wrapper (с сохранением сигнатур).

4. **Web combiner decomposition**
   - Выбрать 1–2 больших компонента (например, `LandingNavigation`, `LandingHeroSection`).
   - Вынести вычисления/стейт в hooks/lib, оставить JSX чистым.
   - Не менять порядок children, тексты и классы.

5. **Shared UI rules**
   - Стили для кнопок/дропдаунов — централизовать в `src/components/ui/*`; избегать inline tailwind повторов.

### Stage 2 — API (после merge Stage 1)

1. **Service decomposition**
   - Разнести крупные обработчики (venues, staff) на `handler + service + repository`.
   - DTO и ответы должны совпадать бит-в-бит.

2. **Error handling**
   - Использовать `@/lib/api/error-handler` во всех маршрутах.
   - Согласованный логгер/метрики — без смены текста ответа.

3. **Swagger/OpenAPI (если появится)**
   - Поддерживать эквивалентность схем.

## 3. Checklist для каждого PR

- [ ] Нет UI/UX диффов (DOM, классы, тексты, порядок блоков).
- [ ] Не меняем API контракт, env, конфигурацию.
- [ ] i18n ключи/namespace не трогаем.
- [ ] Аналитика: те же события, payload, условия.
- [ ] Обновлён `docs/refactoring/TIPS-27.md` (что сделали, где лежит код).
- [ ] `npm run lint && npm run test && npm run build` ✅
- [ ] При работе с API — smoke локально (`npm run dev` или docker) для проверки.

## 4. Initial candidates / дубли

| Зона              | Что нужно сделать                                                     |
|-------------------|------------------------------------------------------------------------|
| Landing Navigation | Разнести меню/cta логику в `useLandingNavigation`, оставить JSX чистым |
| Hero Section       | Вынести формы/CTA state в `useLandingHero`, форматтеры в lib           |
| Analytics calls    | Найдены в `src/components/landing/*` и `src/lib/notifications.ts` — перетащить в wrapper |
| Currency helpers   | Повторы форматирования в `src/lib/tip-page.ts`, `src/lib/dashboard.ts` — кандидаты в shared util |


## 4. Glossary / дальнейшие шаги

- **Combiner** — компонент > ~200 строк, совмещающий JSX и бизнес-логику.
- **Wrapper** — слой абстракции (analytics/api) скрывающий конкретную имплементацию.
- **Shared package** — модуль, доступный и web, и api.

> Stage 1 начинается с документа (этот файл), затем: shared helpers, analytics wrapper, декомпозиция компонентов. После стабилизации — Stage 2 (API).
