# Design Document: Tip Payment UI V2 Redesign

## Overview

Этот документ описывает редизайн UI страницы оплаты чаевых с фокусом на минимализм, улучшенную компоновку и упрощенные контролы. Ключевые изменения:

1. **Адаптивная ширина контейнера**: 672px минимум на десктопе, full-width на мобильных
2. **Фирменный цвет**: #1e5f4b для логотипа и кнопок
3. **Числовой ввод суммы**: Замена +/- контролов на прямой ввод
4. **Центрированный логотип**: Логотип Tipsio по центру вверху
5. **Рейтинг звёздами**: 5-звёздочная система оценки
6. **Упрощение UI**: Удаление стрелки "Назад" и поля "Message"

Все изменения сохраняют существующую бизнес-логику оплаты и интеграцию с Midtrans.

## Architecture

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **UI Components**: shadcn/ui (Card, Input, Button, Label, Separator)
- **Styling**: Tailwind CSS
- **Payment**: Midtrans Snap (существующая интеграция)
- **Form Handling**: React Hook Form (если используется)

### Page Structure

```
src/app/tip/
├── [shortCode]/
│   └── page.tsx          # Страница оплаты чаевых
├── success/
│   └── page.tsx          # Страница успеха (без изменений)
├── pending/
│   └── page.tsx          # Страница ожидания (без изменений)
└── error/
    └── page.tsx          # Страница ошибки (без изменений)
```

## Components and Interfaces

### 1. Star Rating Component

Новый компонент для рейтинга из 5 звёзд.

**Component**: `StarRating.tsx`

```typescript
interface StarRatingProps {
  value: number;           // 0-5
  onChange: (value: number) => void;
  labels?: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
  };
  className?: string;
}
```

**Features**:
- Кликабельные звёзды (1-5)
- Hover preview (показывает, какой рейтинг будет выбран)
- Keyboard navigation (Tab для фокуса, Enter/Space для выбора, стрелки для навигации)
- Визуальные метки для каждого уровня
- Filled/unfilled состояния
- Доступность (ARIA labels, role="radiogroup")

**Default Labels**:
```typescript
const DEFAULT_LABELS = {
  1: "Очень плохо",
  2: "Плохо",
  3: "Удовлетворительно",
  4: "Хорошо",
  5: "Отлично"
};
```

### 2. Updated Payment Page Layout

**Route**: `/tip/[shortCode]`

**Layout Structure**:

```
┌─────────────────────────────────────┐
│                                     │
│         [Tipsio Logo]               │  ← Centered, #1e5f4b
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Staff Name                         │
│  Role at Venue                      │
│                          [Avatar]   │
│                                     │
│  Tip Amount                         │
│  ┌─────────────────────────────┐   │
│  │ [numeric input]             │   │  ← No +/- controls
│  └─────────────────────────────┘   │
│                                     │
│  Your Experience                    │
│  ★ ★ ★ ★ ★                         │  ← 5-star rating
│  [Rating label]                     │
│                                     │
│  [No Message field]                 │  ← Removed
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Send Tip                    │   │  ← #1e5f4b background
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Key Changes**:
1. Логотип центрирован вверху
2. Удалена стрелка "Назад"
3. Tip Amount - числовой input без +/-
4. Your Experience - 5 звёзд вместо текущего контрола
5. Удалено поле Message
6. Кнопка Send в цвете #1e5f4b

### 3. Container Width Management

**Responsive Behavior**:

```typescript
// Mobile (< 768px)
<div className="w-full px-4">
  {/* Full width with padding */}
</div>

// Desktop (>= 768px)
<div className="min-w-[672px] w-[672px] mx-auto">
  {/* Fixed 672px width, centered */}
</div>
```

**Implementation**:
```tsx
<div className="w-full md:min-w-[672px] md:w-[672px] md:mx-auto px-4 md:px-0">
  {/* Content */}
</div>
```

## Data Models

### Form Data Interface

```typescript
interface TipFormData {
  amount: number;           // Сумма чаевых
  staffId: string;          // ID сотрудника
  rating: number;           // 1-5 (заменяет старое поле experience)
  // message: string;       // УДАЛЕНО
}
```

### Staff Interface

```typescript
interface Staff {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
}
```

### QR Data Interface

```typescript
interface QrData {
  id: string;
  type: "PERSONAL" | "TABLE" | "VENUE";
  label: string | null;
  venue: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  staff: Staff | null;
  availableStaff: Staff[];
}
```

## Correctness Properties

*Свойство - это характеристика или поведение, которое должно быть истинным для всех корректных выполнений системы - по сути, формальное утверждение о том, что система должна делать. Свойства служат мостом между человекочитаемыми спецификациями и машинопроверяемыми гарантиями корректности.*


### Property 1: Responsive Container Width

*For any* viewport width, the payment container should be full-width on screens < 768px and exactly 672px centered on screens >= 768px, without causing horizontal scroll.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4**

### Property 2: Brand Color Consistency

*For any* primary button on the page, the background color should be #1e5f4b and text color should be white (or contrasting color).

**Validates: Requirements 2.2, 2.3, 2.5**

### Property 3: Numeric Input Validation

*For any* numeric value entered in the tip amount input, negative values should be rejected and the input should accept valid positive numbers.

**Validates: Requirements 3.1, 3.3**

### Property 4: Logo Centering Across Viewports

*For any* viewport width, the Tipsio logo should be horizontally centered at the top of the page.

**Validates: Requirements 4.1, 4.2**

### Property 5: Star Rating Interaction

*For any* star clicked (1-5), the rating component should update the form value to that number, display the correct number of filled stars, and show the appropriate label.

**Validates: Requirements 5.2, 5.5, 5.7**

### Property 6: Star Rating Keyboard Navigation

*For any* keyboard interaction (Tab, Enter, Arrow keys), the rating component should be navigable and selectable via keyboard.

**Validates: Requirements 5.4**

### Property 7: Star Rating Hover Preview

*For any* star hovered, the rating component should show a preview of what rating would be selected.

**Validates: Requirements 5.6**

### Property 8: Business Logic Preservation

*For any* payment flow execution, all existing payment processing, Midtrans integration, transaction status handling, and API calls should function identically to before the UI changes.

**Validates: Requirements 8.1, 8.2, 8.3, 8.5, 8.6**

### Property 9: No Console Errors

*For any* page render or user interaction, the browser console should contain no error messages.

**Validates: Requirements 8.4**

### Property 10: Touch Target Sizes

*For any* interactive element on mobile viewports, the tap target should be at least 44x44px.

**Validates: Requirements 9.5**

### Property 11: Consistent Spacing

*For any* similar UI elements (buttons, inputs, cards), the spacing values should be consistent across the page.

**Validates: Requirements 7.2**

## Error Handling

### Invalid Numeric Input

**Scenario**: User enters non-numeric or negative values in tip amount

**Handling**:
1. Prevent negative values from being entered
2. Show validation error for invalid input
3. Clear invalid input or reset to last valid value
4. Maintain form in valid state

**Implementation**:
```typescript
<Input
  type="number"
  min="0"
  step="1"
  onInput={(e) => {
    const value = parseFloat(e.currentTarget.value);
    if (value < 0) {
      e.currentTarget.value = "0";
    }
  }}
/>
```

### Missing Rating Selection

**Scenario**: User attempts to submit without selecting a rating

**Handling**:
1. Validate rating is selected before submission
2. Show validation message if missing
3. Focus rating component
4. Prevent form submission

### Payment Processing Errors

**Scenario**: Midtrans integration fails or returns error

**Handling**:
1. Maintain existing error handling logic
2. Show user-friendly error messages
3. Provide retry option
4. Log errors for monitoring

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

1. **Container Width**
   - Renders at 672px on desktop (768px+ viewport)
   - Renders full-width on mobile (< 768px viewport)
   - No horizontal scroll at any viewport

2. **Brand Color**
   - Logo displays in #1e5f4b
   - Primary buttons use #1e5f4b background
   - Button text is white/contrasting

3. **Numeric Input**
   - Accepts positive numbers
   - Rejects negative numbers
   - Handles empty input
   - Has inputMode="numeric"

4. **Star Rating**
   - Displays 5 stars
   - Clicking star selects rating
   - Shows correct labels
   - Updates form data

5. **UI Element Removal**
   - No back arrow present
   - No message field present
   - Layout adjusts correctly

### Property-Based Tests

Property-based tests will verify universal properties using **fast-check** library:

1. **Property 1: Responsive Container Width**
   - Generate random viewport widths
   - Verify container width behavior for all sizes

2. **Property 2: Brand Color Consistency**
   - Find all primary buttons
   - Verify all use correct colors

3. **Property 3: Numeric Input Validation**
   - Generate random numeric inputs (positive, negative, zero)
   - Verify validation behavior

4. **Property 4: Logo Centering**
   - Generate random viewport widths
   - Verify logo is centered for all sizes

5. **Property 5: Star Rating Interaction**
   - Generate random star selections (1-5)
   - Verify correct state updates

6. **Property 8: Business Logic Preservation**
   - Run existing payment flow tests
   - Verify no regressions

7. **Property 9: No Console Errors**
   - Render page and interact
   - Monitor console for errors

8. **Property 10: Touch Target Sizes**
   - Find all interactive elements on mobile
   - Verify minimum 44x44px size

**Test Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with: `Feature: tip-payment-ui-v2, Property {number}: {property_text}`

### Integration Tests

Integration tests will verify end-to-end flows:

1. **Complete Payment Flow**
   - User enters amount → selects rating → submits payment
   - Verify Midtrans integration works
   - Verify success page displays correctly

2. **Responsive Behavior**
   - Test at 375px, 768px, 1024px, 1440px
   - Verify layout adapts correctly
   - Verify no horizontal scroll

3. **Form Validation**
   - Test with invalid inputs
   - Verify validation messages
   - Verify form cannot submit with errors

## Implementation Notes

### Responsive Breakpoints

```css
/* Mobile-first approach */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets - key breakpoint for 672px container */
lg: 1024px  /* Small desktops */
xl: 1440px  /* Large desktops */
```

### Brand Color Variables

```css
/* Add to Tailwind config or CSS variables */
--brand-primary: #1e5f4b;
--brand-primary-hover: #16483a; /* Slightly darker for hover */
--brand-primary-active: #0f3329; /* Even darker for active */
```

### Container Width Implementation

```tsx
// Main container
<div className="w-full md:min-w-[672px] md:w-[672px] md:mx-auto px-4 md:px-6">
  {/* Content */}
</div>
```

### Star Rating Implementation

```tsx
// Using shadcn/ui patterns
<div role="radiogroup" aria-label="Rating">
  {[1, 2, 3, 4, 5].map((star) => (
    <button
      key={star}
      role="radio"
      aria-checked={rating === star}
      onClick={() => setRating(star)}
      onKeyDown={(e) => handleKeyDown(e, star)}
      className="focus:outline-none focus:ring-2"
    >
      <Star filled={star <= rating} />
    </button>
  ))}
</div>
```

### Numeric Input Implementation

```tsx
<Input
  type="number"
  inputMode="numeric"
  min="0"
  step="1"
  value={amount}
  onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
  className="text-lg"
/>
```

### Color Palette

```css
/* Brand colors */
Primary: #1e5f4b
Primary Hover: #16483a
Primary Active: #0f3329

/* Existing design system */
Background: slate-50 (light) / slate-900 (dark)
Text: slate-900 (light) / slate-50 (dark)
Border: slate-200 (light) / slate-700 (dark)
```

### Typography Scale

```css
/* Headings */
h1: text-2xl font-bold (24px)
h2: text-xl font-semibold (20px)
h3: text-lg font-medium (18px)

/* Body */
body: text-base (16px)
small: text-sm (14px)
tiny: text-xs (12px)
```

### Spacing System

Using Tailwind's spacing scale (4px base):
- Tight: p-2, gap-2 (8px)
- Normal: p-4, gap-4 (16px)
- Relaxed: p-6, gap-6 (24px)
- Loose: p-8, gap-8 (32px)

### Accessibility Requirements

1. **Keyboard Navigation**
   - All interactive elements focusable
   - Visible focus indicators (ring-2 ring-brand-primary)
   - Logical tab order

2. **Screen Readers**
   - Semantic HTML (main, section, form)
   - ARIA labels for star rating
   - Alt text for logo
   - Status announcements for form validation

3. **Color Contrast**
   - #1e5f4b on white: 7.4:1 (AAA compliant)
   - White on #1e5f4b: 7.4:1 (AAA compliant)

4. **Touch Targets**
   - Minimum 44x44px for all interactive elements
   - Adequate spacing between tap targets (8px minimum)

## Migration Strategy

### Phase 1: Component Updates
1. Update container width classes
2. Update brand colors in Tailwind config
3. Create StarRating component
4. Update Input component for numeric input

### Phase 2: Layout Changes
1. Center logo
2. Remove back arrow
3. Remove message field
4. Update form layout

### Phase 3: Integration
1. Wire StarRating to form
2. Update numeric input handling
3. Test payment flow
4. Verify Midtrans integration

### Phase 4: Testing & QA
1. Run unit tests
2. Run property-based tests
3. Manual QA at all breakpoints
4. Accessibility audit
5. Payment flow testing

### Rollback Plan

If issues arise:
1. Git revert to previous version
2. Monitor error rates
3. Fix issues in development
4. Redeploy with fixes

## Performance Considerations

### Bundle Size
- StarRating component is lightweight (< 2KB)
- No new dependencies required
- Minimal CSS additions

### Rendering Performance
- No layout shifts (fixed container width)
- Minimal re-renders (optimized state management)
- Fast paint times (simple UI)

## Security Considerations

### Input Validation
- Client-side validation for UX
- Server-side validation for security (existing)
- No XSS vulnerabilities (React escaping)

### Payment Security
- Existing Midtrans security maintained
- No changes to payment flow
- HTTPS enforced

## Monitoring & Analytics

### Metrics to Track

1. **Performance**
   - Page load time
   - Time to Interactive (TTI)
   - No layout shifts (CLS = 0)

2. **User Behavior**
   - Rating distribution (1-5 stars)
   - Average tip amount
   - Form completion rate

3. **Technical**
   - Console errors
   - Form validation errors
   - Payment success rate

## Conclusion

Этот дизайн предоставляет чёткий план обновления UI страницы оплаты чаевых с фокусом на минимализм и улучшенный UX. Ключевые изменения - адаптивная ширина контейнера, фирменный цвет, числовой ввод, рейтинг звёздами и упрощение интерфейса - создадут более чистый и профессиональный опыт для пользователей.

Property-based тестирование обеспечит корректность на широком диапазоне входных данных, а поэтапная стратегия миграции минимизирует риски. Сохраняя всю бизнес-логику и интеграцию с платежами, мы можем уверенно развернуть эти улучшения UI без влияния на основную функциональность.
