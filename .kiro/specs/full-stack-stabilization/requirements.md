# Requirements Document

## Introduction

Комплексная стабилизация проекта TIPSIO: исправление ошибок на лендинге (hero/тексты/вёрстка), оптимизация админки (скорость/стабильность), и устранение backend-проблем. Задача TIPS-31.

## Glossary

- **Landing_Page**: Главная страница приложения (`src/app/page.tsx`) с hero-секцией и маркетинговым контентом
- **Hero_Section**: Верхняя секция лендинга с заголовком, подзаголовком и CTA-кнопками
- **Admin_Panel**: Административная панель для управления заведениями и транзакциями (`src/app/admin/`)
- **Aurora_Background**: Компонент фонового эффекта, используемый в админке
- **i18n_System**: Система интернационализации на базе next-intl
- **Midtrans**: Платёжный провайдер, интегрированный в систему
- **Venue**: Заведение (ресторан/кафе), использующее платформу
- **Staff**: Персонал заведения, получающий чаевые

## Requirements

### Requirement 1: Build и TypeScript стабильность

**User Story:** As a developer, I want the project to build without errors, so that I can deploy and develop with confidence.

#### Acceptance Criteria

1. THE Build_System SHALL complete `npm run build` without errors
2. THE TypeScript_Compiler SHALL pass type checking without errors (`npx tsc --noEmit`)
3. WHEN lint is executed, THE Linter SHALL report only warnings, not blocking errors
4. THE Build_System SHALL generate production-ready output

### Requirement 2: Landing Hero Section корректность

**User Story:** As a visitor, I want to see the hero section correctly displayed, so that I understand the product value proposition.

#### Acceptance Criteria

1. WHEN the landing page loads, THE Hero_Section SHALL display the headline with correct styling (font-heading, font-extrabold)
2. WHEN the landing page loads, THE Hero_Section SHALL display the subheadline with readable contrast (text-muted-foreground)
3. THE Hero_Section SHALL display CTA buttons that are clickable and properly styled
4. WHEN a user clicks "Leave tip or review" button, THE System SHALL open a dialog for entering staff code
5. THE Hero_Section SHALL be responsive on viewports 375px, 768px, and 1440px

### Requirement 3: Landing текстовая типографика

**User Story:** As a visitor, I want to read all text clearly, so that I can understand the product offering.

#### Acceptance Criteria

1. THE Landing_Page SHALL display all text with sufficient contrast ratio (WCAG AA minimum)
2. THE Landing_Page SHALL NOT have text with `opacity-0`, `text-transparent`, or `hidden` classes that hide content unintentionally
3. THE Landing_Page SHALL use consistent font families (font-heading for titles, default for body)
4. WHEN i18n translations are loaded, THE Landing_Page SHALL display localized text without missing keys

### Requirement 4: Landing адаптивная вёрстка

**User Story:** As a mobile user, I want the landing page to display correctly on my device, so that I can navigate and read content.

#### Acceptance Criteria

1. THE Landing_Page SHALL display correctly on 375px viewport (mobile)
2. THE Landing_Page SHALL display correctly on 768px viewport (tablet)
3. THE Landing_Page SHALL display correctly on 1440px viewport (desktop)
4. THE Navigation SHALL show mobile menu on viewports below 768px
5. THE Navigation SHALL show desktop menu on viewports 768px and above

### Requirement 5: Admin Panel стабильность загрузки

**User Story:** As an admin, I want the admin panel to load reliably, so that I can manage venues and transactions.

#### Acceptance Criteria

1. WHEN an admin navigates to `/admin`, THE Admin_Panel SHALL render without white screen errors
2. WHEN an admin navigates to `/admin/venues`, THE System SHALL display a loading state while fetching data
3. WHEN an admin navigates to `/admin/transactions`, THE System SHALL display a loading state while fetching data
4. IF an API request fails, THEN THE Admin_Panel SHALL display an error message instead of crashing
5. THE Admin_Panel SHALL NOT have React hydration warnings in console

### Requirement 6: Admin Panel производительность

**User Story:** As an admin, I want the admin panel to load quickly, so that I can work efficiently.

#### Acceptance Criteria

1. THE Admin_Panel SHALL render initial content within 3 seconds on standard connection
2. WHEN data is being fetched, THE Admin_Panel SHALL show skeleton/loading states
3. THE Admin_Panel SHALL NOT make duplicate API requests on initial load
4. WHEN filters change, THE Admin_Panel SHALL debounce API requests to prevent excessive calls

### Requirement 7: Admin API стабильность

**User Story:** As an admin, I want API requests to work reliably, so that I can view and manage data.

#### Acceptance Criteria

1. WHEN `/api/admin/venues` is called, THE API SHALL return venue data or appropriate error
2. WHEN `/api/admin/transactions` is called, THE API SHALL return transaction data or appropriate error
3. IF database connection fails, THEN THE API SHALL return 500 status with error message
4. THE API SHALL NOT return 5xx errors for valid requests with proper authentication

### Requirement 8: Console ошибки устранены

**User Story:** As a developer, I want no critical console errors, so that I can identify real issues quickly.

#### Acceptance Criteria

1. THE Landing_Page SHALL NOT produce JavaScript errors in browser console
2. THE Admin_Panel SHALL NOT produce JavaScript errors in browser console
3. THE System SHALL NOT produce React hydration mismatch warnings
4. THE System SHALL NOT produce 404 errors for static assets

### Requirement 9: useEffect dependencies исправлены

**User Story:** As a developer, I want React hooks to follow best practices, so that the app behaves predictably.

#### Acceptance Criteria

1. WHEN useEffect hooks are used, THE Component SHALL include all required dependencies
2. THE Admin_Venues_Page SHALL have correct useEffect dependencies for fetchVenues
3. THE Admin_Transactions_Page SHALL have correct useEffect dependencies for fetchTransactions
4. THE Staff_Management_Hook SHALL have correct useEffect dependencies for fetchStaff

