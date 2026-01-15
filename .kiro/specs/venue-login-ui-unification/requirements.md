# Requirements Document

## Introduction

Унификация UI страницы авторизации заведений с существующей страницей регистрации и исправление i18n-текстов подсказок. Задача фокусируется исключительно на визуальном представлении без изменения логики авторизации (NextAuth flow, редиректы, API-вызовы).

## Glossary

- **Auth_Page**: Страница авторизации (логин) для владельцев заведений
- **Register_Page**: Страница регистрации заведений (/venue/register), используемая как эталон UI
- **UI_Pattern**: Визуальный паттерн включающий структуру, типографику, компоненты и отступы
- **i18n_Dictionary**: Словари интернационализации для RU/EN/ID языков
- **shadcn_Component**: UI-компоненты из библиотеки shadcn/ui (Input, Label, Button, Card)
- **Auth_Logic**: Логика авторизации включающая NextAuth flow, редиректы и API-вызовы
- **Registration_Prompt**: Текстовая подсказка под формой со ссылкой на создание аккаунта

## Requirements

### Requirement 1: Visual UI Unification

**User Story:** As a venue owner, I want the login page to have the same visual style as the registration page, so that I experience consistent UI across authentication flows.

#### Acceptance Criteria

1. WHEN viewing the Auth_Page THEN THE System SHALL display the same container structure and alignment as Register_Page
2. WHEN viewing the Auth_Page THEN THE System SHALL apply identical typography (headings and subheadings) as Register_Page
3. WHEN viewing the Auth_Page THEN THE System SHALL use the same shadcn_Components (Input, Label, Button, Card) as Register_Page
4. WHEN viewing the Auth_Page THEN THE System SHALL maintain identical spacing and padding patterns as Register_Page
5. WHEN viewing the Auth_Page on different screen sizes THEN THE System SHALL apply the same responsive behavior as Register_Page

### Requirement 2: Form Component Consistency

**User Story:** As a venue owner, I want form elements to look and behave consistently across login and registration pages, so that I can easily recognize and interact with them.

#### Acceptance Criteria

1. WHEN interacting with form inputs on Auth_Page THEN THE System SHALL display the same visual states (focus, error, disabled) as Register_Page
2. WHEN viewing form labels on Auth_Page THEN THE System SHALL apply the same label styling as Register_Page
3. WHEN viewing buttons on Auth_Page THEN THE System SHALL use the same button variants and sizes as Register_Page
4. WHEN viewing the form card/panel on Auth_Page THEN THE System SHALL apply the same card styling as Register_Page

### Requirement 3: Registration Prompt i18n

**User Story:** As a venue owner, I want to see the registration prompt in my preferred language, so that I can understand how to create an account if I don't have one.

#### Acceptance Criteria

1. WHEN viewing Registration_Prompt in Russian THEN THE System SHALL display "Впервые пользуетесь Tipsio? Создайте аккаунт"
2. WHEN viewing Registration_Prompt in English THEN THE System SHALL display "New to Tipsio? Create account"
3. WHEN viewing Registration_Prompt in Indonesian THEN THE System SHALL display "Baru menggunakan Tipsio? Buat akun"
4. WHEN switching language THEN THE System SHALL update Registration_Prompt text immediately from i18n_Dictionary
5. THE System SHALL retrieve Registration_Prompt text from i18n_Dictionary without hardcoded strings in components

### Requirement 4: Responsive Design Consistency

**User Story:** As a venue owner, I want the login page to work correctly on any device, so that I can authenticate from mobile, tablet, or desktop.

#### Acceptance Criteria

1. WHEN viewing Auth_Page on 375px width THEN THE System SHALL display the same mobile layout as Register_Page
2. WHEN viewing Auth_Page on 768px width THEN THE System SHALL display the same tablet layout as Register_Page
3. WHEN viewing Auth_Page on 1440px width THEN THE System SHALL display the same desktop layout as Register_Page
4. WHEN resizing viewport THEN THE System SHALL apply responsive breakpoints identical to Register_Page

### Requirement 5: Authentication Logic Preservation

**User Story:** As a developer, I want the authentication logic to remain unchanged, so that existing NextAuth flows and security measures continue working correctly.

#### Acceptance Criteria

1. WHEN submitting login form THEN THE System SHALL execute the same Auth_Logic as before UI changes
2. WHEN authentication succeeds THEN THE System SHALL perform the same redirects as before UI changes
3. WHEN authentication fails THEN THE System SHALL display errors using the same logic as before UI changes
4. WHEN validating form fields THEN THE System SHALL apply the same validation rules as before UI changes
5. THE System SHALL maintain all existing API calls without modification

### Requirement 6: Registration Link Functionality

**User Story:** As a venue owner, I want the registration link to navigate me to the correct registration page, so that I can create an account if needed.

#### Acceptance Criteria

1. WHEN clicking the registration link in Registration_Prompt THEN THE System SHALL navigate to the correct registration route
2. WHEN hovering over the registration link THEN THE System SHALL display the same hover state as other links on Register_Page
3. THE System SHALL maintain the registration link functionality across all language variants

### Requirement 7: Component Reusability

**User Story:** As a developer, I want to reuse existing auth layout components where possible, so that I maintain consistency and reduce code duplication.

#### Acceptance Criteria

1. WHERE a shared auth layout component exists THEN THE System SHALL reuse it for Auth_Page
2. WHERE no shared layout exists THEN THE System SHALL extract common markup only if it doesn't change routing or behavior
3. THE System SHALL not create new layouts that modify routing or authentication behavior

### Requirement 8: Quality Assurance

**User Story:** As a QA engineer, I want the UI changes to be free of regressions, so that users experience a stable authentication flow.

#### Acceptance Criteria

1. WHEN loading Auth_Page THEN THE System SHALL not produce console errors
2. WHEN comparing Auth_Page to Register_Page visually THEN THE System SHALL show identical UI patterns on desktop
3. WHEN comparing Auth_Page to Register_Page visually THEN THE System SHALL show identical UI patterns on mobile
4. WHEN testing all language variants THEN THE System SHALL display correct i18n texts without errors
5. THE System SHALL maintain all existing functionality without introducing new bugs
