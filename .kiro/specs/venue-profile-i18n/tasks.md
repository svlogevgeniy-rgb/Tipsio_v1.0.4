# Implementation Plan: Venue Profile Internationalization

## Overview

This plan adds internationalization support to the venue profile page, enabling English, Indonesian, and Russian language support.

## Tasks

- [x] 1. Add translation keys to translation files
  - [x] 1.1 Add English translations to messages/en.json
    - Add all profile page keys under venue.profile
    - Include labels, buttons, placeholders, messages, validation
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 1.2 Add Indonesian translations to messages/id.json
    - Add all profile page keys under venue.profile
    - Translate all strings to Indonesian
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.3 Add Russian translations to messages/ru.json
    - Add all profile page keys under venue.profile
    - Use existing Russian text from current implementation
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Update profile page component
  - [x] 2.1 Import and initialize useTranslations hook
    - Import useTranslations from next-intl
    - Initialize with const t = useTranslations('venue.profile')
    - _Requirements: 1.1, 1.2_

  - [x] 2.2 Replace page headers and descriptions
    - Replace "Профиль" with t('title')
    - Replace description text with t('description')
    - _Requirements: 2.1, 2.2_

  - [x] 2.3 Replace form labels
    - Replace "Логотип компании" with t('companyLogo')
    - Replace "Название компании" with t('companyName')
    - Replace "Электронная почта" with t('email')
    - Replace "Номер телефона" with t('phone')
    - Replace "Новый пароль" with t('password')
    - Replace "Подтвердите пароль" with t('confirmPassword')
    - _Requirements: 2.3_

  - [x] 2.4 Replace button labels
    - Replace "Сохранить" with t('save')
    - Replace "Загрузить логотип" with t('uploadLogo')
    - Replace "Изменить логотип" with t('changeLogo')
    - Replace "Сохранение..." with t('saving')
    - Replace "Загрузка изображения..." with t('uploading')
    - _Requirements: 2.4_

  - [x] 2.5 Replace placeholder text
    - Replace "Введите название компании" with t('companyNamePlaceholder')
    - Replace "admin@example.com" with t('emailPlaceholder')
    - Keep "+62 812-3456-7890" (Indonesian format)
    - Replace password placeholders with t('passwordPlaceholder') and t('confirmPasswordPlaceholder')
    - Replace logo helper text with t('logoHelper')
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 2.6 Update validation schema with translations
    - Move profileSchema inside component
    - Use useMemo to memoize schema
    - Replace validation messages with t('validation.*') calls
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 2.7 Replace toast notification messages
    - Replace success message with t('success')
    - Replace error messages with t('error')
    - Replace upload error with t('uploadError')
    - Replace file validation errors with t('validation.fileType') and t('validation.fileSize')
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 3. Test language switching
  - Test switching to English - verify all text updates
  - Test switching to Indonesian - verify all text updates
  - Test switching to Russian - verify all text updates
  - Test form validation in each language
  - Test toast messages in each language
  - Verify language persists across page reloads

## Implementation Complete

All tasks have been completed successfully:

1. ✅ Translation keys added to all three language files (en.json, id.json, ru.json)
2. ✅ Profile page component updated with useTranslations hook
3. ✅ All hardcoded text replaced with translation calls
4. ✅ Validation schema moved inside component with useMemo
5. ✅ All validation messages use translations
6. ✅ All toast notifications use translations
7. ✅ TypeScript diagnostics pass with no errors
8. ✅ JSON files validated successfully

## Notes

- All translations are nested under `venue.profile` key
- Phone placeholder remains "+62 812-3456-7890" in all languages (Indonesian format)
- Validation schema is memoized with useMemo to prevent unnecessary recreation
- Existing Russian text was reused for ru.json translations
