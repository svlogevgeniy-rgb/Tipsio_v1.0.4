# Requirements Document

## Introduction

Обновление UI страниц оплаты чаевых (tip payment и success pages) для соответствия новому дизайну с добавлением корректного отображения фото персонала и полной локализации на три языка (RU/EN/ID). Изменения касаются только UI и i18n, без модификации бизнес-логики оплаты и интеграции с Midtrans.

## Glossary

- **Tip_Payment_System**: Система оплаты чаевых персоналу заведения
- **Staff_Photo**: Фотография сотрудника, отображаемая на страницах оплаты
- **Payment_Page**: Страница выбора сотрудника и ввода суммы чаевых (tip/:id)
- **Success_Page**: Страница подтверждения успешной оплаты (tip/success)
- **i18n_System**: Система интернационализации для поддержки RU/EN/ID языков
- **Midtrans**: Платежный шлюз, используемый для обработки транзакций
- **shadcn_ui**: Библиотека UI компонентов проекта
- **Staff_Placeholder**: Заглушка-аватар для сотрудников без фото

## Requirements

### Requirement 1: UI Redesign According to Reference Scans

**User Story:** Как пользователь, я хочу видеть современный и понятный интерфейс страниц оплаты чаевых, чтобы процесс был приятным и интуитивным.

#### Acceptance Criteria

1. WHEN a user visits the Payment_Page, THE Tip_Payment_System SHALL display layout matching the reference scan design
2. WHEN a user visits the Success_Page, THE Tip_Payment_System SHALL display layout matching the reference scan design
3. THE Tip_Payment_System SHALL use shadcn_ui components (Card, Button, Badge, Separator, Skeleton, Alert) for consistent styling
4. THE Tip_Payment_System SHALL maintain proper typography hierarchy as shown in reference scans
5. THE Tip_Payment_System SHALL maintain proper spacing and component arrangement as shown in reference scans

### Requirement 2: Staff Photo Display

**User Story:** Как пользователь, я хочу видеть фотографии персонала, чтобы знать, кому я отправляю чаевые.

#### Acceptance Criteria

1. WHEN a staff member has a photo, THE Tip_Payment_System SHALL display the actual Staff_Photo
2. WHEN a staff member does not have a photo, THE Tip_Payment_System SHALL display a Staff_Placeholder avatar
3. THE Tip_Payment_System SHALL use consistent avatar dimensions across all staff displays
4. THE Tip_Payment_System SHALL apply proper object-fit styling to prevent image distortion
5. WHEN Staff_Photo is loading, THE Tip_Payment_System SHALL display a skeleton placeholder to prevent layout shift
6. THE Tip_Payment_System SHALL provide meaningful alt text for each Staff_Photo (staff name or "Staff photo")

### Requirement 3: Internationalization Support

**User Story:** Как пользователь, я хочу видеть интерфейс на моем языке (RU/EN/ID), чтобы легко понимать все элементы страницы.

#### Acceptance Criteria

1. THE i18n_System SHALL provide translations for all static text on Payment_Page and Success_Page
2. THE i18n_System SHALL support three languages: Russian (RU), English (EN), Indonesian (ID)
3. WHEN a user switches language, THE Tip_Payment_System SHALL update all text content without page reload
4. THE i18n_System SHALL translate page titles and headings
5. THE i18n_System SHALL translate amount labels, commission labels, and total labels
6. THE i18n_System SHALL translate button text
7. THE i18n_System SHALL translate success messages (e.g., "Your tip has been sent successfully")
8. THE i18n_System SHALL translate transaction status messages (success/pending/error)
9. THE i18n_System SHALL handle backend-provided text by mapping status keys to translated strings

### Requirement 4: Success Page Query Parameter Handling

**User Story:** Как пользователь, я хочу видеть корректное состояние страницы успеха в зависимости от результата транзакции, чтобы понимать, прошла ли оплата.

#### Acceptance Criteria

1. WHEN Success_Page receives valid query parameters (order_id, status_code, transaction_status), THE Tip_Payment_System SHALL display success state
2. WHEN Success_Page receives invalid or missing query parameters, THE Tip_Payment_System SHALL display error state with user-friendly message
3. WHEN transaction status indicates failure, THE Tip_Payment_System SHALL display appropriate error state
4. THE Tip_Payment_System SHALL maintain existing business logic for parameter validation

### Requirement 5: Responsive Design

**User Story:** Как пользователь на мобильном устройстве или десктопе, я хочу, чтобы интерфейс корректно отображался на моем экране, чтобы удобно пользоваться сервисом.

#### Acceptance Criteria

1. THE Tip_Payment_System SHALL display correctly on mobile viewport (375px width)
2. THE Tip_Payment_System SHALL display correctly on tablet viewport (768px width)
3. THE Tip_Payment_System SHALL display correctly on desktop viewport (1440px width)
4. THE Tip_Payment_System SHALL use mobile-first responsive design approach
5. THE Tip_Payment_System SHALL maintain readability and usability across all viewport sizes

### Requirement 6: Business Logic Preservation

**User Story:** Как разработчик, я хочу, чтобы изменения UI не затронули существующую логику оплаты, чтобы избежать регрессии функциональности.

#### Acceptance Criteria

1. THE Tip_Payment_System SHALL preserve all existing payment processing logic
2. THE Tip_Payment_System SHALL preserve all existing Midtrans integration logic
3. THE Tip_Payment_System SHALL preserve all existing transaction status handling logic
4. WHEN UI changes are applied, THE Tip_Payment_System SHALL produce no console errors
5. WHEN UI changes are applied, THE Tip_Payment_System SHALL maintain all existing API calls and data flows

### Requirement 7: Performance and Accessibility

**User Story:** Как пользователь, я хочу, чтобы страницы загружались быстро и были доступны, чтобы иметь комфортный опыт использования.

#### Acceptance Criteria

1. THE Tip_Payment_System SHALL prevent Cumulative Layout Shift (CLS) by using fixed-size containers for Staff_Photo
2. THE Tip_Payment_System SHALL display loading states (skeletons) for asynchronous content
3. THE Tip_Payment_System SHALL provide semantic HTML structure for accessibility
4. THE Tip_Payment_System SHALL ensure all interactive elements are keyboard accessible
5. THE Tip_Payment_System SHALL provide appropriate ARIA labels where needed
