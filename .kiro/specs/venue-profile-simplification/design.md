# Design Document: Venue Profile Simplification

## Overview

This design implements simplifications to the venue profile page by removing the referral program section, consolidating name fields into a single company name field, fixing logo upload validation errors, and correcting phone number deletion behavior.

## Architecture

The solution involves modifications to:
1. **Frontend**: Profile page UI (`src/app/venue/(dashboard)/profile/page.tsx`)
2. **Backend**: Profile API endpoint (`src/app/api/venues/profile/route.ts`)
3. **Database**: Venue model already has `logoUrl` field; User model has `firstName`, `lastName`, `avatarUrl`, `phone`

## Components and Interfaces

### Frontend Components

#### VenueProfilePage Component
**Location**: `src/app/venue/(dashboard)/profile/page.tsx`

**Changes**:
1. Remove "Referral" tab from TabsList
2. Remove "Bonuses" tab from TabsList  
3. Replace `firstName` and `lastName` inputs with single `companyName` input
4. Update form schema to use `companyName` instead of `firstName`/`lastName`
5. Change phone placeholder to "+62 812-3456-7890"
6. Fix phone deletion: ensure empty string is sent to API when field is cleared
7. Rename "Фото профиля" to "Логотип компании"
8. Update avatar/logo display logic to use company name initials

**New Form Schema**:
```typescript
const profileSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password.length > 0 && data.password.length < 6) {
    return false
  }
  return true
}, {
  message: 'Password must be at least 6 characters',
  path: ['password'],
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false
  }
  return true
}, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
```

**Profile Data Interface**:
```typescript
interface ProfileData {
  email: string
  phone: string | null
  companyName: string
  logoUrl: string | null
}
```

### Backend API

#### Profile API Endpoint
**Location**: `src/app/api/venues/profile/route.ts`

**GET /api/venues/profile Changes**:
- Return `logoUrl` from Venue model (not User.avatarUrl)
- Return `companyName` from Venue.name
- Remove `firstName`, `lastName`, `avatarUrl` from response

**PATCH /api/venues/profile Changes**:
1. Update validation schema to accept `companyName` and `logoUrl`
2. Remove `firstName`, `lastName`, `avatarUrl` from validation
3. Fix phone deletion: when `phone` is empty string or null, set to null in database
4. Update Venue.name with `companyName`
5. Update Venue.logoUrl with `logoUrl`
6. Fix validation error: ensure `logoUrl` accepts empty string, null, or valid URL

**Updated Validation Schema**:
```typescript
const updateProfileSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().nullable().optional(),
  logoUrl: z.union([
    z.string().url("Invalid logo URL"),
    z.literal(""),
    z.null(),
  ]).optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  confirmPassword: z.string().optional(),
}).refine(
  (data) => {
    if (data.password && !data.confirmPassword) {
      return false;
    }
    if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
      return false;
    }
    return true;
  },
  {
    message: "Passwords must match",
    path: ["confirmPassword"],
  }
);
```

## Data Models

### Venue Model (Existing)
```prisma
model Venue {
  id        String   @id @default(cuid())
  name      String   // Used for company name
  logoUrl   String?  // Used for company logo
  phone     String?
  email     String?
  // ... other fields
}
```

### User Model (Existing)
```prisma
model User {
  id           String   @id @default(cuid())
  email        String?  @unique
  phone        String?  @unique
  passwordHash String?
  // firstName, lastName, avatarUrl no longer used for venue profile
  // ... other fields
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Referral Section Removal
*For any* venue profile page load, the page should not contain any referral program UI elements or tabs
**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Single Company Name Field
*For any* venue profile form, there should be exactly one name input field labeled as company/business name, and no separate first/last name fields
**Validates: Requirements 2.1, 2.2, 2.5**

### Property 3: Company Name Persistence
*For any* valid company name value submitted, saving the profile should result in the Venue.name field being updated to that value
**Validates: Requirements 2.3, 2.4**

### Property 4: Logo Upload Success
*For any* valid image file (JPEG, PNG, WebP under 5MB), uploading and saving should complete without validation errors
**Validates: Requirements 3.1, 3.2, 3.6**

### Property 5: Logo Display on Tip Pages
*For any* venue with a saved logo, the tip payment page for that venue's QR codes should display the logo image
**Validates: Requirements 3.4**

### Property 6: Phone Placeholder Format
*For any* venue profile page load, the phone input field should display placeholder text matching Indonesian format "+62 812-3456-7890"
**Validates: Requirements 4.1, 4.6**

### Property 7: Phone Number Deletion
*For any* venue profile with an existing phone number, clearing the phone field and saving should result in the phone value being null in the database
**Validates: Requirements 4.2, 4.7**

### Property 8: Phone Number Update
*For any* new phone number value entered and saved, the database should reflect the new phone number value
**Validates: Requirements 4.3**

## Error Handling

### Logo Upload Errors
- **File Type Error**: Return clear message "Only JPG, PNG, or WebP files allowed"
- **File Size Error**: Return clear message "File too large. Maximum 5MB"
- **Upload Failure**: Return clear message "Failed to upload image. Please try again"
- **Validation Error**: Fix by ensuring logoUrl accepts empty string, null, or valid URL

### Phone Number Errors
- **Duplicate Phone**: Return error "This phone number is already registered"
- **Invalid Format**: Client-side validation for phone format (optional enhancement)

### Company Name Errors
- **Too Short**: Return error "Company name must be at least 2 characters"
- **Empty**: Return error "Company name is required"

## Testing Strategy

### Unit Tests
- Test profile form validation with company name
- Test phone number field accepts empty string
- Test logo URL validation accepts null, empty string, and valid URLs
- Test profile data transformation (Venue.name ↔ companyName)

### Property-Based Tests
- **Property 1**: Generate random profile page renders, verify no referral elements exist
- **Property 2**: Generate random profile forms, verify single company name field exists
- **Property 3**: Generate random company names, verify persistence to Venue.name
- **Property 4**: Generate random valid image files, verify upload succeeds
- **Property 5**: Generate random venues with logos, verify logo displays on tip pages
- **Property 6**: Generate random profile page loads, verify phone placeholder format
- **Property 7**: Generate random profiles with phone numbers, clear and save, verify null in DB
- **Property 8**: Generate random phone numbers, save, verify updated in DB

### Integration Tests
- Test complete profile update flow: company name + logo + phone
- Test logo upload → save → display on tip page flow
- Test phone deletion flow: existing phone → clear → save → verify removed
- Test validation error handling for logo upload

### Manual Testing Checklist
- [ ] Visit /venue/profile, verify no referral tab
- [ ] Verify single "Company Name" input field
- [ ] Upload logo, save, verify no validation error
- [ ] Visit tip payment page, verify logo displays
- [ ] Enter phone number, save, verify saved
- [ ] Clear phone number, save, verify removed
- [ ] Verify phone placeholder shows "+62 812-3456-7890"

## Implementation Notes

### Logo vs Avatar Clarification
- **User.avatarUrl**: Not used for venue profile (was for personal avatar)
- **Venue.logoUrl**: Used for company logo, displayed on tip payment pages
- Frontend should upload to `/api/upload` and store URL in Venue.logoUrl

### Phone Number Handling
- Empty string from form should be converted to null before API call
- API should treat empty string and null as "delete phone number"
- Database phone field is nullable

### Company Name Mapping
- Frontend `companyName` field maps to `Venue.name` in database
- On load: fetch Venue.name and display as companyName
- On save: update Venue.name with companyName value

### Tip Payment Page Logo Display
- Tip payment page should fetch venue data including logoUrl
- Display logo if logoUrl exists, otherwise show company name initials
- Verify logo is passed through QR code → venue → tip page data flow
