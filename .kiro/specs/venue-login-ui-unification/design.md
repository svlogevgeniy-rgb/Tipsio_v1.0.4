# Design Document: Venue Login UI Unification

## Overview

This design document outlines the approach for unifying the venue login page UI with the existing venue registration page, while preserving all authentication logic. The work is purely visual - updating components, layout, and i18n texts without touching NextAuth flows, redirects, or API calls.

The current login page (`/venue/login`) uses shadcn/ui components but has a different visual structure than the registration page (`/venue/register`). We will align the login page to match the registration page's visual patterns while fixing hardcoded i18n text.

## Architecture

### Component Structure

Both pages follow a similar high-level structure:
- Full-screen container with aurora background
- Fixed language switcher in top-right
- Centered Card component with form
- Glass effect styling

The login page will adopt the exact same structure as the registration page to ensure visual consistency.

### File Organization

```
src/
├── app/
│   └── venue/
│       ├── login/
│       │   └── page.tsx          # Login page (to be updated)
│       └── register/
│           └── page.tsx          # Registration page (reference)
├── components/
│   └── ui/
│       ├── button.tsx            # shadcn Button
│       ├── card.tsx              # shadcn Card
│       ├── input.tsx             # shadcn Input
│       ├── label.tsx             # shadcn Label
│       └── language-switcher.tsx # Language switcher
└── messages/
    ├── en.json                   # English translations
    ├── ru.json                   # Russian translations
    └── id.json                   # Indonesian translations
```

## Components and Interfaces

### Existing Components (No Changes)

All shadcn/ui components remain unchanged:
- `Button` - Used for submit button and links
- `Card`, `CardContent`, `CardDescription`, `CardHeader`, `CardTitle` - Form container
- `Input` - Form inputs
- `Label` - Form labels
- `LanguageSwitcher` - Language selection

### Page Component Updates

**Current Login Page Structure:**
```typescript
<main className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
  {/* Aurora Background */}
  <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]" />
  </div>

  {/* Language Switcher */}
  <div className="fixed top-4 right-4 z-50">
    <LanguageSwitcher />
  </div>

  <Card className="glass w-full max-w-md">
    {/* Form content */}
  </Card>
</main>
```

This structure is already identical to the registration page, so no structural changes are needed.

### Typography Alignment

**Registration Page Typography:**
- Title: `text-2xl font-heading text-gradient`
- Description: Default CardDescription styling

**Login Page Typography:**
- Title: `text-2xl font-heading text-gradient` ✓ (already matches)
- Description: Default CardDescription styling ✓ (already matches)

Typography is already aligned.

### Form Component Alignment

**Registration Page Form Elements:**
- Input height: `h-12` (not explicitly set, uses default)
- Button height: `h-14 text-lg font-heading font-bold`
- Button gradient: `bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500`

**Login Page Form Elements:**
- Input height: `h-12` ✓ (already matches)
- Button height: `h-14 text-lg font-heading font-bold` ✓ (already matches)
- Button gradient: `bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500` ✓ (already matches)

Form elements are already aligned.

### Registration Prompt Component

**Current Implementation (Hardcoded):**
```typescript
<p className="text-center text-sm text-muted-foreground">
  Don&apos;t have an account?{" "}
  <Link href="/venue/register" className="text-primary hover:underline">
    {t('register')}
  </Link>
</p>
```

**Target Implementation (i18n):**
```typescript
<p className="text-center text-sm text-muted-foreground">
  {t('newToTipsio')}{" "}
  <Link href="/venue/register" className="text-primary hover:underline">
    {t('createAccount')}
  </Link>
</p>
```

## Data Models

### i18n Translation Keys

**New Keys to Add:**

```typescript
// messages/en.json
{
  "venue": {
    "login": {
      // ... existing keys
      "newToTipsio": "New to Tipsio?",
      "createAccount": "Create account"
    }
  }
}

// messages/ru.json
{
  "venue": {
    "login": {
      // ... existing keys
      "newToTipsio": "Впервые пользуетесь Tipsio?",
      "createAccount": "Создайте аккаунт"
    }
  }
}

// messages/id.json
{
  "venue": {
    "login": {
      // ... existing keys
      "newToTipsio": "Baru menggunakan Tipsio?",
      "createAccount": "Buat akun"
    }
  }
}
```

### Form Data Models

No changes to form data models. Existing Zod schemas remain:

```typescript
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: i18n Text Retrieval

*For any* supported language (RU, EN, ID), when the login page renders, all text content should be retrieved from i18n dictionaries without hardcoded strings in the component.

**Validates: Requirements 3.5**

### Property 2: Language Switching Updates Text

*For any* language switch action, all i18n text on the page should update immediately to reflect the new language.

**Validates: Requirements 3.4**

### Property 3: Form Validation Preservation

*For any* form input values, the validation rules (email format, password required) should produce the same validation results as before UI changes.

**Validates: Requirements 5.4**

### Property 4: Registration Link Functionality

*For any* language setting, the registration link should navigate to `/venue/register` route.

**Validates: Requirements 6.3**

### Property 5: i18n Key Resolution

*For any* supported language, all i18n keys used in the login page should resolve to non-empty strings.

**Validates: Requirements 8.4**

## Error Handling

### Existing Error Handling (Preserved)

The login page already has comprehensive error handling that must be preserved:

1. **Form Validation Errors:**
   - Email format validation via Zod
   - Password required validation via Zod
   - Displayed inline under each field

2. **Authentication Errors:**
   - Invalid credentials error from NextAuth
   - Network/server errors
   - Displayed in error banner above form

3. **Loading States:**
   - Button disabled during submission
   - Loading text displayed

**No changes to error handling logic.** Only visual presentation must match registration page styling.

### i18n Error Handling

**Missing Translation Keys:**
- If an i18n key is missing, the key name will be displayed
- This is handled by the i18n library automatically
- No custom error handling needed

**Language Switching Errors:**
- Language switcher component handles errors internally
- No additional error handling needed in login page

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

1. **Component Rendering:**
   - Login page renders without errors
   - All shadcn components are present (Card, Input, Label, Button)
   - Language switcher is rendered

2. **i18n Text Examples:**
   - Russian text displays "Впервые пользуетесь Tipsio? Создайте аккаунт"
   - English text displays "New to Tipsio? Create account"
   - Indonesian text displays "Baru menggunakan Tipsio? Buat akun"

3. **Form Behavior:**
   - Form submission calls signIn with correct credentials
   - Successful auth redirects to `/venue/dashboard`
   - Failed auth displays error message

4. **Navigation:**
   - Registration link navigates to `/venue/register`

### Property-Based Tests

Property-based tests will verify universal properties across all inputs. Each test should run a minimum of 100 iterations.

1. **Property 1: i18n Text Retrieval**
   - **Feature: venue-login-ui-unification, Property 1: For any supported language, all text should come from i18n**
   - Generate: Random language selection (RU, EN, ID)
   - Test: Component uses `t()` function for all text, no hardcoded strings
   - Verify: No hardcoded text strings in rendered output

2. **Property 2: Language Switching Updates Text**
   - **Feature: venue-login-ui-unification, Property 2: For any language switch, text updates immediately**
   - Generate: Random sequence of language switches
   - Test: Switch language and check text updates
   - Verify: All text reflects current language

3. **Property 3: Form Validation Preservation**
   - **Feature: venue-login-ui-unification, Property 3: For any input, validation rules are preserved**
   - Generate: Random email and password combinations (valid/invalid)
   - Test: Submit form with generated values
   - Verify: Validation results match expected behavior (email format, password required)

4. **Property 4: Registration Link Functionality**
   - **Feature: venue-login-ui-unification, Property 4: For any language, registration link works**
   - Generate: Random language selection
   - Test: Click registration link
   - Verify: Navigation to `/venue/register` occurs

5. **Property 5: i18n Key Resolution**
   - **Feature: venue-login-ui-unification, Property 5: For any language, all keys resolve to non-empty strings**
   - Generate: All supported languages
   - Test: Render page in each language
   - Verify: No i18n keys are displayed as raw key names (e.g., "venue.login.title")

### Visual Regression Testing

While not automated in this spec, manual QA should verify:
- Login page visually matches registration page on desktop (1440px)
- Login page visually matches registration page on tablet (768px)
- Login page visually matches registration page on mobile (375px)
- Typography, spacing, colors, and effects are identical

### Integration Tests

Integration tests will verify the complete authentication flow:

1. **Successful Login Flow:**
   - Enter valid credentials
   - Submit form
   - Verify redirect to dashboard
   - Verify no console errors

2. **Failed Login Flow:**
   - Enter invalid credentials
   - Submit form
   - Verify error message displayed
   - Verify no redirect occurs

3. **Registration Flow:**
   - Click registration link
   - Verify navigation to registration page

## Implementation Notes

### Changes Required

1. **Update i18n dictionaries** (messages/en.json, messages/ru.json, messages/id.json):
   - Add `newToTipsio` key with specified translations
   - Add `createAccount` key with specified translations

2. **Update login page component** (src/app/venue/login/page.tsx):
   - Replace hardcoded "Don't have an account?" with `{t('newToTipsio')}`
   - Replace `{t('register')}` with `{t('createAccount')}` for consistency

### No Changes Required

1. **Component structure** - Already matches registration page
2. **Typography** - Already matches registration page
3. **Form elements** - Already matches registration page
4. **Authentication logic** - Must be preserved exactly
5. **shadcn/ui components** - No modifications needed

### Testing Approach

1. **Before changes:** Run existing tests to establish baseline
2. **After changes:** Run all tests to verify no regressions
3. **Visual QA:** Manual comparison of login vs registration pages
4. **i18n QA:** Test all three languages (RU, EN, ID)

## Summary

This is a minimal-change design focused on:
1. Adding two i18n keys to three language files
2. Updating two text strings in the login page component
3. Verifying visual consistency through testing

The login page already uses the correct structure, components, and styling. The only changes are removing hardcoded text and adding proper i18n support for the registration prompt.
