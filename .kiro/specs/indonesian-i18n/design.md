# Design Document: Indonesian i18n Support

## Overview

Данный документ описывает архитектуру и дизайн расширения системы интернационализации TIPSIO для поддержки индонезийского языка (Bahasa Indonesia). Проект использует `next-intl` v4.5.8 с существующей поддержкой русского и английского языков.

### Текущее состояние
- Библиотека: `next-intl` v4.5.8
- Существующие локали: `en`, `ru`
- Словари: `messages/en.json`, `messages/ru.json` (~850 строк каждый)
- Конфигурация: `i18n/request.ts`
- Fallback: cookie → Accept-Language → default (en)

### Целевое состояние
- Локали: `en`, `ru`, `id`
- Новый словарь: `messages/id.json`
- Улучшенная fallback-цепочка с поддержкой `id`
- Валидация полноты переводов
- Форматирование дат/чисел по индонезийским стандартам

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Application                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   en.json    │    │   ru.json    │    │   id.json    │  │
│  │  (English)   │    │  (Russian)   │    │ (Indonesian) │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                   │                   │           │
│         └───────────────────┼───────────────────┘           │
│                             │                               │
│                    ┌────────▼────────┐                      │
│                    │  i18n/request.ts │                      │
│                    │  (Locale Config) │                      │
│                    └────────┬────────┘                      │
│                             │                               │
│         ┌───────────────────┼───────────────────┐           │
│         │                   │                   │           │
│  ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐    │
│  │   Cookie    │    │  Accept-    │    │   Default   │    │
│  │ NEXT_LOCALE │    │  Language   │    │    (en)     │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
│                                                              │
│                    ┌────────────────┐                       │
│                    │ useTranslations│                       │
│                    │     Hook       │                       │
│                    └────────┬───────┘                       │
│                             │                               │
│                    ┌────────▼────────┐                      │
│                    │   Components    │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

### Fallback Chain

```
User Request
     │
     ▼
┌─────────────────┐
│ Cookie Check    │──── Found ────► Use cookie locale
│ (NEXT_LOCALE)   │
└────────┬────────┘
         │ Not found
         ▼
┌─────────────────┐
│ Accept-Language │──── Match ────► Use matched locale
│ Header Parse    │     (en/ru/id)
└────────┬────────┘
         │ No match
         ▼
┌─────────────────┐
│ Default Locale  │────────────────► Use 'en'
│     (en)        │
└─────────────────┘
```

## Components and Interfaces

### 1. Locale Configuration (`i18n/request.ts`)

```typescript
// Расширенная конфигурация локалей
export const locales = ['en', 'ru', 'id'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

// Fallback mapping для отсутствующих переводов
export const localeFallbacks: Record<Locale, Locale[]> = {
  en: [],
  ru: ['en'],
  id: ['en']
};
```

### 2. Translation Dictionary Structure

```typescript
interface TranslationDictionary {
  landingV3: LandingV3Translations;
  landing: LandingTranslations;
  common: CommonTranslations;
  currency: CurrencyTranslations;
  guest: GuestTranslations;
  staff: StaffTranslations;
  venue: VenueTranslations;
  errors?: ErrorTranslations;
}
```

### 3. Language Switcher Component

```typescript
interface LanguageSwitcherProps {
  currentLocale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

const localeNames: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  id: 'Bahasa Indonesia'
};
```

### 4. Validation Script Interface

```typescript
interface ValidationResult {
  isValid: boolean;
  missingKeys: {
    locale: Locale;
    keys: string[];
  }[];
  extraKeys: {
    locale: Locale;
    keys: string[];
  }[];
}

function validateTranslations(
  reference: TranslationDictionary,
  target: TranslationDictionary,
  targetLocale: Locale
): ValidationResult;
```

## Data Models

### Translation Key Structure

```
{namespace}.{component}.{element}

Examples:
- common.loading
- guest.tip.title
- venue.dashboard.totalTips
- landingV3.hero.badge
- errors.payment.failed
```

### Locale Cookie

```
Name: NEXT_LOCALE
Value: 'en' | 'ru' | 'id'
Path: /
SameSite: Lax
Max-Age: 31536000 (1 year)
```

### Indonesian Date/Number Formats

```typescript
// Date formatting
const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const indonesianMonths = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// Number formatting
// Indonesian uses "." as thousand separator and "," as decimal separator
// Example: 1.000.000,50 (one million and fifty cents)

// Currency formatting
// Format: Rp {amount}
// Example: Rp 50.000
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Dictionary Key Completeness
*For any* translation key that exists in the English dictionary, that same key SHALL exist in the Indonesian dictionary.
**Validates: Requirements 1.1**

### Property 2: Fallback Translation Consistency
*For any* translation key that is missing from a non-default locale dictionary, requesting that key SHALL return the English (default) translation instead of undefined or an error.
**Validates: Requirements 1.3, 4.3**

### Property 3: Currency Prefix Formatting
*For any* numeric amount formatted as currency in Indonesian locale, the resulting string SHALL contain the "Rp" prefix.
**Validates: Requirements 1.4**

### Property 4: Indonesian Date Formatting
*For any* date formatted in Indonesian locale, the resulting string SHALL contain valid Indonesian day names (Senin-Minggu) and month names (Januari-Desember).
**Validates: Requirements 1.5**

### Property 5: Locale Selection Determinism
*For any* combination of cookie value, Accept-Language header, and default locale, the locale selection function SHALL return exactly one valid locale from the supported set {en, ru, id}.
**Validates: Requirements 2.2**

### Property 6: Cookie Persistence Round-Trip
*For any* locale selected by the user, setting and then reading the NEXT_LOCALE cookie SHALL return the same locale value.
**Validates: Requirements 3.2**

### Property 7: Missing Key Detection Accuracy
*For any* pair of translation dictionaries where the target is missing keys present in the reference, the validation function SHALL report exactly those missing keys.
**Validates: Requirements 4.1, 4.2**

### Property 8: JSON Validity
*For any* translation dictionary file, parsing it as JSON SHALL succeed without errors.
**Validates: Requirements 4.4**

### Property 9: Thousand Separator Formatting
*For any* number >= 1000 formatted in Indonesian locale, the resulting string SHALL use "." as the thousand separator.
**Validates: Requirements 6.2**

### Property 10: Time Format Consistency
*For any* time value formatted in Indonesian locale, the resulting string SHALL use 24-hour format (00:00-23:59).
**Validates: Requirements 6.3**

### Property 11: Namespace Structure Validity
*For any* top-level key in a translation dictionary, that key SHALL be one of the defined namespaces: common, currency, guest, staff, venue, landing, landingV3, errors.
**Validates: Requirements 7.2**

### Property 12: Interpolation Syntax Consistency
*For any* translation value containing variable placeholders, those placeholders SHALL use curly brace syntax `{variableName}`.
**Validates: Requirements 7.3**

## Error Handling

### Missing Translation Key
- Log warning to console in development
- Return fallback translation (English)
- Never show raw key to user

### Invalid Locale Cookie
- Ignore invalid value
- Fall back to Accept-Language or default

### Malformed Accept-Language Header
- Parse what's possible
- Fall back to default locale

### JSON Parse Error in Dictionary
- Fail build with clear error message
- Prevent deployment with broken translations

## Testing Strategy

### Property-Based Testing Library
- **Library**: `fast-check` (already in devDependencies)
- **Minimum iterations**: 100 per property test

### Unit Tests
- Locale configuration exports correct values
- Language switcher renders all options
- Cookie utility functions work correctly

### Property-Based Tests
Each correctness property will be implemented as a property-based test using `fast-check`:

1. **Dictionary Completeness Test**: Generate random key paths, verify existence in all dictionaries
2. **Fallback Test**: Generate missing keys, verify fallback returns English
3. **Currency Formatting Test**: Generate random amounts, verify "Rp" prefix
4. **Date Formatting Test**: Generate random dates, verify Indonesian names
5. **Locale Selection Test**: Generate all input combinations, verify deterministic output
6. **Cookie Round-Trip Test**: Generate locale values, verify persistence
7. **Missing Key Detection Test**: Generate dictionaries with missing keys, verify detection
8. **JSON Validity Test**: Verify all dictionary files parse successfully
9. **Thousand Separator Test**: Generate large numbers, verify "." separator
10. **Time Format Test**: Generate times, verify 24-hour format
11. **Namespace Test**: Verify all top-level keys match expected namespaces
12. **Interpolation Test**: Scan values, verify `{var}` syntax

### Test Annotation Format
Each property-based test MUST include a comment:
```typescript
/**
 * Feature: indonesian-i18n, Property 1: Dictionary Key Completeness
 * Validates: Requirements 1.1
 */
```

### Integration Tests
- Full page render in each locale
- Language switching flow
- Date/currency display in context
