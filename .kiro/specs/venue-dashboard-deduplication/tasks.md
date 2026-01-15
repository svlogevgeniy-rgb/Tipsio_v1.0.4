# Implementation Plan: Venue Dashboard Deduplication

## Overview

Устранение дублирующихся запросов к `/api/venues/dashboard` через создание единого источника данных. Задачи организованы по фазам: инфраструктура → layout → consumers → cleanup.

## Tasks

- [x] 1. Create infrastructure for shared dashboard data
  - [x] 1.1 Create constants file
    - Create `src/features/venue-dashboard/constants.ts`
    - Define `DEFAULT_DASHBOARD_PERIOD = 'week'`
    - Define `DASHBOARD_PERIODS` array and `DashboardPeriod` type
    - _Requirements: 2.2, 2.3_
  
  - [x] 1.2 Create API fetcher
    - Create `src/features/venue-dashboard/api/getVenueDashboard.ts`
    - Implement `getVenueDashboard(period)` function
    - Add TypeScript interfaces for response data
    - Use `DEFAULT_DASHBOARD_PERIOD` as default parameter
    - _Requirements: 2.1, 2.2, 2.4_
  
  - [x] 1.3 Create VenueDashboardProvider
    - Create `src/features/venue-dashboard/context/VenueDashboardProvider.tsx`
    - Implement Context with state: data, period, isLoading, error
    - Implement `setPeriod` method with fetch logic
    - Implement `refresh` method
    - Add in-flight request guard using useRef
    - Accept `initialData`, `initialPeriod`, `initialError` props
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 1.4 Create useVenueDashboard hook
    - Create `src/features/venue-dashboard/hooks/useVenueDashboard.ts`
    - Implement hook that reads from VenueDashboardContext
    - Throw error if used outside Provider
    - _Requirements: 3.4, 3.5_

- [x] 2. Checkpoint - Verify infrastructure
  - Run TypeScript check - should pass
  - Ensure all tests pass, ask the user if questions arise

- [x] 3. Refactor layout to use server fetch
  - [x] 3.1 Update layout to async server component
    - Convert `src/app/venue/(dashboard)/layout.tsx` to async function
    - Import `getVenueDashboard` and `VenueDashboardProvider`
    - Add server-side fetch with try-catch
    - Wrap children in `VenueDashboardProvider` with initialData
    - Keep existing UI structure (sidebar, navigation, etc.)
    - _Requirements: 1.3, 1.4, 4.1, 4.2, 6.1_
  
  - [x] 3.2 Remove client fetch from layout
    - Remove `useEffect` that fetches dashboard data
    - Remove `venueData` state
    - Remove client-side fetch logic
    - Keep distribution mode logic (will be moved to context)
    - _Requirements: 4.1, 4.2_

- [x] 4. Checkpoint - Verify layout works
  - Test layout renders correctly
  - Check DevTools Network for single request
  - Ensure all tests pass, ask the user if questions arise

- [x] 5. Refactor dashboard page
  - [x] 5.1 Update useDashboardData hook
    - Modify `src/app/venue/(dashboard)/dashboard/use-dashboard-data.ts`
    - Replace fetch logic with `useVenueDashboard()` call
    - Map context data to existing interface
    - Keep same return signature for backward compatibility
    - _Requirements: 4.3, 7.1, 7.2_

- [x] 6. Refactor QR Codes page
  - [x] 6.1 Update QR Codes page to use context
    - Modify `src/app/venue/(dashboard)/qr-codes/page.tsx`
    - Replace `useEffect` fetch with `useVenueDashboard()` hook
    - Use `data.venue.id` and `data.venue.name` from context
    - Remove local `venueName` state
    - _Requirements: 4.4, 7.1, 7.2_

- [x] 7. Refactor Settings page
  - [x] 7.1 Update Settings page to use context
    - Modify `src/app/venue/(dashboard)/settings/page.tsx`
    - Replace `useEffect` fetch with `useVenueDashboard()` hook
    - Use `data.venue.id` and `data.venue.distributionMode` from context
    - Remove local fetch logic
    - _Requirements: 4.5, 7.1, 7.2_

- [x] 8. Refactor useStaffManagement hook
  - [x] 8.1 Update useStaffManagement to use context
    - Modify `src/components/venue/staff/use-staff-management.ts`
    - Replace dashboard fetch with `useVenueDashboard()` hook
    - Use `data.venue.id` from context
    - Remove dashboard fetch from `fetchStaff` function
    - Keep staff-specific fetch logic
    - _Requirements: 4.6, 7.1, 7.2_

- [x] 9. Checkpoint - Verify all pages work
  - Test Dashboard page
  - Test QR Codes page
  - Test Settings page
  - Test Staff page
  - Check DevTools Network - should see only 1 dashboard request
  - Ensure all tests pass, ask the user if questions arise

- [x] 10. Update tests
  - [x] 10.1 Update existing tests
    - Update tests that mock dashboard fetch
    - Add VenueDashboardProvider wrapper where needed
    - Fix any broken tests due to refactoring
    - _Requirements: 7.5_
  
  - [ ]* 10.2 Write unit tests for new infrastructure
    - Test `getVenueDashboard` with different periods
    - Test Provider state management
    - Test `useVenueDashboard` throws outside Provider
    - Test in-flight request deduplication
    - _Requirements: 5.4_
  
  - [ ]* 10.3 Write property test for single request
    - **Property 1: Single Request on Load**
    - **Validates: Requirements 1.1, 1.2**
  
  - [ ]* 10.4 Write property test for shared state
    - **Property 2: Shared State Consistency**
    - **Validates: Requirements 3.5**

- [x] 11. Final verification and cleanup
  - [x] 11.1 Remove unused code
    - Remove any unused imports
    - Remove commented-out code
    - Clean up any temporary code
    - _Requirements: 7.3_
  
  - [x] 11.2 Add documentation
    - Add JSDoc comments to Provider and hook
    - Add README in `src/features/venue-dashboard/`
    - Document how to use `useVenueDashboard`
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 12. Final checkpoint - Full verification
  - Run `npm run build` - should pass
  - Run `npm run lint` - should have no errors
  - Run `npm run test` - all tests should pass
  - Open DevTools Network tab
  - Navigate to `/venue/dashboard`
  - Verify exactly 1 request to `/api/venues/dashboard?period=week`
  - Navigate between dashboard pages - no additional requests
  - Change period filter - verify new request with correct period
  - Test error states (disconnect network, check error UI)
  - Verify no UI/UX regressions
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Keep backward compatibility - no breaking changes to existing APIs
- Server fetch in layout is the key optimization
- Context provides shared state without prop drilling
