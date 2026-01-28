# Implementation Plan: Full-Stack Stabilization (TIPS-31)

## Overview

План исправления ошибок и стабилизации проекта TIPSIO. Задачи организованы по приоритету: сначала критические исправления, затем улучшения.

## Tasks

- [x] 1. Fix useEffect dependencies in Admin Panel
  - [x] 1.1 Fix useEffect in AdminVenuesPage
    - Move fetch logic inside useEffect or use useCallback
    - Ensure no duplicate API calls on filter change
    - _Requirements: 6.3, 9.2_
  - [x] 1.2 Fix useEffect in AdminTransactionsPage
    - Move fetch logic inside useEffect or use useCallback
    - Ensure no duplicate API calls on filter change
    - _Requirements: 6.3, 9.3_
  - [x] 1.3 Fix useEffect in useStaffManagement hook
    - Move fetchStaff logic inside useEffect or use useCallback
    - _Requirements: 9.4_

- [x] 2. Checkpoint - Verify lint warnings resolved
  - Run `npm run lint` and verify useEffect warnings are gone
  - Ensure all tests pass, ask the user if questions arise

- [x] 3. Add error handling to Admin Panel
  - [x] 3.1 Add error state to AdminVenuesPage
    - Add error state variable
    - Display error message when fetch fails
    - Add retry button
    - _Requirements: 5.4_
  - [x] 3.2 Add error state to AdminTransactionsPage
    - Add error state variable
    - Display error message when fetch fails
    - Add retry button
    - _Requirements: 5.4_

- [x] 4. Fix i18n hardcoded text in Navigation
  - [x] 4.1 Add missing translation keys to messages files
    - Add keys for "Вход", "Продукты", dropdown items
    - Add to en.json, ru.json, id.json
    - _Requirements: 3.4_
  - [x] 4.2 Update LandingNavigation to use translations
    - Replace hardcoded Russian text with t() calls
    - _Requirements: 3.4_
  - [x] 4.3 Write property test for translation completeness
    - **Property 1: Translation Key Completeness**
    - **Validates: Requirements 3.4**

- [x] 5. Checkpoint - Verify i18n and error handling
  - Run tests and verify all pass
  - Manually test landing page in different locales
  - Ensure all tests pass, ask the user if questions arise

- [x] 6. Create documentation for fixes
  - [x] 6.1 Create TIPS-31-issues.md document
    - List all found issues with severity
    - Document fixes applied
    - Include before/after notes
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 7. Final checkpoint - Full verification
  - Run `npm run build` - should pass without errors ✅
  - Run `npm run lint` - should have no errors (warnings OK) ✅
  - Run `npm run test` - all tests should pass ✅ (194/194)
  - Ensure all tests pass, ask the user if questions arise

## Notes

- All tasks are required for comprehensive validation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases

