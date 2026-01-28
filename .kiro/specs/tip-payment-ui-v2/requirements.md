# Requirements Document

## Introduction

Редизайн UI страницы оплаты чаевых с фокусом на минимализм, улучшенную компоновку и упрощенные контролы ввода. Изменения касаются только UI и контролов формы, без модификации бизнес-логики оплаты и интеграции с Midtrans.

## Glossary

- **Tip_Payment_Page**: Страница оплаты чаевых (tip/:shortCode)
- **Payment_Container**: Основной контейнер страницы оплаты
- **Tip_Amount_Input**: Поле ввода суммы чаевых
- **Rating_Component**: Компонент рейтинга из 5 звёзд
- **Brand_Color**: Фирменный цвет #1e5f4b
- **Midtrans**: Платежный шлюз, используемый для обработки транзакций
- **shadcn_ui**: Библиотека UI компонентов проекта (https://ui.shadcn.com/)

## Requirements

### Requirement 1: Container Width Management

**User Story:** Как пользователь, я хочу видеть оптимальную ширину контейнера на разных устройствах, чтобы контент был читаемым и не растягивался слишком широко.

#### Acceptance Criteria

1. WHEN a user views the page on a screen >= 768px, THE Payment_Container SHALL have a minimum width of 672px
2. WHEN a user views the page on a screen < 768px, THE Payment_Container SHALL use full width without horizontal scroll
3. WHEN a user views the page on a screen >= 768px, THE Payment_Container SHALL be centered horizontally
4. THE Payment_Container SHALL not cause horizontal scrolling on any viewport size
5. THE Payment_Container SHALL maintain proper padding on mobile devices

### Requirement 2: Brand Color Application

**User Story:** Как владелец бизнеса, я хочу видеть фирменный цвет #1e5f4b в ключевых элементах интерфейса, чтобы поддерживать единый брендинг.

#### Acceptance Criteria

1. THE Tip_Payment_Page SHALL display the Tipsio logo in color #1e5f4b
2. WHEN a primary button is displayed, THE Tip_Payment_Page SHALL use background color #1e5f4b
3. WHEN a primary button is displayed, THE Tip_Payment_Page SHALL use contrasting text color (white)
4. WHEN a user hovers over a primary button, THE Tip_Payment_Page SHALL apply subtle darkening or lightening effect
5. THE Tip_Payment_Page SHALL maintain consistent brand color across all branded elements

### Requirement 3: Numeric Tip Amount Input

**User Story:** Как пользователь, я хочу вводить сумму чаевых напрямую цифрами, чтобы быстро указать нужную сумму.

#### Acceptance Criteria

1. THE Tip_Amount_Input SHALL accept numeric input from the user
2. THE Tip_Amount_Input SHALL not display increment/decrement controls (+/- buttons)
3. WHEN a user enters a negative value, THE Tip_Amount_Input SHALL reject the input
4. WHEN a user leaves the field empty, THE Tip_Amount_Input SHALL treat it as 0 or display validation error
5. THE Tip_Amount_Input SHALL preserve existing currency formatting (Rp) if currently implemented
6. THE Tip_Amount_Input SHALL use inputMode="numeric" for mobile keyboard optimization

### Requirement 4: Centered Logo Placement

**User Story:** Как пользователь, я хочу видеть логотип Tipsio по центру вверху страницы, чтобы интерфейс выглядел сбалансированным.

#### Acceptance Criteria

1. THE Tip_Payment_Page SHALL display the Tipsio logo centered horizontally at the top
2. THE Tip_Payment_Page SHALL maintain logo centering across all viewport sizes
3. THE Tip_Payment_Page SHALL apply proper spacing above and below the logo

### Requirement 5: Star Rating System

**User Story:** Как пользователь, я хочу оценить свой опыт с помощью звёзд от 1 до 5, чтобы быстро выразить своё мнение.

#### Acceptance Criteria

1. THE Rating_Component SHALL display 5 clickable stars
2. WHEN a user clicks on a star, THE Rating_Component SHALL select that rating (1-5)
3. THE Rating_Component SHALL display visual labels for each rating level:
   - 1 star: "Очень плохо"
   - 2 stars: "Плохо"
   - 3 stars: "Удовлетворительно"
   - 4 stars: "Хорошо"
   - 5 stars: "Отлично"
4. THE Rating_Component SHALL support keyboard navigation (Tab/Enter)
5. THE Rating_Component SHALL show selected state (filled stars) for chosen rating
6. THE Rating_Component SHALL show hover preview when user hovers over stars
7. THE Rating_Component SHALL save the rating value (1-5) to the existing form model
8. THE Rating_Component SHALL replace the current "Your Experience" field UI while maintaining data compatibility

### Requirement 6: UI Element Removal

**User Story:** Как пользователь, я хочу видеть упрощённый интерфейс без лишних элементов, чтобы сосредоточиться на основной задаче.

#### Acceptance Criteria

1. THE Tip_Payment_Page SHALL not display a back arrow or back button
2. THE Tip_Payment_Page SHALL not display a message input field or textarea
3. WHEN the back arrow is removed, THE Tip_Payment_Page SHALL maintain proper header layout
4. WHEN the message field is removed, THE Tip_Payment_Page SHALL adjust form layout accordingly

### Requirement 7: Minimalist Design

**User Story:** Как пользователь, я хочу видеть чистый и минималистичный интерфейс, чтобы легко ориентироваться на странице.

#### Acceptance Criteria

1. THE Tip_Payment_Page SHALL use shadcn_ui components (Card, Input, Button, Label, Separator)
2. THE Tip_Payment_Page SHALL maintain consistent spacing and typography
3. THE Tip_Payment_Page SHALL avoid decorative elements that don't serve functional purpose
4. THE Tip_Payment_Page SHALL prioritize readability and simplicity
5. THE Tip_Payment_Page SHALL use proper visual hierarchy for content organization

### Requirement 8: Business Logic Preservation

**User Story:** Как разработчик, я хочу, чтобы изменения UI не затронули логику оплаты, чтобы избежать регрессии функциональности.

#### Acceptance Criteria

1. THE Tip_Payment_Page SHALL preserve all existing payment processing logic
2. THE Tip_Payment_Page SHALL preserve all existing Midtrans integration logic
3. THE Tip_Payment_Page SHALL preserve all existing transaction status handling logic
4. WHEN UI changes are applied, THE Tip_Payment_Page SHALL produce no console errors
5. WHEN UI changes are applied, THE Tip_Payment_Page SHALL maintain all existing API calls and data flows
6. THE Tip_Payment_Page SHALL maintain backward compatibility with existing form data structure

### Requirement 9: Responsive Behavior

**User Story:** Как пользователь на мобильном устройстве или десктопе, я хочу, чтобы интерфейс корректно отображался на моем экране, чтобы удобно пользоваться сервисом.

#### Acceptance Criteria

1. THE Tip_Payment_Page SHALL display correctly on mobile viewport (< 768px width)
2. THE Tip_Payment_Page SHALL display correctly on tablet viewport (>= 768px width)
3. THE Tip_Payment_Page SHALL display correctly on desktop viewport (>= 1024px width)
4. THE Tip_Payment_Page SHALL use mobile-first responsive design approach
5. THE Tip_Payment_Page SHALL maintain touch-friendly tap targets on mobile (minimum 44x44px)
