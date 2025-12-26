# Implementation Plan

- [x] 1. Extend locale configuration
  - [x] 1.1 Update `i18n/request.ts` to add 'id' locale
    - Add 'id' to locales array
    - Update Locale type to include 'id'
    - Ensure Accept-Language parsing handles 'id' and 'id-ID'
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 1.2 Write property test for locale selection determinism
    - **Property 5: Locale Selection Determinism**
    - **Validates: Requirements 2.2**
  - [x] 1.3 Write property test for cookie persistence round-trip
    - **Property 6: Cookie Persistence Round-Trip**
    - **Validates: Requirements 3.2**

- [x] 2. Create Indonesian translation dictionary
  - [x] 2.1 Create `messages/id.json` with complete translations
    - Copy structure from `en.json`
    - Translate all keys to Indonesian (Bahasa Indonesia)
    - Use Bali-specific context where appropriate
    - Ensure all interpolation variables are preserved
    - _Requirements: 1.1, 1.2_
  - [x] 2.2 Write property test for dictionary key completeness
    - **Property 1: Dictionary Key Completeness**
    - **Validates: Requirements 1.1**
  - [x] 2.3 Write property test for JSON validity
    - **Property 8: JSON Validity**
    - **Validates: Requirements 4.4**
  - [x] 2.4 Write property test for namespace structure validity
    - **Property 11: Namespace Structure Validity**
    - **Validates: Requirements 7.2**
  - [x] 2.5 Write property test for interpolation syntax consistency
    - **Property 12: Interpolation Syntax Consistency**
    - **Validates: Requirements 7.3**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement translation validation utilities
  - [x] 4.1 Create `scripts/validate-translations.ts`
    - Implement function to extract all keys from dictionary
    - Implement function to compare keys between dictionaries
    - Report missing and extra keys
    - Exit with error code if validation fails
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 4.2 Write property test for missing key detection accuracy
    - **Property 7: Missing Key Detection Accuracy**
    - **Validates: Requirements 4.1, 4.2**
  - [x] 4.3 Write property test for fallback translation consistency
    - **Property 2: Fallback Translation Consistency**
    - **Validates: Requirements 1.3, 4.3**

- [x] 5. Implement Indonesian date/number formatting utilities
  - [x] 5.1 Create `src/lib/i18n/formatters.ts`
    - Implement `formatDateIndonesian(date: Date): string`
    - Implement `formatCurrencyIDR(amount: number): string`
    - Implement `formatTimeIndonesian(date: Date): string`
    - Implement `formatNumberIndonesian(num: number): string`
    - _Requirements: 1.4, 1.5, 6.1, 6.2, 6.3_
  - [x] 5.2 Write property test for currency prefix formatting
    - **Property 3: Currency Prefix Formatting**
    - **Validates: Requirements 1.4**
  - [x] 5.3 Write property test for Indonesian date formatting
    - **Property 4: Indonesian Date Formatting**
    - **Validates: Requirements 1.5**
  - [x] 5.4 Write property test for thousand separator formatting
    - **Property 9: Thousand Separator Formatting**
    - **Validates: Requirements 6.2**
  - [x] 5.5 Write property test for time format consistency
    - **Property 10: Time Format Consistency**
    - **Validates: Requirements 6.3**

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Update language switcher component
  - [x] 7.1 Find and update existing language switcher
    - Add Indonesian option to switcher
    - Update locale names mapping
    - Ensure cookie is set on language change
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x] 7.2 Write unit tests for language switcher
    - Test renders all three language options
    - Test locale change triggers cookie update
    - _Requirements: 3.1, 3.2_

- [x] 8. Audit and fix hardcoded strings
  - [x] 8.1 Search for hardcoded strings in components
    - Scan `src/app` and `src/components` for hardcoded text
    - Create list of files with hardcoded strings
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 8.2 Replace hardcoded strings with translation keys
    - Add missing keys to all three dictionaries
    - Update components to use `useTranslations` hook
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 9. Add npm script for translation validation
  - [x] 9.1 Update `package.json` with validation script
    - Add `"i18n:validate": "npx tsx scripts/validate-translations.ts"`
    - _Requirements: 4.1, 4.2_

- [x] 10. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
