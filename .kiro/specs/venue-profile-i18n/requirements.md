# Requirements Document: Venue Profile Internationalization

## Introduction

This specification defines the internationalization (i18n) implementation for the venue profile page, enabling support for English, Indonesian, and Russian languages.

## Glossary

- **Venue_Profile_Page**: The page at /venue/profile where venue owners manage their profile
- **i18n**: Internationalization - the process of designing software to support multiple languages
- **Translation_Keys**: Unique identifiers for translatable text strings
- **Language_Switcher**: UI component that allows users to change the interface language
- **useTranslations_Hook**: React hook that provides access to translated strings

## Requirements

### Requirement 1: Add Translation Support to Profile Page

**User Story:** As a venue owner, I want to view the profile page in my preferred language (English, Indonesian, or Russian), so that I can understand and use the interface more easily.

#### Acceptance Criteria

1. WHEN the user views the profile page, THE System SHALL display all text in the currently selected language
2. WHEN the user switches language using the Language Switcher, THE System SHALL update all text on the profile page to the new language
3. THE System SHALL support English (en), Indonesian (id), and Russian (ru) languages
4. WHEN translations are missing for a language, THE System SHALL fall back to English
5. THE System SHALL preserve the selected language across page reloads

### Requirement 2: Translate Profile Page Headers and Labels

**User Story:** As a venue owner, I want all page headers, section titles, and form labels translated, so that I can navigate the profile page in my language.

#### Acceptance Criteria

1. THE System SHALL translate the page title "Профиль"
2. THE System SHALL translate the page description
3. THE System SHALL translate all form field labels (Company Name, Email, Phone, Password)
4. THE System SHALL translate all button labels (Save, Upload Logo, Change Logo)
5. THE System SHALL translate all section headers

### Requirement 3: Translate Form Validation Messages

**User Story:** As a venue owner, I want validation error messages in my language, so that I understand what needs to be corrected.

#### Acceptance Criteria

1. WHEN validation fails, THE System SHALL display error messages in the current language
2. THE System SHALL translate email validation errors
3. THE System SHALL translate password validation errors
4. THE System SHALL translate company name validation errors
5. THE System SHALL translate phone number validation errors

### Requirement 4: Translate Success and Error Messages

**User Story:** As a venue owner, I want success and error notifications in my language, so that I understand the result of my actions.

#### Acceptance Criteria

1. WHEN profile update succeeds, THE System SHALL display success message in current language
2. WHEN profile update fails, THE System SHALL display error message in current language
3. WHEN image upload fails, THE System SHALL display error message in current language
4. THE System SHALL translate all toast notification messages

### Requirement 5: Translate Placeholder Text

**User Story:** As a venue owner, I want placeholder text in form fields in my language, so that I understand what information to enter.

#### Acceptance Criteria

1. THE System SHALL translate the company name placeholder
2. THE System SHALL translate the email placeholder
3. THE System SHALL translate the phone placeholder (maintaining Indonesian format +62)
4. THE System SHALL translate the password placeholders
5. THE System SHALL translate the file upload helper text

## Technical Notes

### Translation File Structure
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

### Implementation Approach
1. Add translation keys to `messages/en.json`, `messages/id.json`, `messages/ru.json`
2. Import `useTranslations` hook in profile page component
3. Replace all hardcoded Russian text with `t('key')` calls
4. Ensure validation messages use translated strings
5. Test language switching functionality

### Language Codes
- English: `en`
- Indonesian: `id`
- Russian: `ru`
