# Requirements Document

## Introduction

Устранение множественных дублирующихся запросов к `/api/venues/dashboard` при загрузке venue dashboard. Сейчас при открытии dashboard делается 5+ параллельных запросов к одному эндпоинту, что замедляет загрузку и создаёт race conditions.

## Glossary

- **Venue_Dashboard**: Панель управления заведением (`src/app/venue/(dashboard)`)
- **Dashboard_Endpoint**: API эндпоинт `/api/venues/dashboard`
- **Period**: Параметр временного периода для метрик (today/week/month)
- **VenueDashboardProvider**: React Context Provider для shared state dashboard данных
- **Server_Component**: Next.js серверный компонент (по умолчанию в App Router)
- **Client_Component**: React компонент с директивой "use client"
- **Initial_Data**: Данные, полученные на сервере и переданные в client provider
- **Dedupe**: Дедупликация - устранение дублирующихся запросов

## Requirements

### Requirement 1: Единый запрос при загрузке

**User Story:** As a venue owner, I want the dashboard to load quickly with a single API request, so that I can see my data without delays.

#### Acceptance Criteria

1. WHEN a user navigates to `/venue/(dashboard)`, THE System SHALL make exactly one request to `/api/venues/dashboard`
2. THE System SHALL NOT make duplicate parallel requests to the same endpoint
3. WHEN the dashboard loads, THE System SHALL fetch data on the server before rendering
4. THE System SHALL pass fetched data to client components via provider

### Requirement 2: Контракт period параметра

**User Story:** As a developer, I want a consistent API contract for the period parameter, so that all requests are predictable.

#### Acceptance Criteria

1. THE Dashboard_Endpoint SHALL accept `period` as an optional query parameter
2. WHEN `period` is not provided, THE Dashboard_Endpoint SHALL default to "week"
3. THE System SHALL define DEFAULT_DASHBOARD_PERIOD constant with value "week"
4. THE System SHALL use the default period for all initial data fetches

### Requirement 3: Shared state через Provider

**User Story:** As a developer, I want all dashboard pages to share the same data source, so that there are no inconsistencies.

#### Acceptance Criteria

1. THE System SHALL provide VenueDashboardProvider component
2. THE VenueDashboardProvider SHALL accept initialData from server
3. THE VenueDashboardProvider SHALL store current period, data, loading state, and error state
4. THE VenueDashboardProvider SHALL expose useVenueDashboard hook for data access
5. WHEN multiple components call useVenueDashboard, THE System SHALL return the same data instance

### Requirement 4: Рефакторинг существующих компонентов

**User Story:** As a developer, I want existing components to use the shared data source, so that duplicate requests are eliminated.

#### Acceptance Criteria

1. THE Layout SHALL fetch dashboard data on the server
2. THE Layout SHALL wrap children in VenueDashboardProvider with initialData
3. THE useDashboardData hook SHALL read from VenueDashboardProvider instead of making direct fetch
4. THE QR_Codes_Page SHALL read venue data from VenueDashboardProvider
5. THE Settings_Page SHALL read venue data from VenueDashboardProvider
6. THE useStaffManagement hook SHALL read venue ID from VenueDashboardProvider

### Requirement 5: Кеширование и обновление данных

**User Story:** As a venue owner, I want to refresh dashboard data when needed, so that I can see updated metrics.

#### Acceptance Criteria

1. THE VenueDashboardProvider SHALL provide a refresh method
2. WHEN refresh is called, THE System SHALL fetch fresh data from the API
3. WHEN period changes, THE System SHALL fetch data for the new period
4. THE System SHALL prevent duplicate in-flight requests to the same period
5. WHEN a request is in progress, THE System SHALL set loading state to true

### Requirement 6: Обработка ошибок

**User Story:** As a venue owner, I want to see clear error messages if data fails to load, so that I know what went wrong.

#### Acceptance Criteria

1. WHEN server fetch fails in layout, THE System SHALL pass error state to provider
2. WHEN client fetch fails, THE System SHALL update error state in provider
3. THE useVenueDashboard hook SHALL expose error state to consumers
4. WHEN an error occurs, THE System SHALL preserve previous data if available

### Requirement 7: Обратная совместимость

**User Story:** As a developer, I want the refactoring to not break existing functionality, so that users experience no regressions.

#### Acceptance Criteria

1. THE System SHALL maintain all existing UI/UX behavior
2. THE System SHALL maintain all existing data contracts
3. THE System SHALL maintain all existing business logic
4. THE System SHALL NOT change any visual design or layout
5. WHEN the refactoring is complete, THE System SHALL pass all existing tests

### Requirement 8: Производительность

**User Story:** As a venue owner, I want the dashboard to load faster, so that I can access my data quickly.

#### Acceptance Criteria

1. WHEN dashboard loads, THE System SHALL make at most 1 request to `/api/venues/dashboard`
2. THE System SHALL reduce total network requests by at least 80% (from 5+ to 1)
3. THE System SHALL show meaningful content within 2 seconds on standard connection
4. THE System SHALL use server-side data fetching for initial render
