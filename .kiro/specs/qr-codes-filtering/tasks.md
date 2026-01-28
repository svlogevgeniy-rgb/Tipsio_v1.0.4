# Implementation Plan: QR Codes Filtering

## Overview

Добавление клиентской фильтрации QR-кодов по типу на странице QR-codes. Реализация включает добавление Tabs компонента для переключения фильтров и логику фильтрации на клиенте.

## Tasks

- [ ] 1. Implement Filter State Management
  - [x] 1.1 Add filter type definition and state
    - Add QrFilter type: 'all' | 'team' | 'individual'
    - Add activeFilter state with default 'all'
    - Add setActiveFilter handler
    - _Requirements: 1.1, 5.1_

  - [x] 1.2 Implement filter logic with useMemo
    - Create filteredQrCodes computed value using useMemo
    - Implement 'all' filter (return all QR codes)
    - Implement 'team' filter (TEAM, TABLE, VENUE types)
    - Implement 'individual' filter (INDIVIDUAL, PERSONAL types)
    - _Requirements: 1.2, 1.3, 2.1, 2.3, 3.1, 3.3_

  - [ ]* 1.3 Write property test for all filter shows all QR codes
    - **Property 1: All filter shows all QR codes**
    - **Validates: Requirements 1.2, 1.3**

  - [ ]* 1.4 Write property test for team filter shows only team QR codes
    - **Property 2: Team filter shows only team QR codes**
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [ ]* 1.5 Write property test for individual filter shows only individual QR codes
    - **Property 3: Individual filter shows only individual QR codes**
    - **Validates: Requirements 3.1, 3.2, 3.3**

- [ ] 2. Implement Filter Tabs UI
  - [x] 2.1 Add Tabs component to QR codes page
    - Import Tabs, TabsList, TabsTrigger from shadcn/ui
    - Add Tabs component above QR cards grid
    - Position after header, before QR list
    - Only show when qrCodes.length > 0
    - _Requirements: 4.1, 4.3_

  - [x] 2.2 Create three filter tabs
    - Add "Все" tab with value "all"
    - Add "Командный QR" tab with value "team"
    - Add "Индивидуальный QR" tab with value "individual"
    - Connect to activeFilter state
    - Connect to setActiveFilter handler
    - _Requirements: 1.4, 2.1, 3.1_

  - [x] 2.3 Style filter tabs for responsiveness
    - Add responsive grid layout (grid-cols-3)
    - Set max-width for tabs container
    - Test on mobile (375px), tablet (768px), desktop (1440px)
    - Ensure visual consistency with venue dashboard
    - _Requirements: 4.4, 4.5_

  - [x] 2.4 Add active state styling
    - Ensure active tab is visually highlighted
    - Test tab switching transitions
    - Verify no layout shifts during filter changes
    - _Requirements: 4.2, 8.4_

- [ ] 3. Update QR List Display
  - [x] 3.1 Replace qrCodes with filteredQrCodes in render
    - Update map function to use filteredQrCodes
    - Update length check to use filteredQrCodes.length
    - Ensure all QR card rendering uses filtered list
    - _Requirements: 1.2, 2.1, 3.1_

  - [x] 3.2 Implement filter-specific empty states
    - Create empty state messages for each filter type
    - Show appropriate message when filteredQrCodes.length === 0
    - Include "Создать QR" button in empty state
    - _Requirements: 2.4, 3.4, 6.1, 6.2, 6.3, 6.4_

  - [ ]* 3.3 Write property test for empty state shows correct message
    - **Property 5: Empty state shows correct message**
    - **Validates: Requirements 6.1, 6.2**

- [ ] 4. Maintain Filter State During Operations
  - [x] 4.1 Verify filter persists after QR creation
    - Test creating Individual QR with different filters active
    - Test creating Team QR with different filters active
    - Ensure activeFilter state is maintained after fetchQrCodes
    - _Requirements: 5.2_

  - [x] 4.2 Verify filter persists after QR edit
    - Test editing Team QR with different filters active
    - Ensure activeFilter state is maintained after fetchQrCodes
    - _Requirements: 5.3_

  - [ ]* 4.3 Write property test for filter state persists during operations
    - **Property 6: Filter state persists during operations**
    - **Validates: Requirements 5.2, 5.3**

- [ ] 5. Verify Existing Functionality
  - [x] 5.1 Test all QR actions work with filters
    - Test download (PNG/SVG) with each filter active
    - Test open QR link with each filter active
    - Test edit Team QR with each filter active
    - Verify "Создать QR" button works with each filter active
    - _Requirements: 7.1, 7.2_

  - [x] 5.2 Verify QR Generator component unaffected
    - Ensure QR Generator still displays for first QR
    - Verify it's not affected by filter selection
    - _Requirements: 7.5_

  - [ ]* 5.3 Write property test for all QR actions work with filters
    - **Property 7: All QR actions work with filters**
    - **Validates: Requirements 7.1**

- [ ] 6. Performance Optimization
  - [x] 6.1 Verify client-side filtering performance
    - Ensure no API calls on filter switch
    - Verify useMemo prevents unnecessary re-renders
    - Test filter switching is instant (<16ms)
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 6.2 Write property test for filter switching is immediate
    - **Property 4: Filter switching is immediate**
    - **Validates: Requirements 8.1, 8.2**

- [ ] 7. Testing and Validation
  - [x] 7.1 Test responsive design
    - Test on mobile viewport (375px)
    - Test on tablet viewport (768px)
    - Test on desktop viewport (1440px)
    - Verify tabs layout works on all sizes
    - _Requirements: 4.5_

  - [x] 7.2 Test edge cases
    - Test with no QR codes (empty state)
    - Test with only Individual QR codes
    - Test with only Team QR codes
    - Test rapid filter switching
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 7.3 Verify no console errors
    - Check browser console for errors
    - Verify no React warnings
    - Test all filter combinations
    - _Requirements: All_

  - [x] 7.4 Run full test suite
    - npm run lint
    - npm run typecheck
    - npm run test
    - npm run build
    - _Requirements: All_

- [ ] 8. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.
  - Verify acceptance criteria:
    - ✓ Filter tabs visible and functional
    - ✓ "Все" shows all QR codes
    - ✓ "Командный QR" shows only team QR codes
    - ✓ "Индивидуальный QR" shows only individual QR codes
    - ✓ Empty states show correct messages
    - ✓ Filter persists during create/edit
    - ✓ All existing functionality works
    - ✓ Responsive on all screen sizes
    - ✓ No console errors

## Notes

- Tasks marked with `*` are optional property-based tests
- All filtering is client-side (no backend changes needed)
- Uses existing shadcn/ui Tabs component
- No new dependencies required
- Filter state resets on page refresh (expected behavior)
- Maintain visual consistency with existing venue dashboard
