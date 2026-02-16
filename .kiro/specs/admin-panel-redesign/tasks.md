# Implementation Plan: Admin Panel Redesign

## Overview

This implementation plan breaks down the admin panel redesign into discrete, manageable tasks. The approach follows a systematic migration strategy: design tokens → core components → layout components → page updates → polish. Each task builds on previous work and includes testing to ensure quality and correctness.

## Tasks

- [x] 1. Setup Design Token System
  - Update `src/app/globals.css` with new CSS variables for neutral scale, accent colors, and semantic colors
  - Update `tailwind.config.ts` to reference new design tokens
  - Remove old glass effect utilities (`.glass`, `.glass-heavy`)
  - Add new utility classes for consistent shadows and borders
  - Document design tokens in a new file `src/lib/design-tokens.md`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [x] 1.1 Write property test for color token usage
  - **Property 7: Color Token Usage**
  - **Validates: Requirements 1.1, 1.2, 1.3**
  - Parse component files and verify no hardcoded color values (e.g., `#ffffff`, `rgb()`)
  - Ensure all colors reference CSS variables or Tailwind classes

- [x] 1.2 Write property test for spacing consistency
  - **Property 2: Spacing Consistency**
  - **Validates: Requirements 4.1**
  - Generate random component configurations
  - Verify all spacing values are multiples of 4px

- [ ] 2. Update Core UI Components
  - [ ] 2.1 Update Button component (`src/components/ui/button.tsx`)
    - Add new variants: `primary`, `secondary`, `tertiary`, `destructive`, `ghost`
    - Remove `landing` and `headerCta` variants
    - Update sizes to match design (sm: h-8, md: h-10, lg: h-12)
    - Add `loading` prop with spinner
    - Ensure all states (hover, active, focus, disabled) are properly styled
    - Update border radius to `rounded` (8px)
    - _Requirements: 3.1, 3.8_

  - [ ] 2.2 Write unit tests for Button component
    - Test all variants render correctly
    - Test loading state displays spinner
    - Test disabled state prevents clicks
    - Test keyboard focus shows focus ring
    - _Requirements: 3.1, 3.8_

  - [ ] 2.3 Update Input component (`src/components/ui/input.tsx`)
    - Add `state` prop: `default`, `error`, `disabled`
    - Add `prefix` and `suffix` props for icons
    - Update styling to match design system
    - Ensure proper focus states with accent color ring
    - _Requirements: 3.2_

  - [ ] 2.4 Write unit tests for Input component
    - Test error state styling
    - Test prefix/suffix rendering
    - Test disabled state
    - Test focus ring appearance
    - _Requirements: 3.2_

  - [ ] 2.5 Update Badge component (`src/components/ui/badge.tsx`)
    - Update variants: `default`, `success`, `warning`, `error`, `info`
    - Remove `beta` variant
    - Ensure proper contrast ratios for all variants
    - Add dark mode support
    - _Requirements: 3.7_

  - [ ] 2.6 Write property test for badge contrast ratios
    - **Property 1: Contrast Ratio Compliance**
    - **Validates: Requirements 2.1, 2.2, 2.3**
    - Generate random badge variants
    - Calculate contrast ratios between text and background
    - Verify all meet WCAG AA standards (4.5:1 for normal text)

  - [ ] 2.7 Update Card component (`src/components/ui/card.tsx`)
    - Update border and shadow styling
    - Use `border-neutral-200` and `shadow-sm`
    - Update padding to `p-6`
    - Ensure dark mode support
    - _Requirements: 4.1, 4.4, 4.5_

- [ ] 3. Create New Pattern Components
  - [ ] 3.1 Create Table component (`src/components/ui/table.tsx`)
    - Implement table structure with proper semantic HTML
    - Add sticky header support
    - Add sortable column headers
    - Add row hover states
    - Add row selection support (optional)
    - Style with proper spacing and borders
    - _Requirements: 3.3, 7.1_

  - [ ] 3.2 Write unit tests for Table component
    - Test table renders with data
    - Test sticky header behavior
    - Test sortable columns
    - Test row hover states
    - Test row selection
    - _Requirements: 3.3, 7.1_

  - [ ] 3.3 Create FilterBar component (`src/components/admin/FilterBar.tsx`)
    - Implement search input with icon
    - Implement filter dropdowns
    - Add responsive layout (stack on mobile)
    - Style according to design system
    - _Requirements: 7.2, 7.3_

  - [ ] 3.4 Create StatsGrid component (`src/components/admin/StatsGrid.tsx`)
    - Implement stat card layout
    - Add icon support
    - Add trend indicator support (up/down arrows)
    - Make responsive (1 col mobile, 2 col tablet, 4 col desktop)
    - _Requirements: 6.1, 7.4_

  - [ ] 3.5 Write unit tests for StatsGrid component
    - Test stat cards render correctly
    - Test trend indicators display
    - Test responsive grid layout
    - _Requirements: 6.1, 7.4_

- [ ] 4. Create Layout Components
  - [ ] 4.1 Create Sidebar component (`src/components/admin/Sidebar.tsx`)
    - Implement collapsible sidebar (240px expanded, 64px collapsed)
    - Add logo section at top
    - Add navigation items with icons and labels
    - Implement active state styling
    - Add badge support for notifications
    - Add footer section for settings
    - Make responsive (drawer on mobile)
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 5.6_

  - [ ] 4.2 Write unit tests for Sidebar component
    - Test sidebar renders navigation items
    - Test active state styling
    - Test collapse/expand functionality
    - Test badge display
    - _Requirements: 5.1, 5.3, 5.4, 5.5_

  - [ ] 4.3 Create TopBar component (`src/components/admin/TopBar.tsx`)
    - Implement fixed height (64px) top bar
    - Add mobile menu button (visible on mobile only)
    - Add global search input
    - Add notification button with badge
    - Add user profile dropdown
    - _Requirements: 5.2_

  - [ ] 4.4 Create AdminLayout component (`src/components/admin/AdminLayout.tsx`)
    - Combine Sidebar and TopBar
    - Implement responsive layout
    - Add page container with proper padding
    - Handle sidebar collapse state
    - _Requirements: 5.1, 5.2, 12.1, 12.2, 12.3, 12.4_

  - [ ] 4.5 Write property test for touch target sizes
    - **Property 10: Touch Target Size**
    - **Validates: Requirements 14.5**
    - Generate random interactive elements
    - Measure rendered dimensions
    - Verify minimum 44x44px size

- [ ] 5. Create Shared UI Patterns
  - [ ] 5.1 Create LoadingState component (`src/components/admin/LoadingState.tsx`)
    - Implement skeleton loader for tables
    - Implement spinner for buttons
    - Implement full-page loading state
    - _Requirements: 13.1, 13.2_

  - [ ] 5.2 Create ErrorState component (`src/components/admin/ErrorState.tsx`)
    - Implement error display with icon
    - Add error message display
    - Add retry button
    - Style according to design system
    - _Requirements: 13.3_

  - [ ] 5.3 Create EmptyState component (`src/components/admin/EmptyState.tsx`)
    - Implement empty state with icon
    - Add title and description
    - Add optional action button
    - Style according to design system
    - _Requirements: 7.7_

- [ ] 6. Update Dashboard Page
  - [ ] 6.1 Update Dashboard page (`src/app/admin/page.tsx`)
    - Remove AuroraBackground component
    - Use new AdminLayout component
    - Replace glass cards with StatsGrid component
    - Update quick links section with new Card styling
    - Add loading states
    - Add error handling with ErrorState component
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 11.1, 11.2_

  - [ ] 6.2 Write unit tests for Dashboard page
    - Test stats grid renders
    - Test quick links render
    - Test loading state
    - Test error state
    - _Requirements: 6.1, 6.6_

- [ ] 7. Update Venues List Page
  - [ ] 7.1 Update Venues page (`src/app/admin/venues/page.tsx`)
    - Remove AuroraBackground component
    - Use new AdminLayout component
    - Replace glass filter bar with FilterBar component
    - Replace glass stats with StatsGrid component
    - Replace custom table with Table component
    - Add loading state with LoadingState component
    - Add error state with ErrorState component
    - Add empty state with EmptyState component
    - Update badge styling for Midtrans status
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 11.1, 11.2_

  - [ ] 7.2 Write unit tests for Venues page
    - Test filter bar functionality
    - Test table renders with data
    - Test loading state
    - Test error state with retry
    - Test empty state
    - _Requirements: 7.2, 7.7, 7.8, 7.9_

- [ ] 8. Update Transactions List Page
  - [ ] 8.1 Update Transactions page (`src/app/admin/transactions/page.tsx`)
    - Remove AuroraBackground component
    - Use new AdminLayout component
    - Replace glass filter bar with FilterBar component
    - Replace glass stats with StatsGrid component
    - Replace custom table with Table component
    - Add loading state with LoadingState component
    - Add error state with ErrorState component
    - Add empty state with EmptyState component
    - Update transaction detail modal styling
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 11.1, 11.2_

  - [ ] 8.2 Write unit tests for Transactions page
    - Test filter bar functionality
    - Test table renders with data
    - Test modal opens on row click
    - Test loading state
    - Test error state with retry
    - _Requirements: 7.2, 7.8, 7.9_

- [ ] 9. Update Commissions Page
  - [ ] 9.1 Update Commissions page (`src/app/admin/commissions/page.tsx`)
    - Remove AuroraBackground component
    - Use new AdminLayout component
    - Apply new design system styling
    - Add loading and error states
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 11.1, 11.2_

- [ ] 10. Update Settings Page
  - [ ] 10.1 Update Settings page (`src/app/admin/settings/page.tsx`)
    - Remove AuroraBackground component
    - Use new AdminLayout component
    - Apply new design system styling
    - Update form styling
    - Add save confirmation
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 11.1, 11.2_

- [ ] 11. Update Admin Layout
  - [ ] 11.1 Update admin layout (`src/app/admin/layout.tsx`)
    - Wrap children with AdminLayout component
    - Remove old layout structure
    - _Requirements: 5.1, 5.2_

- [ ] 12. Accessibility Improvements
  - [ ] 12.1 Add keyboard navigation support
    - Ensure all interactive elements are keyboard accessible
    - Add keyboard shortcuts for common actions
    - Test tab order throughout admin panel
    - _Requirements: 14.1, 15.2_

  - [ ] 12.2 Write property test for focus indicators
    - **Property 9: Focus Indicator Presence**
    - **Validates: Requirements 14.2**
    - Generate random focusable elements
    - Simulate keyboard focus
    - Verify visible focus indicator appears

  - [ ] 12.3 Add ARIA labels and semantic HTML
    - Add proper ARIA labels to all interactive elements
    - Ensure proper heading hierarchy (h1 → h2 → h3)
    - Use semantic HTML elements (nav, main, aside, header)
    - _Requirements: 14.3, 14.4_

  - [ ] 12.4 Write accessibility audit tests
    - Test with axe-core or similar tool
    - Verify no critical accessibility violations
    - Test keyboard navigation flows
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 13. Responsive Design Testing
  - [ ] 13.1 Test mobile layout (320px - 640px)
    - Verify sidebar collapses to drawer
    - Verify tables scroll horizontally
    - Verify stats grid stacks to 1 column
    - Verify filter bar stacks vertically
    - _Requirements: 12.1, 12.4, 12.5_

  - [ ] 13.2 Test tablet layout (640px - 1024px)
    - Verify sidebar remains visible
    - Verify stats grid shows 2 columns
    - Verify tables display properly
    - _Requirements: 12.2_

  - [ ] 13.3 Test desktop layout (1024px+)
    - Verify full layout displays correctly
    - Verify stats grid shows 4 columns
    - Verify optimal use of screen space
    - _Requirements: 12.3_

- [ ] 14. Dark Mode Support
  - [ ] 14.1 Verify dark mode for all components
    - Test all components in dark mode
    - Verify contrast ratios in dark mode
    - Ensure proper color token usage
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 14.2 Write property test for dark mode contrast
    - **Property 1: Contrast Ratio Compliance (Dark Mode)**
    - **Validates: Requirements 2.1, 2.2, 2.3**
    - Generate random components in dark mode
    - Calculate contrast ratios
    - Verify WCAG AA compliance

- [ ] 15. Performance Optimization
  - [ ] 15.1 Optimize table rendering
    - Implement virtual scrolling for large datasets (100+ rows)
    - Add pagination for better performance
    - Optimize re-renders with React.memo
    - _Requirements: 15.1_

  - [ ] 15.2 Optimize animations
    - Reduce animation duration to 150-200ms
    - Use CSS transforms for better performance
    - Remove unnecessary animations
    - _Requirements: 15.3_

- [ ] 16. Documentation and Cleanup
  - [ ] 16.1 Create design system documentation
    - Document all design tokens
    - Document component usage examples
    - Create Storybook stories (optional)
    - _Requirements: 1.8_

  - [ ] 16.2 Remove deprecated code
    - Remove AuroraBackground component
    - Remove old glass effect utilities
    - Remove unused color variables
    - Clean up unused imports
    - _Requirements: 11.1, 11.2_

  - [ ] 16.3 Update i18n translations
    - Add new translation keys for admin panel
    - Update existing translations if needed
    - Verify all text is translatable
    - _Requirements: All_

- [ ] 17. Final Testing and QA
  - [ ] 17.1 Run full test suite
    - Run all unit tests
    - Run all property-based tests
    - Run accessibility tests
    - Fix any failing tests
    - _Requirements: All_

  - [ ] 17.2 Manual QA testing
    - Test all pages in admin panel
    - Test all user flows
    - Test in different browsers
    - Test on different devices
    - _Requirements: All_

  - [ ] 17.3 Performance testing
    - Test with large datasets
    - Measure page load times
    - Optimize if needed
    - _Requirements: 15.1, 15.3_

- [ ] 18. Checkpoint - Final Review
  - Ensure all tests pass
  - Verify design system is fully implemented
  - Verify all pages are updated
  - Ask the user if questions arise

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Property-based tests use fast-check library with minimum 100 iterations
- All components should support both light and dark modes
- All components should be fully accessible (WCAG AA)
- Focus on B2B efficiency: information density, keyboard shortcuts, fast interactions
