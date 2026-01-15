# Implementation Plan: Venue Login UI Unification

## Overview

This implementation plan focuses on unifying the venue login page UI with the registration page by updating i18n translations and removing hardcoded text. The changes are minimal and purely visual - no authentication logic will be modified.

## Tasks

- [x] 1. Update i18n translation files
  - Add `newToTipsio` and `createAccount` keys to all three language files (en.json, ru.json, id.json)
  - English: "New to Tipsio?" and "Create account"
  - Russian: "Впервые пользуетесь Tipsio?" and "Создайте аккаунт"
  - Indonesian: "Baru menggunakan Tipsio?" and "Buat akun"
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 1.1 Write unit tests for i18n text examples
  - Test that Russian displays correct text
  - Test that English displays correct text
  - Test that Indonesian displays correct text
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 2. Update login page component
  - [x] 2.1 Replace hardcoded "Don't have an account?" text with i18n key
    - Change hardcoded string to `{t('newToTipsio')}`
    - Ensure proper spacing between text and link
    - _Requirements: 3.5_

  - [x] 2.2 Update registration link text to use new i18n key
    - Change `{t('register')}` to `{t('createAccount')}` for consistency
    - Verify link href remains `/venue/register`
    - _Requirements: 6.1, 6.3_

- [x] 2.3 Write property test for i18n text retrieval
  - **Property 1: i18n Text Retrieval**
  - **Validates: Requirements 3.5**
  - Test that component uses i18n for all text (no hardcoded strings)
  - _Requirements: 3.5_

- [x] 2.4 Write property test for language switching
  - **Property 2: Language Switching Updates Text**
  - **Validates: Requirements 3.4**
  - Test that switching languages updates all text immediately
  - _Requirements: 3.4_

- [x] 3. Checkpoint - Verify i18n and visual consistency
  - Ensure all tests pass
  - Manually verify text displays correctly in all three languages
  - Visually compare login page to registration page
  - Ask the user if questions arise

- [x] 4. Write property test for form validation preservation
  - **Property 3: Form Validation Preservation**
  - **Validates: Requirements 5.4**
  - Test that validation rules (email format, password required) work correctly
  - _Requirements: 5.4_

- [x] 5. Write property test for registration link functionality
  - **Property 4: Registration Link Functionality**
  - **Validates: Requirements 6.3**
  - Test that registration link navigates to correct route in all languages
  - _Requirements: 6.3_

- [x] 6. Write property test for i18n key resolution
  - **Property 5: i18n Key Resolution**
  - **Validates: Requirements 8.4**
  - Test that all i18n keys resolve to non-empty strings in all languages
  - _Requirements: 8.4_

- [x] 7. Write integration tests for authentication flow
  - Test successful login redirects to dashboard
  - Test failed login displays error message
  - Test registration link navigation
  - _Requirements: 5.1, 5.2, 5.3, 6.1_

- [x] 8. Final checkpoint - Complete verification
  - Run all tests and ensure they pass
  - Verify no console errors on page load
  - Test language switching in browser
  - Verify authentication flow works correctly
  - Ask the user if questions arise

## Notes

- All tasks are required for comprehensive implementation
- All changes are purely visual - authentication logic must not be modified
- The login page structure already matches the registration page
- Only i18n text updates are required
- Manual QA should verify visual consistency across all screen sizes (375px, 768px, 1440px)
