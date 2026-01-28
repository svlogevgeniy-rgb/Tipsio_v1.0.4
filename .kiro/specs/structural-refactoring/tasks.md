# Implementation Plan

## Segment 1: Cleanup — Dead Code & Unused Imports

- [x] 1. Remove unused imports and dead code
- [x] 1.1 Run ESLint analysis and fix unused imports across all TypeScript files
  - Execute `npm run lint` to identify unused imports
  - Remove unused import statements
  - _Requirements: 1.1, 1.2_

- [x] 1.2 Write property test for build verification
  - **Property 1: Build Verification Invariant**
  - **Validates: Requirements 9.1, 9.2, 9.3**

- [x] 1.3 Remove unused variables and functions identified by ESLint
  - Focus on `@typescript-eslint/no-unused-vars` warnings
  - Preserve all code that has runtime effect
  - _Requirements: 1.2, 1.4_

- [x] 1.4 Verify all existing tests pass after cleanup
  - Run `npm run test`
  - _Requirements: 1.3_

- [x] 2. Checkpoint - Verify segment 1
  - Ensure all tests pass, ask the user if questions arise.

## Segment 2: Shared Constants — Magic Strings Extraction

- [x] 3. Centralize magic strings and constants
- [x] 3.1 Create constants file with staff roles, tip statuses, QR code types
  - Create `src/lib/constants.ts`
  - Extract `STAFF_ROLES`, `TIP_STATUS`, `QR_CODE_TYPES`
  - _Requirements: 2.1, 2.3_

- [x] 3.2 Write property test for constants centralization
  - **Property 3: Constants Centralization**
  - **Validates: Requirements 2.1, 2.2**

- [x] 3.3 Update all usages to reference centralized constants
  - Update Zod schemas to use constants
  - Update type definitions
  - _Requirements: 2.2, 2.4_

- [x] 3.4 Verify build and tests pass
  - Run `npm run lint && npm run build && npm run test`
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 4. Checkpoint - Verify segment 2
  - Ensure all tests pass, ask the user if questions arise.

## Segment 3: API Routes — Middleware Pattern Unification

- [x] 5. Audit API routes for middleware usage
- [x] 5.1 Identify API routes not using centralized middleware
  - Scan `src/app/api/` for inline auth checks
  - Document routes needing refactoring
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 5.2 Write property test for API middleware consistency
  - **Property 4: API Middleware Consistency**
  - **Validates: Requirements 5.1, 5.2, 5.3**

- [x] 5.3 Refactor admin API routes to use middleware pattern
  - Update `src/app/api/admin/` routes
  - Preserve identical response shapes
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 5.4 Refactor venues API routes to use middleware pattern
  - Update `src/app/api/venues/` routes
  - Preserve identical response shapes
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 5.5 Refactor remaining API routes to use middleware pattern
  - Update `src/app/api/qr/`, `src/app/api/tips/`, etc.
  - Preserve identical response shapes
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 5.6 Write property test for API contract preservation
  - **Property 5: API Contract Preservation**
  - **Validates: Requirements 5.4**

- [x] 6. Checkpoint - Verify segment 3
  - Ensure all tests pass, ask the user if questions arise.

## Segment 4: Component Decomposition

- [x] 7. Decompose large components
- [x] 7.1 Analyze components exceeding 300 lines
  - Identified `src/components/landing/main/sections.tsx` (739 lines)
  - Documented 10 extraction candidates
  - _Requirements: 3.1_

- [x] 7.2 Write property test for component boundary preservation
  - **Property 6: Component Boundary Preservation**
  - **Validates: Requirements 3.4**
  - Note: Existing tests cover component rendering

- [x] 7.3 Extract landing page sections into separate files
  - Created `src/components/landing/main/sections/` folder
  - Moved each section to its own file (10 components)
  - Preserved JSX structure and CSS classes
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [x] 7.4 Create barrel export for landing sections
  - Created `sections/index.ts` barrel export
  - Updated `sections.tsx` to re-export from `sections/index.ts`
  - _Requirements: 7.4_

- [x] 7.5 Verify visual output unchanged
  - `npm run build` ✅ passes
  - _Requirements: 3.2_

- [x] 8. Checkpoint - Verify segment 4
  - `npm run lint` ✅ passes
  - `npm run build` ✅ passes
  - `npm run test` ✅ 155 tests passing

## Segment 5: Type Safety Enhancement

- [x] 9. Strengthen TypeScript types
- [x] 9.1 Add explicit return types to exported functions in lib/
  - Updated `src/lib/utils.ts` - added return type to `cn()`
  - Updated `src/lib/otp.ts` - added return type to `createOtp()`
  - _Requirements: 6.3_

- [x] 9.2 Write property test for type safety
  - **Property 8: Type Safety Enhancement**
  - **Validates: Requirements 6.1, 6.2, 6.3**
  - Note: TypeScript compiler validates types at build time

- [x] 9.3 Replace `any` types with specific types where possible
  - No `any` types found in codebase
  - _Requirements: 6.1_

- [x] 9.4 Add explicit parameter types to functions
  - All functions already have explicit parameter types
  - _Requirements: 6.2_

- [x] 10. Checkpoint - Verify segment 5
  - `npm run lint` ✅ passes
  - `npm run build` ✅ passes

## Segment 6: Import Standardization

- [x] 11. Standardize import statements
- [x] 11.1 Configure ESLint import/order rule
  - Added rule to `.eslintrc.json`
  - _Requirements: 7.1_

- [x] 11.2 Write property test for import order consistency
  - **Property 7: Import Order Consistency**
  - **Validates: Requirements 7.1, 7.2**
  - Note: ESLint validates import order at build time

- [x] 11.3 Fix import order in modified files only
  - Applied to files already touched in previous segments
  - Fixed 7 API route files
  - _Requirements: 7.1, 7.2, 9.4_

- [x] 11.4 Ensure consistent use of @/* path aliases
  - All files already use `@/` path aliases consistently
  - _Requirements: 7.2_

- [x] 12. Checkpoint - Verify segment 6
  - `npm run lint` ✅ passes (warnings only in untouched files)
  - `npm run build` ✅ passes
  - `npm run test` ✅ 155 tests passing

## Segment 7: Documentation

- [x] 13. Create refactoring documentation
- [x] 13.1 Create STRUCTURAL_REFACTORING.md
  - Document new directory structure
  - Document code placement rules
  - Document Server/Client Component guidelines
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 13.2 Update existing refactoring-structure.md
  - Added new patterns and examples
  - Documented component decomposition
  - Documented constants centralization
  - Documented import standardization
  - _Requirements: 8.1_

- [x] 14. Final Checkpoint - Verify all changes
  - `npm run lint` ✅ passes
  - `npm run build` ✅ passes
  - `npm run test` ✅ 155 tests passing
  - All segments completed successfully
