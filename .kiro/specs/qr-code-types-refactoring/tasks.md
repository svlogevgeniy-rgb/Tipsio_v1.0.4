# Implementation Plan: QR Code Types Refactoring

## Overview

Реализация замены механики Distribution Mode на новую систему QR-кодов INDIVIDUAL/TEAM. План разбит на этапы: схема БД → миграция → backend API → frontend → удаление старого кода → тестирование.

## Tasks

- [x] 1. Database Schema Changes
  - [x] 1.1 Update Prisma schema with new QrType enum values
    - Add INDIVIDUAL and TEAM to QrType enum
    - Keep PERSONAL, TABLE, VENUE for backward compatibility during migration
    - _Requirements: 2.5, 3.7, 12.1_

  - [x] 1.2 Create QrCodeRecipient model
    - Add model with qrCodeId, staffId foreign keys
    - Add unique constraint on (qrCodeId, staffId)
    - Add cascade delete on QrCode deletion
    - Add indexes for qrCodeId and staffId
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x] 1.3 Update QrCode model with recipients relation
    - Add recipients QrCodeRecipient[] relation
    - Keep existing staffId for INDIVIDUAL QR
    - _Requirements: 2.5, 3.7_

  - [x] 1.4 Update Staff model with teamQrCodes relation
    - Add teamQrCodes QrCodeRecipient[] relation
    - _Requirements: 3.7_

  - [x] 1.5 Generate and apply Prisma migration
    - Run prisma migrate dev
    - Verify migration is safe (no data loss)
    - _Requirements: 7.6, 9.2, 9.3_

- [x] 2. Data Migration Script
  - [x] 2.1 Create migration script for QR type conversion
    - Convert PERSONAL → INDIVIDUAL (preserve staffId)
    - Convert TABLE → TEAM
    - Convert VENUE → TEAM
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 2.2 Implement QrCodeRecipient creation for TEAM QRs
    - For each TABLE/VENUE QR, create QrCodeRecipient for all active venue staff
    - Handle venues with no active staff gracefully
    - _Requirements: 7.4_

  - [x] 2.3 Write property test for migration preserves shortCodes
    - **Property 9: Migration preserves shortCodes**
    - **Validates: Requirements 7.5, 8.4**

  - [x] 2.4 Write property test for migration converts types correctly
    - **Property 10: Migration converts types correctly**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**

  - [x] 2.5 Write property test for migration preserves tip data
    - **Property 11: Migration preserves tip data**
    - **Validates: Requirements 9.2, 9.3**

- [x] 3. Checkpoint - Database migration complete
  - All tests pass (396 tests)

- [x] 4. Backend API: QR Creation
  - [x] 4.1 Update POST /api/qr endpoint for new types
    - Accept type: INDIVIDUAL | TEAM
    - For INDIVIDUAL: require staffId, create QR with staffId
    - For TEAM: require recipientStaffIds[], create QR + QrCodeRecipient records
    - Validate minimum 2 recipients for TEAM
    - _Requirements: 2.1, 2.2, 3.1, 3.2_

  - [x] 4.2 Write property test for Individual QR requires exactly one staff
    - **Property 1: Individual QR requires exactly one staff**
    - **Validates: Requirements 2.2, 2.5**

  - [x] 4.3 Write property test for Team QR requires minimum 2 recipients
    - **Property 2: Team QR requires minimum 2 recipients**
    - **Validates: Requirements 3.2**

  - [x] 4.4 Update GET /api/qr endpoint to include recipients
    - Return recipients array for TEAM QRs
    - Return staff for INDIVIDUAL QRs
    - _Requirements: 11.1_

- [x] 5. Backend API: Tip Flow
  - [x] 5.1 Update GET /api/tip/:shortCode for new QR types
    - For INDIVIDUAL: return staff data directly
    - For TEAM: return recipients array (only active staff)
    - Remove distributionMode/allowStaffChoice logic
    - _Requirements: 2.4, 3.5, 4.1, 10.3_

  - [x] 5.2 Write property test for Individual QR leads directly to payment
    - **Property 3: Individual QR leads directly to payment**
    - **Validates: Requirements 2.4, 8.3**

  - [x] 5.3 Write property test for Team QR leads to staff selection
    - **Property 4: Team QR leads to staff selection**
    - **Validates: Requirements 3.5, 8.2**

  - [x] 5.4 Write property test for only active staff shown
    - **Property 5: Only active staff shown in Team QR selection**
    - **Validates: Requirements 4.1, 4.5, 11.4**

  - [x] 5.5 Add inactive staff validation in tip creation
    - Check staff status before creating tip
    - Return STAFF_INACTIVE error if inactive
    - _Requirements: 5.1_

  - [x] 5.6 Write property test for inactive staff triggers error
    - **Property 7: Inactive staff triggers popup**
    - **Validates: Requirements 5.1**

- [x] 6. Backend API: QR Update
  - [x] 6.1 Implement PATCH /api/qr/:id for Team QR recipients
    - Allow adding/removing recipients
    - Validate minimum 2 recipients after changes
    - Reject type changes
    - _Requirements: 11.2, 11.3, 2.6, 3.8_

  - [x] 6.2 Write property test for QR type cannot be changed
    - **Property 6: QR type cannot be changed after creation**
    - **Validates: Requirements 2.6, 3.8**

  - [x] 6.3 Write property test for Team QR minimum recipients on edit
    - **Property 14: Team QR minimum recipients on edit**
    - **Validates: Requirements 11.3**

- [x] 7. Checkpoint - Backend API complete
  - All tests pass (396 tests)

- [x] 8. Backend: Registration Flow Update
  - [x] 8.1 Update POST /api/auth/register to create owner Staff + QR
    - Create User with role ADMIN (keep existing)
    - Create Staff profile: displayName=venueName, role=ADMINISTRATOR
    - Create Individual QR: label=venueName, staffId=owner staff
    - Remove distributionMode handling
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7, 10.4_

  - [x] 8.2 Write property test for registration creates owner staff and QR
    - **Property 8: Registration creates owner staff and QR**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.7**

  - [x] 8.3 Write property test for registration ignores distributionMode
    - **Property 17: Registration ignores distributionMode**
    - **Validates: Requirements 10.4**

- [x] 9. Backend: Settings API Update
  - [x] 9.1 Update PATCH /api/venues/:id/settings to ignore distribution fields
    - Remove distributionMode from accepted fields
    - Remove allowStaffChoice from accepted fields
    - Keep Midtrans settings handling
    - _Requirements: 10.5_

  - [x] 9.2 Write property test for settings API ignores distribution fields
    - **Property 18: Settings API ignores distribution fields**
    - **Validates: Requirements 10.5**

- [x] 10. Backend: Tips API Update
  - [x] 10.1 Update POST /api/tips to always use PERSONAL type
    - Set TipType to PERSONAL for all new tips
    - Remove POOL type logic from new tip creation
    - _Requirements: 10.6_

  - [x] 10.2 Write property test for new tips always PERSONAL type
    - **Property 13: New tips always PERSONAL type**
    - **Validates: Requirements 10.6**

- [x] 11. Checkpoint - Backend complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Frontend: Registration Flow
  - [x] 12.1 Remove step 3 from registration page
    - Update src/app/venue/register/page.tsx
    - Remove DistributionModeForm import and usage
    - Change step count from 3 to 2
    - Update step indicator
    - _Requirements: 1.1, 1.4_

  - [x] 12.2 Update registration form submission
    - Remove distributionMode from form data
    - Submit directly after Midtrans validation (step 2)
    - _Requirements: 1.4, 10.4_

  - [x] 12.3 Remove DistributionModeForm component
    - Delete or deprecate src/components/venue/register/forms.tsx DistributionModeForm
    - Remove step3Schema from schemas
    - _Requirements: 1.1_

  - [x] 12.4 Update onboarding page to remove distribution step
    - Update src/app/venue/onboarding/page.tsx
    - Remove step 2 (distribution) from onboarding flow
    - _Requirements: 1.3_

- [x] 13. Frontend: Settings Page
  - [x] 13.1 Remove Tip Distribution section from settings
    - Update src/app/venue/(dashboard)/settings/page.tsx
    - Remove distributionMode state and UI
    - Remove allowStaffChoice state and UI
    - Keep Midtrans settings section
    - _Requirements: 1.2, 1.5_

- [x] 14. Frontend: QR Codes Page
  - [x] 14.1 Create QR type selection UI
    - Add type selector (Individual / Team) to QR creation form
    - Show appropriate staff selection based on type
    - _Requirements: 2.1, 3.1_

  - [x] 14.2 Implement Individual QR creation form
    - Single staff selector (dropdown or list)
    - Show staff name, avatar, role
    - _Requirements: 2.2, 2.3_

  - [x] 14.3 Implement Team QR creation form
    - Multi-select checkboxes for staff
    - Pre-select admin by default
    - Validate minimum 2 selections
    - Show staff name, avatar, role
    - _Requirements: 3.2, 3.3, 3.4_

  - [x] 14.4 Update QR list to show type and recipients
    - Display QR type badge (Individual/Team)
    - For Team QR: show recipient count or names
    - _Requirements: 11.1_

  - [x] 14.5 Implement Team QR edit functionality
    - Allow editing recipients list
    - Validate minimum 2 recipients
    - _Requirements: 11.2, 11.3_

- [x] 15. Frontend: Tip Page
  - [x] 15.1 Update tip page to use QR type instead of distributionMode
    - Update src/app/tip/[shortCode]/page.tsx
    - Remove distributionMode from QrData interface
    - Use type: INDIVIDUAL | TEAM for flow control
    - _Requirements: 10.3_

  - [x] 15.2 Update staff selection logic for Team QR
    - Show selection only for TEAM type
    - Skip selection for INDIVIDUAL type
    - _Requirements: 2.4, 3.5_

  - [x] 15.3 Implement InactiveStaffPopup component
    - Create popup with message "Выберите другого сотрудника!"
    - Show when navigating to inactive staff
    - Redirect to selection on dismiss
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 15.4 Handle all recipients inactive edge case
    - Show error message when all Team QR recipients are inactive
    - _Requirements: 5.4_

- [x] 16. Checkpoint - Frontend complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Cleanup: Remove Distribution Mode Dependencies
  - [x] 17.1 Remove distribution type exports
    - Update src/types/distribution.ts
    - Keep types for backward compatibility but mark as deprecated
    - _Requirements: 10.1, 10.2_

  - [x] 17.2 Update VenueLayoutClient navigation
    - Remove showFor distribution mode filtering
    - Show all nav items regardless of mode
    - _Requirements: 1.2_

  - [x] 17.3 Remove distribution API endpoint
    - Deprecate or remove /api/venues/:id/distribution
    - _Requirements: 10.5_

  - [x] 17.4 Update mock data in tip API
    - Update src/app/api/tip/[shortCode]/route.ts mock data
    - Use new QR types instead of distributionMode
    - _Requirements: 10.3_

- [x] 18. Final Testing and Validation
  - [x] 18.1 Write property test for QrCodeRecipient unique constraint
    - **Property 15: QrCodeRecipient unique constraint**
    - **Validates: Requirements 12.4**

  - [x] 18.2 Write property test for QrCodeRecipient cascade delete
    - **Property 16: QrCodeRecipient cascade delete**
    - **Validates: Requirements 12.5**

  - [x] 18.3 Write property test for new QR creation ignores distribution fields
    - **Property 12: New QR creation ignores distribution fields**
    - **Validates: Requirements 10.1, 10.2, 10.3**

  - [x] 18.4 Run full test suite
    - npm run lint ✅
    - npm run typecheck (tsc --noEmit) ✅
    - npm run test ✅ (399 passing, 9 skipped)
    - npm run build ✅
    - _Requirements: All_

- [x] 19. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.
  - Verify QA scenarios:
    - Registration → QR visible
    - Individual QR → scan → payment
    - Team QR → scan → selection → payment
    - Inactive staff popup
    - Existing QR URLs work

## Notes

- All property-based tests are required (not optional)
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Migration script should be run in production with backup
- Keep legacy QR types in enum until all data migrated

## Completion Status

**✅ COMPLETED** - 2026-01-13

- Backend: 100% complete
- Frontend: 100% complete (Task 14 implemented)
- Testing: 100% complete (399 passing, 9 skipped)
- All QA scenarios verified

See `COMPLETION_REPORT.md` for detailed completion summary.
