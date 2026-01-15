# Implementation Plan: Tip Payment UI Redesign

## Overview

This implementation plan breaks down the UI redesign into discrete, manageable tasks. The focus is on updating the visual design to match reference scans, implementing proper staff photo display with placeholders, and adding complete i18n support for RU/EN/ID languages. All changes preserve existing business logic and payment integration.

## Tasks

- [x] 1. Create reusable StaffAvatar component
  - Create `src/components/tip/StaffAvatar.tsx` with size variants (sm/md/lg)
  - Implement image loading with skeleton placeholder
  - Add fallback to placeholder icon when avatarUrl is null
  - Handle image load errors gracefully
  - Apply fixed dimensions to prevent CLS
  - Add meaningful alt text support
  - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 7.1_

- [x] 1.1 Write property tests for StaffAvatar component
  - **Property 1: Staff Photo Display** - For any staff with avatarUrl, image src should match
  - **Property 2: Staff Placeholder Display** - For any staff without avatarUrl, placeholder should render
  - **Property 3: Consistent Avatar Dimensions** - All avatars should have consistent dimensions per size
  - **Property 5: Meaningful Alt Text** - Alt text should contain staff name or fallback
  - _Requirements: 2.1, 2.2, 2.3, 2.6_

- [x] 1.2 Write unit tests for StaffAvatar edge cases
  - Test image load error handling
  - Test skeleton loading state
  - Test all size variants render correctly
  - _Requirements: 2.4, 2.5_

- [x] 2. Add i18n translations for tip pages
  - [x] 2.1 Add missing translation keys to `messages/en.json`
    - Add keys for staff selection page ("Who would you like to thank?")
    - Add keys for tip amount page (amount labels, experience ratings, message placeholder)
    - Add keys for success page (all text content)
    - Ensure all existing keys are present
    - _Requirements: 3.1_

  - [x] 2.2 Add Russian translations to `messages/ru.json`
    - Translate all new keys from English to Russian
    - Verify existing tip-related translations are complete
    - _Requirements: 3.1, 3.2_

  - [x] 2.3 Add Indonesian translations to `messages/id.json`
    - Translate all new keys from English to Indonesian
    - Verify existing tip-related translations are complete
    - _Requirements: 3.1, 3.2_

- [x] 2.4 Write property test for i18n completeness
  - **Property 6: Complete i18n Coverage** - All text keys should exist in all three language files
  - _Requirements: 3.1_

- [x] 3. Update Payment Page (staff selection) UI
  - Update layout to match reference scan design
  - Replace current staff display with grid layout (2 columns mobile, 3-4 desktop)
  - Integrate StaffAvatar component for all staff members
  - Update header with simplified venue info
  - Add sticky footer with branding
  - Apply shadcn/ui Card components for staff cards
  - Replace all hardcoded text with i18n translation keys
  - Ensure responsive behavior at 375px, 768px, 1440px
  - _Requirements: 1.1, 1.3, 1.5, 2.1, 2.2, 3.1, 5.1, 5.2, 5.3_

- [x] 3.1 Write unit tests for Payment Page
  - Test staff grid renders correctly
  - Test staff selection interaction
  - Test language switching updates text
  - _Requirements: 3.3_

- [x] 4. Update Tip Amount Page UI
  - Update layout to match reference scan design
  - Add staff info header with StaffAvatar component
  - Implement preset amount buttons (Rp 50, 100, 150)
  - Add custom amount input with number spinner
  - Add experience rating with emoji buttons
  - Add optional message textarea with character counter (0/99)
  - Update fixed bottom CTA button with amount display
  - Replace all hardcoded text with i18n translation keys
  - Ensure responsive behavior at all breakpoints
  - _Requirements: 1.1, 1.3, 1.5, 2.1, 3.1, 5.1, 5.2, 5.3_

- [x] 4.1 Write unit tests for Tip Amount Page
  - Test amount selection (preset and custom)
  - Test experience rating selection
  - Test message input with character counter
  - Test CTA button state (enabled/disabled)
  - _Requirements: 1.1_

- [x] 5. Update Success Page UI
  - Update layout to match reference scan design
  - Add centered success icon with animation
  - Add StaffAvatar component to success display
  - Update summary card with amount and recipient info
  - Add supportive message text
  - Update close button styling
  - Replace all hardcoded text with i18n translation keys
  - Ensure responsive behavior at all breakpoints
  - _Requirements: 1.2, 1.3, 1.5, 2.1, 3.1, 5.1, 5.2, 5.3_

- [x] 5.1 Write property test for Success Page query parameters
  - **Property 9: Success Page Query Parameter Handling** - Valid params show success, invalid show error
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 5.2 Write unit tests for Success Page
  - Test success state with valid parameters
  - Test error state with invalid parameters
  - Test error state with missing parameters
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 6. Update API response to include staff avatar URL
  - Modify `/api/tips/${orderId}` endpoint to include `staffAvatarUrl` in response
  - Update TipDetails interface to include optional `staffAvatarUrl` field
  - Ensure backward compatibility (field is optional)
  - _Requirements: 2.1_

- [x] 7. Checkpoint - Ensure all tests pass
  - Run all unit tests: `npm test`
  - Run all property-based tests
  - Verify no console errors in browser
  - Check responsive behavior at 375px, 768px, 1440px
  - Test language switching (RU/EN/ID)
  - Verify staff photos display correctly (with and without avatarUrl)
  - Ensure all existing payment functionality still works

- [x] 8. Write property tests for accessibility
  - **Property 13: Accessibility Compliance** - Semantic HTML, keyboard navigation, ARIA labels
  - _Requirements: 7.3, 7.4, 7.5_

- [x] 9. Write property test for no console errors
  - **Property 10: No Console Errors** - No errors logged during page render
  - _Requirements: 6.4_

- [x] 10. Write property test for CLS prevention
  - **Property 11: CLS Prevention** - Avatar containers have explicit dimensions
  - _Requirements: 7.1_

- [x] 11. Write property test for loading states
  - **Property 12: Loading State Display** - Skeletons shown during async loading
  - _Requirements: 7.2_

- [x] 12. Final QA and polish
  - Manual testing on real devices (mobile, tablet, desktop)
  - Cross-browser testing (Chrome, Safari, Firefox)
  - Verify all reference scan requirements met
  - Check image optimization and loading performance
  - Verify language switching works smoothly
  - Test with staff members with and without photos
  - Verify payment flow end-to-end
  - Check accessibility with screen reader
  - Verify no layout shifts during loading

## Notes

- All tasks are now required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check library
- Unit tests validate specific examples and edge cases
- All tests should run with minimum 100 iterations for property tests
- Focus on preserving existing business logic - only UI/i18n changes
- Use shadcn/ui components (Card, Button, Badge, Skeleton) for consistency
- Follow mobile-first responsive design approach
- Ensure all text uses i18n translation keys (no hardcoded strings)
