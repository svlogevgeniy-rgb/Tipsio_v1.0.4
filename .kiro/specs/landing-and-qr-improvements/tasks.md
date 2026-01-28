# Implementation Plan: Landing and QR Improvements

## Overview

This implementation plan breaks down the landing page and QR code management improvements into discrete, testable tasks. The work is organized into logical groups that can be implemented incrementally.

## Tasks

- [x] 1. Update Translation Files
  - Update all Russian translation keys for landing page sections
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 5.1, 5.2, 5.3_

- [x] 1.1 Update Problem Section translations
  - Update `problem.desc1` with new problem description
  - Update `problem.desc2` with new solution statement
  - _Requirements: 2.1, 2.2_

- [x] 1.2 Update Product Demo Section translations
  - Update `productDemo.title` to "Понятно каждому гостю"
  - Update `productDemo.point1` to "Мультиязычный интерфейс"
  - Update `productDemo.point2` to "Без приложений и аккаунтов"
  - Update `productDemo.point3` to "Оптимальные суммы — больше чаевых без усилий"
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 1.3 Update Benefits Section translations
  - Update `benefits.business.desc` with new business benefit text
  - Update `benefits.guests.desc` with new guest benefit text
  - _Requirements: 4.1, 4.2_

- [x] 1.4 Update FAQ Section translations
  - Update `faq.title` to "FAQ"
  - Update `faq.q1.q` to "Нужно ли открывать счёт в Midtrans?"
  - Update `faq.q3.a` with new pricing answer
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 1.5 Write unit tests for translation updates
  - Test that all translation keys resolve correctly
  - Test fallback to English when Russian key is missing
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 5.1, 5.2, 5.3_

- [x] 2. Simplify Navigation Header
  - Remove login dropdown menu and replace with direct link button
  - Hide products dropdown menu
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2.1 Update LandingNavigation component
  - Remove DropdownMenu components for login and products
  - Replace login dropdown with Link button to /venue/login
  - Update mobile menu to remove login and products sections
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2.2 Write unit tests for navigation changes
  - Test login button renders with correct href
  - Test products dropdown is not rendered
  - Test mobile menu does not show login/products sections
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2.3 Write property test for navigation behavior
  - **Property 1: Navigation Login Button Direct Link**
  - **Validates: Requirements 1.1, 1.2**

- [x] 2.4 Write property test for products dropdown
  - **Property 2: Products Dropdown Hidden**
  - **Validates: Requirements 1.3**

- [x] 3. Update Problem Section with Google Pay Button and Midtrans Logo
  - Add Google Pay button component to phone mockup
  - Add Midtrans logo image to security badge
  - _Requirements: 2.3, 2.4, 2.5_

- [x] 3.1 Add Midtrans logo to project images
  - Locate or download Midtrans logo SVG
  - Add to `/public/images/` directory
  - Optimize file size if needed
  - _Requirements: 2.4_

- [x] 3.2 Install Google Pay button package
  - Install `@google-pay/button-react` package
  - Configure for TEST environment
  - _Requirements: 2.3_

- [x] 3.3 Update LandingProblemSection component
  - Replace text button with GooglePayButton component
  - Replace "через Midtrans" text with Midtrans logo Image
  - Maintain existing layout and styling
  - _Requirements: 2.3, 2.4_

- [x] 3.4 Write unit tests for Problem Section updates
  - Test Google Pay button renders
  - Test Midtrans logo renders with correct src
  - Test fallback behavior if components fail to load
  - _Requirements: 2.3, 2.4_

- [x] 3.5 Write property test for Google Pay button
  - **Property 4: Google Pay Button Rendering**
  - **Validates: Requirements 2.3**

- [x] 3.6 Write property test for Midtrans logo
  - **Property 5: Midtrans Logo Display**
  - **Validates: Requirements 2.4**

- [x] 4. Checkpoint - Verify landing page changes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create QR Code Delete API Route
  - Implement DELETE endpoint for QR code deletion
  - Add authorization and validation
  - _Requirements: 6.4, 6.5, 6.7_

- [x] 5.1 Create DELETE API route
  - Create `/app/api/venue/qr-codes/[id]/route.ts`
  - Implement session validation
  - Implement venue ownership check
  - Implement QR code deletion with Prisma
  - Return appropriate status codes and error messages
  - _Requirements: 6.4, 6.5, 6.7_

- [x] 5.2 Write unit tests for DELETE API route
  - Test successful deletion returns 204
  - Test unauthorized access returns 401
  - Test non-existent QR code returns 404
  - Test deletion of other venue's QR code returns 403
  - _Requirements: 6.4, 6.5, 6.7_

- [x] 5.3 Write property test for authorization
  - Generate random sessions and verify authorization logic
  - **Property 13: QR Code Deletion Success**
  - **Validates: Requirements 6.5, 6.6**

- [x] 5.4 Write property test for error handling
  - **Property 14: QR Code Deletion Error Handling**
  - **Validates: Requirements 6.7**

- [x] 6. Update QR Codes Page with List Layout
  - Convert grid layout to list layout
  - Add delete button to each QR code entry
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 6.1 Update QR codes page component
  - Change layout from grid to list
  - Display QR code image, staff name, role, and creation date
  - Add download button (if not already present)
  - Add delete button with destructive variant
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 6.2 Write unit tests for list layout
  - Test QR codes render in list format
  - Test each entry shows required information
  - Test delete button is present for each entry
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 6.3 Write property test for list rendering
  - **Property 10: QR Code List Layout**
  - **Validates: Requirements 6.1, 6.2**

- [ ] 6.4 Write property test for delete button
  - **Property 11: QR Code Delete Button Presence**
  - **Validates: Requirements 6.3**

- [x] 7. Implement Delete Confirmation Dialog
  - Add AlertDialog component for delete confirmation
  - Wire up delete functionality
  - _Requirements: 6.4, 6.5, 6.6, 6.7_

- [x] 7.1 Add delete confirmation dialog
  - Import AlertDialog components from shadcn/ui
  - Create confirmation dialog with staff name
  - Add cancel and confirm actions
  - _Requirements: 6.4_

- [x] 7.2 Implement delete handler
  - Create handleDelete function to show confirmation
  - Create confirmDelete function to call API
  - Implement optimistic UI update
  - Show success toast on successful deletion
  - Show error toast on failed deletion
  - _Requirements: 6.4, 6.5, 6.6, 6.7_

- [x] 7.3 Write unit tests for delete flow
  - Test delete button opens confirmation dialog
  - Test cancel button closes dialog without deleting
  - Test confirm button calls API and updates list
  - Test error handling shows error message
  - _Requirements: 6.4, 6.5, 6.6, 6.7_

- [ ] 7.4 Write property test for confirmation dialog
  - **Property 12: Delete Confirmation Dialog**
  - **Validates: Requirements 6.4**

- [ ] 7.5 Write integration test for complete delete flow
  - Test full flow from button click to database removal
  - Test concurrent deletion scenarios
  - _Requirements: 6.4, 6.5, 6.6, 6.7_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Translation updates should be deployed first as they are non-breaking
- QR code management changes should be tested thoroughly due to data deletion
