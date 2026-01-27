стоп# Implementation Plan: Tip Payment UI V2 Redesign

## Overview

Этот план реализации разбивает редизайн UI на дискретные, управляемые задачи. Фокус на обновлении визуального дизайна для соответствия новым требованиям: адаптивная ширина контейнера (672px), фирменный цвет (#1e5f4b), числовой ввод суммы, рейтинг звёздами, центрированный логотип и упрощение интерфейса. Все изменения сохраняют существующую бизнес-логику и интеграцию с платежами.

## Tasks

- [x] 1. Update Tailwind configuration for brand colors
  - Add brand color #1e5f4b to Tailwind config as custom color
  - Add hover and active variants (#16483a, #0f3329)
  - Verify color is accessible (contrast ratio >= 4.5:1)
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2. Create StarRating component
  - Create `src/components/tip/StarRating.tsx` with 5-star interface
  - Implement clickable stars with value state (1-5)
  - Add visual labels for each rating level (Очень плохо, Плохо, Удовлетворительно, Хорошо, Отлично)
  - Implement hover preview functionality
  - Add keyboard navigation support (Tab, Enter, Arrow keys)
  - Apply ARIA attributes (role="radiogroup", aria-checked)
  - Ensure minimum 44x44px touch targets
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 9.5_

- [x] 2.1 Write property tests for StarRating component
  - **Property 5: Star Rating Interaction** - For any star clicked, verify correct value, filled stars, and label
  - **Property 6: Star Rating Keyboard Navigation** - For any keyboard interaction, verify navigation works
  - **Property 7: Star Rating Hover Preview** - For any star hovered, verify preview shows
  - _Requirements: 5.2, 5.4, 5.5, 5.6, 5.7_

- [x] 2.2 Write unit tests for StarRating edge cases
  - Test all 5 rating levels
  - Test keyboard navigation (Tab, Enter, Space, Arrow keys)
  - Test hover states
  - Test ARIA attributes are correct
  - Test touch target sizes on mobile
  - _Requirements: 5.1, 5.3, 5.4, 9.5_

- [x] 3. Update payment page container width
  - Update main container in `src/app/tip/[shortCode]/page.tsx`
  - Apply responsive classes: `w-full md:min-w-[672px] md:w-[672px] md:mx-auto`
  - Add proper padding: `px-4 md:px-6`
  - Verify no horizontal scroll at any viewport size
  - Test at 375px, 768px, 1024px, 1440px viewports
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3.1 Write property test for responsive container width
  - **Property 1: Responsive Container Width** - For any viewport width, verify correct container behavior
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3.2 Write unit tests for container width
  - Test container is 672px on desktop (>= 768px)
  - Test container is full-width on mobile (< 768px)
  - Test container is centered on desktop
  - Test no horizontal scroll at any size
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 4. Update logo styling and positioning
  - Update Tipsio logo color to #1e5f4b
  - Center logo horizontally at top of page
  - Apply proper spacing above and below logo (p-6 or p-8)
  - Ensure centering works at all viewport sizes
  - _Requirements: 2.1, 4.1, 4.2, 4.3_

- [x] 4.1 Write property test for logo centering
  - **Property 4: Logo Centering Across Viewports** - For any viewport width, verify logo is centered
  - _Requirements: 4.1, 4.2_

- [x] 4.2 Write unit tests for logo styling
  - Test logo color is #1e5f4b
  - Test logo is centered horizontally
  - Test proper spacing around logo
  - _Requirements: 2.1, 4.1, 4.3_

- [x] 5. Update tip amount input to numeric
  - Replace current tip amount input with numeric input
  - Remove any +/- increment/decrement controls
  - Set `type="number"` and `inputMode="numeric"`
  - Add `min="0"` to prevent negative values
  - Implement validation for negative values (reject or reset to 0)
  - Handle empty input (treat as 0 or show validation error)
  - Preserve existing currency formatting (Rp) if present
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 5.1 Write property test for numeric input validation
  - **Property 3: Numeric Input Validation** - For any numeric value, verify validation behavior
  - _Requirements: 3.1, 3.3_

- [x] 5.2 Write unit tests for tip amount input
  - Test accepts positive numbers
  - Test rejects negative numbers
  - Test handles empty input
  - Test has inputMode="numeric"
  - Test no +/- controls present
  - Test currency formatting preserved
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 6. Replace experience field with StarRating component
  - Remove current "Your Experience" field/control
  - Integrate StarRating component in its place
  - Wire StarRating value to form state (rating: 1-5)
  - Ensure form data structure maintains compatibility
  - Update form validation to include rating
  - _Requirements: 5.7, 5.8_

- [x] 6.1 Write unit tests for StarRating integration
  - Test StarRating updates form state
  - Test form data structure is compatible
  - Test form validation includes rating
  - _Requirements: 5.7, 5.8_

- [x] 7. Remove back arrow and message field
  - Remove back arrow/button from page header
  - Remove message input field/textarea
  - Adjust header layout after back arrow removal
  - Adjust form layout after message field removal
  - Ensure proper spacing and alignment
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 7.1 Write unit tests for UI element removal
  - Test no back arrow present
  - Test no message field present
  - Test header layout is correct
  - Test form layout is correct
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 8. Update primary button styling
  - Update all primary buttons to use brand color #1e5f4b
  - Set button text color to white
  - Add hover state with darker shade (#16483a)
  - Add active state with even darker shade (#0f3329)
  - Ensure consistent styling across all primary buttons
  - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [x] 8.1 Write property test for brand color consistency
  - **Property 2: Brand Color Consistency** - For any primary button, verify correct colors
  - _Requirements: 2.2, 2.3, 2.5_

- [x] 8.2 Write unit tests for button styling
  - Test primary button background is #1e5f4b
  - Test button text is white
  - Test hover state changes color
  - Test all primary buttons use consistent styling
  - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [x] 9. Apply shadcn/ui components and minimalist styling
  - Ensure Card, Input, Button, Label, Separator components are used
  - Apply consistent spacing (gap-4, p-4, p-6)
  - Apply consistent typography (text-base, text-lg, font-medium)
  - Remove any unnecessary decorative elements
  - Ensure proper visual hierarchy
  - _Requirements: 7.1, 7.2_

- [x] 9.1 Write property test for consistent spacing
  - **Property 11: Consistent Spacing** - For any similar UI elements, verify spacing is consistent
  - _Requirements: 7.2_

- [x] 9.2 Write unit tests for component usage
  - Test shadcn/ui components are present
  - Test consistent spacing values
  - Test consistent typography
  - _Requirements: 7.1, 7.2_

- [x] 10. Checkpoint - Verify payment logic preservation
  - Run existing payment flow tests
  - Verify Midtrans integration still works
  - Verify transaction status handling unchanged
  - Verify all API calls function correctly
  - Verify form data structure is compatible
  - Check for console errors during payment flow
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 10.1 Write property test for business logic preservation
  - **Property 8: Business Logic Preservation** - For any payment flow, verify all logic functions identically
  - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.6_

- [x] 10.2 Write property test for no console errors
  - **Property 9: No Console Errors** - For any page render or interaction, verify no console errors
  - _Requirements: 8.4_

- [x] 11. Test responsive behavior
  - Test page at 375px viewport (mobile)
  - Test page at 768px viewport (tablet)
  - Test page at 1024px viewport (desktop)
  - Test page at 1440px viewport (large desktop)
  - Verify no horizontal scroll at any size
  - Verify touch targets are 44x44px minimum on mobile
  - _Requirements: 9.1, 9.2, 9.3, 9.5_

- [x] 11.1 Write property test for touch target sizes
  - **Property 10: Touch Target Sizes** - For any interactive element on mobile, verify minimum 44x44px
  - _Requirements: 9.5_

- [x] 11.2 Write unit tests for responsive behavior
  - Test mobile viewport (< 768px)
  - Test tablet viewport (>= 768px)
  - Test desktop viewport (>= 1024px)
  - Test touch target sizes on mobile
  - _Requirements: 9.1, 9.2, 9.3, 9.5_

- [x] 12. Accessibility audit
  - Verify all interactive elements are keyboard accessible
  - Verify visible focus indicators on all focusable elements
  - Verify semantic HTML structure (main, section, form)
  - Verify ARIA labels on StarRating component
  - Verify color contrast meets WCAG AA standards (4.5:1 minimum)
  - Test with screen reader (VoiceOver or NVDA)
  - _Requirements: 7.1, 5.4_

- [x] 13. Final QA and polish
  - Manual testing on real devices (mobile, tablet, desktop)
  - Cross-browser testing (Chrome, Safari, Firefox)
  - Verify all requirements are met
  - Test complete payment flow end-to-end
  - Verify no layout shifts during loading
  - Check performance (page load time, TTI)
  - Verify no console errors or warnings
  - Test with different tip amounts and ratings
  - Verify Midtrans integration works correctly

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check library
- Unit tests validate specific examples and edge cases
- All tests should run with minimum 100 iterations for property tests
- Focus on preserving existing business logic - only UI changes
- Use shadcn/ui components for consistency
- Follow mobile-first responsive design approach
- Ensure all interactive elements meet accessibility standards
