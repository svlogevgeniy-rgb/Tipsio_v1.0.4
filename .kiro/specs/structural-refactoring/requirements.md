# Requirements Document

## Introduction

Структурный рефакторинг production-системы Tipsio с целью снижения технического долга и стоимости разработки. Ключевое ограничение: нулевые поведенческие изменения (UI/UX, бизнес-логика, API контракты, i18n, SEO, аналитика, сборка/деплой остаются идентичными).

## Glossary

- **Tipsio_System**: Next.js приложение для управления чаевыми (tipping platform)
- **Behavioral_Change**: Любое изменение, влияющее на observable-поведение системы (DOM, CSS, API response, i18n ключи, события аналитики)
- **Structural_Refactoring**: Изменение внутренней организации кода без изменения внешнего поведения
- **Dead_Code**: Код, который не используется и не влияет на работу системы
- **Magic_String**: Строковые литералы, используемые в нескольких местах без централизованного определения
- **Component_Decomposition**: Разделение крупного компонента на меньшие подкомпоненты с сохранением JSX-структуры

## Requirements

### Requirement 1

**User Story:** As a developer, I want dead code and unused imports removed, so that the codebase is cleaner and easier to navigate.

#### Acceptance Criteria

1. WHEN the Tipsio_System is analyzed for unused imports THEN the Tipsio_System SHALL identify and remove all unused import statements from TypeScript/TSX files
2. WHEN the Tipsio_System is analyzed for dead code THEN the Tipsio_System SHALL identify and remove unreferenced functions, variables, and types that have no runtime effect
3. WHEN dead code is removed THEN the Tipsio_System SHALL preserve all existing tests and ensure they continue to pass
4. WHEN cleanup is performed THEN the Tipsio_System SHALL not modify any files that affect observable behavior (DOM structure, CSS classes, API responses)

### Requirement 2

**User Story:** As a developer, I want magic strings and constants centralized, so that I can maintain consistency and reduce duplication.

#### Acceptance Criteria

1. WHEN magic strings are identified in multiple files THEN the Tipsio_System SHALL extract them to a centralized constants file in `src/lib/constants.ts`
2. WHEN constants are centralized THEN the Tipsio_System SHALL update all usages to reference the centralized definition
3. WHEN constants are extracted THEN the Tipsio_System SHALL preserve the exact string values without modification
4. WHEN API error codes are found duplicated THEN the Tipsio_System SHALL use existing `src/types/api.ts` ErrorCode enum

### Requirement 3

**User Story:** As a developer, I want large components decomposed into smaller units, so that the code is more maintainable and testable.

#### Acceptance Criteria

1. WHEN a component exceeds 300 lines THEN the Tipsio_System SHALL identify candidates for extraction into subcomponents
2. WHEN subcomponents are extracted THEN the Tipsio_System SHALL preserve the exact JSX structure and CSS classes
3. WHEN subcomponents are created THEN the Tipsio_System SHALL place them in a `components/` subfolder adjacent to the parent component
4. WHEN decomposition is performed THEN the Tipsio_System SHALL not change Server/Client Component boundaries without explicit justification
5. WHEN decomposition is performed THEN the Tipsio_System SHALL preserve all props, state, and event handlers with identical behavior

### Requirement 4

**User Story:** As a developer, I want business logic separated from UI components, so that logic can be tested independently and reused.

#### Acceptance Criteria

1. WHEN complex calculations or conditions exist in UI components THEN the Tipsio_System SHALL extract them to dedicated logic files or custom hooks
2. WHEN logic is extracted THEN the Tipsio_System SHALL preserve the exact computation results and side effects
3. WHEN custom hooks are created THEN the Tipsio_System SHALL place them in `src/hooks/` with appropriate naming (`use-*.ts`)
4. WHEN utility functions are extracted THEN the Tipsio_System SHALL place them in `src/lib/` with appropriate module organization

### Requirement 5

**User Story:** As a developer, I want API routes to follow the established middleware pattern, so that authentication and error handling are consistent.

#### Acceptance Criteria

1. WHEN an API route contains inline auth checks THEN the Tipsio_System SHALL refactor to use `requireAuth()` from `@/lib/api/middleware`
2. WHEN an API route contains inline venue access checks THEN the Tipsio_System SHALL refactor to use `requireVenueAccess()` from `@/lib/api/middleware`
3. WHEN an API route contains inline error handling THEN the Tipsio_System SHALL refactor to use `handleApiError()` from `@/lib/api/error-handler`
4. WHEN API routes are refactored THEN the Tipsio_System SHALL preserve identical HTTP status codes, response shapes, and error messages
5. WHEN API routes are refactored THEN the Tipsio_System SHALL not modify URL paths, HTTP methods, or query parameter handling

### Requirement 6

**User Story:** As a developer, I want TypeScript types strengthened, so that type safety catches more errors at compile time.

#### Acceptance Criteria

1. WHEN `any` types are found THEN the Tipsio_System SHALL replace them with specific types where the type can be inferred or defined
2. WHEN function parameters lack types THEN the Tipsio_System SHALL add explicit type annotations
3. WHEN return types are implicit THEN the Tipsio_System SHALL add explicit return type annotations for exported functions
4. WHEN types are strengthened THEN the Tipsio_System SHALL not change runtime behavior or add runtime type checks

### Requirement 7

**User Story:** As a developer, I want import statements standardized, so that the codebase follows consistent patterns.

#### Acceptance Criteria

1. WHEN import statements are reordered THEN the Tipsio_System SHALL follow the pattern: external deps → internal absolute → relative
2. WHEN path aliases exist THEN the Tipsio_System SHALL use `@/*` aliases consistently for `src/*` imports
3. WHEN imports are modified THEN the Tipsio_System SHALL not change the resolved modules or their exports
4. WHEN barrel exports are created THEN the Tipsio_System SHALL not change the public API of any module

### Requirement 8

**User Story:** As a developer, I want the refactoring documented, so that the team understands the new structure and patterns.

#### Acceptance Criteria

1. WHEN refactoring is complete THEN the Tipsio_System SHALL create or update `docs/refactoring/STRUCTURAL_REFACTORING.md`
2. WHEN documentation is created THEN the Tipsio_System SHALL include the new directory structure
3. WHEN documentation is created THEN the Tipsio_System SHALL include code placement rules
4. WHEN documentation is created THEN the Tipsio_System SHALL include Server/Client Component guidelines

### Requirement 9

**User Story:** As a developer, I want all changes verified, so that no behavioral regressions are introduced.

#### Acceptance Criteria

1. WHEN any change is made THEN the Tipsio_System SHALL pass `npm run lint` without new errors
2. WHEN any change is made THEN the Tipsio_System SHALL pass `npm run build` successfully
3. WHEN any change is made THEN the Tipsio_System SHALL pass `npm run test` with all existing tests passing
4. WHEN formatting changes are made THEN the Tipsio_System SHALL limit them to files already being modified for structural reasons
