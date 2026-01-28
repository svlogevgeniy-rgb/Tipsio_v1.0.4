# Implementation Plan

- [x] 1. Prepare colored payment logo assets
  - Copy colored Visa and Mastercard assets from `/images/` to `/public/images/payment/`
  - Create or obtain colored logo assets for GPay, OVO, and GoPay
  - Verify all assets are clear at small sizes (24-40px height)
  - Name files with `-color` suffix for clarity (e.g., `visa-color.svg`)
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Update landing page payment logo section
  - Locate payment logo rendering in `src/components/landing/main/sections.tsx`
  - Update Image src attributes to point to colored assets
  - Remove `grayscale` class from container div
  - Remove `opacity-60` class from container div
  - Replace GoPay and OVO text elements with Image components using colored assets
  - Verify responsive layout remains intact
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2.1 Write property test for payment logo color preservation
  - **Property 1: Payment logo color preservation**
  - **Validates: Requirements 1.1, 1.2, 1.4**
  - Generate random payment method selections
  - Verify image sources contain colored assets
  - Verify no grayscale or opacity-reducing styles applied
  - Run 100 iterations minimum

- [x] 2.2 Write property test for payment section completeness
  - **Property 2: Payment section logo completeness**
  - **Validates: Requirements 1.3**
  - Test that GPay, OVO, GoPay render as image elements
  - Verify valid src attributes present
  - Run 100 iterations minimum

- [x] 3. Update test fixtures for payment logos
  - Update `src/app/page.test.tsx` to use colored assets
  - Update test expectations to verify colored logo sources
  - Remove grayscale class from test component
  - Ensure existing property tests still pass
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 4. Audit menu feature for shared code
  - Search codebase for imports from menu modules
  - Identify any utilities used outside menu feature
  - Document shared code that needs preservation
  - Create plan for extracting shared utilities if found
  - _Requirements: 2.4, 2.5_

- [x] 5. Remove venue menu navigation link
  - Open `src/app/venue/(dashboard)/layout.tsx`
  - Remove menu navigation item from navItems array
  - Verify TypeScript compilation succeeds
  - Test that venue dashboard renders without errors
  - _Requirements: 2.3_

- [x] 5.1 Write property test for navigation menu exclusion
  - **Property 3: Navigation menu exclusion**
  - **Validates: Requirements 2.3**
  - Generate random navigation configurations
  - Verify no items have href="/venue/menu"
  - Run 100 iterations minimum

- [x] 6. Delete venue menu route
  - Delete `/src/app/venue/(dashboard)/menu/page.tsx`
  - Run `npm run build` to verify no broken imports
  - Test that navigating to /venue/menu returns 404
  - _Requirements: 2.1, 2.2_

- [x] 6.1 Write unit test for menu route 404
  - **Example 1: Menu route returns 404**
  - **Validates: Requirements 2.1**
  - Test navigation to /venue/menu
  - Verify 404 status code returned

- [x] 7. Delete venue menu components
  - Delete `/src/components/venue/menu/` directory and all contents
  - Remove any imports of menu components from other files
  - Run `npm run build` to verify no broken imports
  - _Requirements: 2.2, 2.5_

- [x] 8. Delete menu services and types
  - Delete `/src/lib/menu.ts`
  - Delete `/src/lib/menu-service.ts`
  - Delete `/src/lib/menu-validation.ts`
  - Delete `/src/lib/menu.test.ts`
  - Delete `/src/types/menu.ts`
  - Remove any imports of menu types from other files
  - Run `npm run build` to verify no broken imports
  - _Requirements: 2.2, 2.5_

- [x] 9. Checkpoint - Verify menu removal
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Generate favicon assets
  - Export Tipsio logo from `/public/images/tipsio-logo.svg`
  - Create 16×16 PNG with brand color #1E5F4B
  - Create 32×32 PNG with brand color #1E5F4B
  - Create 180×180 PNG for apple-touch-icon
  - Generate favicon.ico with embedded 16×16 and 32×32
  - Place all files in `/public/` directory root
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 11. Configure favicon in Next.js layout
  - Open `src/app/layout.tsx`
  - Add `icons` configuration to metadata object
  - Include icon array with 16×16, 32×32, and ICO references
  - Include apple array with 180×180 apple-touch-icon
  - Verify TypeScript types are correct
  - _Requirements: 3.1, 3.4_

- [x] 11.1 Write unit test for favicon metadata
  - **Example 2: Favicon metadata present**
  - **Validates: Requirements 3.1, 3.4**
  - Test that layout metadata includes icons configuration
  - Verify all required sizes are present
  - Verify apple-touch-icon is configured

- [x] 12. Final checkpoint - Verify all changes
  - Run `npm run build` and verify exit code 0
  - Run full test suite and verify all tests pass
  - Manually test /venue/menu returns 404
  - Visually verify colored payment logos in browser
  - Visually verify favicon displays in browser tab
  - Test responsive layout on mobile and desktop
  - Verify no runtime errors in console
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 12.1 Write unit test for build success
  - **Example 3: Build succeeds**
  - **Validates: Requirements 4.1**
  - Execute `npm run build` programmatically
  - Verify exit code is 0
  - Verify no error messages in output
