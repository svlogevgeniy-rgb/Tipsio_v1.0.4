# Requirements Document

## Introduction

Данная спецификация описывает расширение системы интернационализации (i18n) приложения TIPSIO для поддержки индонезийского языка (Bahasa Indonesia) с фокусом на рынок Бали. Проект уже использует `next-intl` с поддержкой русского и английского языков. Цель — добавить третий язык, обеспечить консистентность переводов, улучшить механизм определения языка и гарантировать отсутствие хардкода текстов в UI.

## Glossary

- **i18n**: Internationalization — процесс адаптации приложения для поддержки нескольких языков
- **Locale**: Идентификатор языка/региона (ru, en, id)
- **Translation Dictionary**: JSON-файл со всеми переводами для конкретного языка
- **Fallback Chain**: Цепочка резервных языков при отсутствии перевода
- **next-intl**: Библиотека интернационализации для Next.js
- **Bali-first**: Приоритет индонезийского контекста с учётом специфики Бали
- **Interpolation**: Подстановка динамических значений в строки перевода
- **Missing Key**: Ключ перевода, отсутствующий в словаре

## Requirements

### Requirement 1: Indonesian Language Dictionary

**User Story:** As a venue owner or guest in Bali, I want to use the application in Indonesian (Bahasa Indonesia), so that I can interact with the system in my preferred language.

#### Acceptance Criteria

1. WHEN the system loads translations THEN the system SHALL provide a complete Indonesian dictionary (`id.json`) with all keys present in English and Russian dictionaries
2. WHEN displaying Indonesian text THEN the system SHALL use culturally appropriate translations with Bali-specific context where relevant
3. WHEN a translation key exists in English but not in Indonesian THEN the system SHALL fall back to English translation
4. WHEN formatting currency in Indonesian locale THEN the system SHALL display amounts in IDR format with "Rp" prefix
5. WHEN formatting dates in Indonesian locale THEN the system SHALL use Indonesian date format (e.g., "Jumat, 6 Desember")

### Requirement 2: Locale Configuration Extension

**User Story:** As a system administrator, I want the i18n configuration to support three languages, so that users can switch between Russian, English, and Indonesian.

#### Acceptance Criteria

1. WHEN the application initializes THEN the system SHALL recognize 'id' as a valid locale alongside 'en' and 'ru'
2. WHEN a locale is not explicitly set THEN the system SHALL use the fallback chain: user preference → cookie → Accept-Language header → default locale (en)
3. WHEN the Accept-Language header contains 'id' or 'id-ID' THEN the system SHALL select Indonesian locale
4. WHEN exporting locale configuration THEN the system SHALL provide type-safe locale definitions including 'id'

### Requirement 3: Language Switcher Enhancement

**User Story:** As a user, I want to switch between Russian, English, and Indonesian languages, so that I can use the application in my preferred language.

#### Acceptance Criteria

1. WHEN a user views the language switcher THEN the system SHALL display all three language options (Русский, English, Bahasa Indonesia)
2. WHEN a user selects a language THEN the system SHALL persist the selection in a cookie named 'NEXT_LOCALE'
3. WHEN a user changes language THEN the system SHALL immediately update all visible text without page reload
4. WHEN the page loads THEN the system SHALL display content in the previously selected language without visual flickering

### Requirement 4: Translation Completeness Validation

**User Story:** As a developer, I want to validate that all translation keys are present in all languages, so that users never see missing translations.

#### Acceptance Criteria

1. WHEN running translation validation THEN the system SHALL report any keys missing from Indonesian dictionary compared to English
2. WHEN running translation validation THEN the system SHALL report any keys missing from Russian dictionary compared to English
3. WHEN a missing key is detected at runtime THEN the system SHALL log a warning and display the fallback translation
4. WHEN building the application THEN the system SHALL complete successfully with all translation files valid JSON

### Requirement 5: Hardcoded Text Elimination

**User Story:** As a developer, I want all user-facing text to use translation keys, so that the application is fully internationalized.

#### Acceptance Criteria

1. WHEN rendering any user-facing component THEN the system SHALL use translation keys instead of hardcoded strings
2. WHEN an error message is displayed THEN the system SHALL use a translation key from the appropriate namespace
3. WHEN a form label or placeholder is rendered THEN the system SHALL use translation keys
4. WHEN a button or link text is displayed THEN the system SHALL use translation keys

### Requirement 6: Date and Number Formatting

**User Story:** As a user viewing the application in Indonesian, I want dates and numbers formatted according to Indonesian conventions, so that the information is easy to understand.

#### Acceptance Criteria

1. WHEN displaying a date in Indonesian locale THEN the system SHALL format it using Indonesian day and month names
2. WHEN displaying currency amounts THEN the system SHALL use locale-appropriate thousand separators (Indonesian uses "." as thousand separator)
3. WHEN displaying time THEN the system SHALL use 24-hour format for Indonesian locale

### Requirement 7: Translation Key Structure

**User Story:** As a developer, I want a consistent naming convention for translation keys, so that translations are organized and maintainable.

#### Acceptance Criteria

1. WHEN adding new translation keys THEN the system SHALL follow the namespace pattern: `{feature}.{component}.{element}`
2. WHEN organizing translations THEN the system SHALL group keys by feature: common, auth, guest, staff, venue, landing, landingV3, errors
3. WHEN a key contains interpolation THEN the system SHALL use curly brace syntax: `{variableName}`
