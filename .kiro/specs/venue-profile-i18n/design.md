# Design Document: Venue Profile Internationalization

## Overview

This design implements internationalization (i18n) for the venue profile page by integrating the existing translation system, adding translation keys for all UI text, and ensuring proper language switching functionality.

## Architecture

The solution involves:
1. **Translation Files**: Add keys to existing `messages/*.json` files
2. **Profile Component**: Integrate `useTranslations` hook
3. **Text Replacement**: Replace all hardcoded Russian text with translation calls

## Components and Interfaces

### Translation Keys Structure

All profile translations will be nested under `venue.profile`:

```typescript
{
  "venue": {
    "profile": {
      // Page headers
      "title": string,
      "description": string,
      
      // Form labels
      "companyLogo": string,
      "companyName": string,
      "email": string,
      "phone": string,
      "password": string,
      "confirmPassword": string,
      
      // Buttons
      "save": string,
      "uploadLogo": string,
      "changeLogo": string,
      
      // Placeholders
      "companyNamePlaceholder": string,
      "emailPlaceholder": string,
      "phonePlaceholder": string,
      "passwordPlaceholder": string,
      "confirmPasswordPlaceholder": string,
      
      // Helper text
      "logoHelper": string,
      
      // Messages
      "success": string,
      "error": string,
      "uploadError": string,
      "saving": string,
      "uploading": string,
      
      // Validation
      "validation": {
        "companyNameMin": string,
        "emailInvalid": string,
        "passwordMin": string,
        "passwordMismatch": string,
        "fileType": string,
        "fileSize": string
      }
    }
  }
}
```

### Profile Component Changes

**Location**: `src/app/venue/(dashboard)/profile/page.tsx`

**Changes**:
1. Import `useTranslations` hook
2. Initialize translation function: `const t = useTranslations('venue.profile')`
3. Replace all hardcoded text with `t('key')` calls
4. Update validation schema to use translated messages
5. Update toast messages to use translations

**Example**:
```typescript
// Before
<h1 className="text-2xl font-heading font-bold">Профиль</h1>

// After
<h1 className="text-2xl font-heading font-bold">{t('title')}</h1>
```

## Data Models

No database changes required. This is purely a frontend internationalization task.

## Implementation Details

### 1. Translation Files

**English (messages/en.json)**:
```json
{
  "venue": {
    "profile": {
      "title": "Profile",
      "description": "Manage your profile information and credentials",
      "companyLogo": "Company Logo",
      "companyName": "Company Name",
      "email": "Email",
      "phone": "Phone Number",
      "password": "New Password",
      "confirmPassword": "Confirm Password",
      "save": "Save",
      "uploadLogo": "Upload Logo",
      "changeLogo": "Change Logo",
      "companyNamePlaceholder": "Enter company name",
      "emailPlaceholder": "admin@example.com",
      "phonePlaceholder": "+62 812-3456-7890",
      "passwordPlaceholder": "Leave empty if you don't want to change",
      "confirmPasswordPlaceholder": "Repeat new password",
      "logoHelper": "JPG or PNG, square photo 1:1, maximum 5MB",
      "success": "Profile updated successfully",
      "error": "Failed to update profile",
      "uploadError": "Failed to upload image",
      "saving": "Saving...",
      "uploading": "Uploading image...",
      "validation": {
        "companyNameMin": "Company name must be at least 2 characters",
        "emailInvalid": "Invalid email format",
        "passwordMin": "Password must be at least 6 characters",
        "passwordMismatch": "Passwords do not match",
        "fileType": "Only JPG or PNG files allowed",
        "fileSize": "File too large. Maximum 5MB"
      }
    }
  }
}
```

**Indonesian (messages/id.json)**: Similar structure with Indonesian translations

**Russian (messages/ru.json)**: Keep existing Russian text

### 2. Component Integration

```typescript
import { useTranslations } from '@/i18n/client'

export default function VenueProfilePage() {
  const t = useTranslations('venue.profile')
  
  // Use translations throughout component
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      {/* ... */}
    </div>
  )
}
```

### 3. Validation Schema Updates

```typescript
const profileSchema = z.object({
  companyName: z.string().min(2, t('validation.companyNameMin')),
  email: z.string().email(t('validation.emailInvalid')),
  // ...
})
```

**Note**: Zod schemas are defined outside component, so we'll need to handle validation messages differently - either move schema inside component or handle error message translation in the error display logic.

## Testing Strategy

### Manual Testing
- Switch to English - verify all text is in English
- Switch to Indonesian - verify all text is in Indonesian
- Switch to Russian - verify all text is in Russian
- Submit form with errors - verify error messages are translated
- Upload invalid file - verify error message is translated
- Successfully save profile - verify success message is translated

### Edge Cases
- Missing translation keys should fall back to English
- Language preference should persist across page reloads
- Validation messages should update when language changes

## Implementation Notes

### Validation Message Translation Challenge

Zod schemas are typically defined outside components, but `useTranslations` hook can only be used inside components. Two approaches:

**Approach 1**: Move schema inside component (recommended)
```typescript
export default function VenueProfilePage() {
  const t = useTranslations('venue.profile')
  
  const profileSchema = useMemo(() => z.object({
    companyName: z.string().min(2, t('validation.companyNameMin')),
    // ...
  }), [t])
  
  const form = useForm({
    resolver: zodResolver(profileSchema),
  })
}
```

**Approach 2**: Translate error messages in display logic
```typescript
{form.formState.errors.companyName && (
  <p className="text-sm text-destructive">
    {t('validation.companyNameMin')}
  </p>
)}
```

We'll use Approach 1 for consistency with validation schema.

### Phone Placeholder

The phone placeholder should remain "+62 812-3456-7890" across all languages since it's an Indonesian phone format example.
