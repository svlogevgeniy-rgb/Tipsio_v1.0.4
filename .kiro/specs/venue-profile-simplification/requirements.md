# Requirements Document: Venue Profile Simplification

## Introduction

This specification defines simplifications and fixes for the venue profile page (/venue/profile), including UI simplification, photo upload fixes, and phone number handling improvements.

## Glossary

- **Venue_Profile_Page**: The page where venue owners manage their profile information at /venue/profile
- **Company_Name_Input**: Single input field for venue's company/business name
- **Logo_Upload**: Feature for uploading and saving venue logo image
- **Phone_Input**: Input field for venue contact phone number
- **Referral_Section**: Section displaying referral program information (to be removed)
- **Tip_Payment_Page**: Public page where customers pay tips, should display venue logo

## Requirements

### Requirement 1: Remove Referral Program Section

**User Story:** As a venue owner, I want a simplified profile page without referral program information, so that I can focus on essential business details.

#### Acceptance Criteria

1. WHEN the user visits /venue/profile, THE System SHALL NOT display any referral program section
2. WHEN the profile page loads, THE System SHALL only show essential profile fields
3. THE System SHALL remove all referral-related UI components from the profile page

### Requirement 2: Simplify Name Fields to Company Name

**User Story:** As a venue owner, I want to enter my company name in a single field, so that profile setup is simpler and more relevant for businesses.

#### Acceptance Criteria

1. WHEN the user views the profile form, THE System SHALL display a single "Company Name" input field
2. WHEN the user views the profile form, THE System SHALL NOT display separate "First Name" and "Last Name" fields
3. WHEN the user saves the profile, THE System SHALL store the company name value
4. WHEN the profile loads, THE System SHALL populate the company name field with existing data
5. THE Company_Name_Input SHALL be clearly labeled as "Company Name" or "Business Name"

### Requirement 3: Fix Logo Upload and Display

**User Story:** As a venue owner, I want to upload my company logo without errors, so that it appears on tip payment pages for my customers.

#### Acceptance Criteria

1. WHEN the user uploads a logo image, THE System SHALL save it without validation errors
2. WHEN the user saves the profile with a new logo, THE System SHALL NOT return "validation failed" error
3. WHEN a logo is successfully saved, THE System SHALL display it on the venue profile page
4. WHEN a customer visits a tip payment page (e.g., /tip/[shortCode]), THE System SHALL display the venue's logo
5. WHEN no logo is uploaded, THE System SHALL display a default placeholder or venue initials
6. THE Logo_Upload SHALL accept common image formats (JPEG, PNG, WebP)
7. THE System SHALL validate image file size and dimensions appropriately

### Requirement 4: Fix Phone Number Handling

**User Story:** As a venue owner, I want to properly update or remove my phone number, so that my contact information is accurate.

#### Acceptance Criteria

1. WHEN the phone input is displayed, THE System SHALL show placeholder "+62 812-3456-7890"
2. WHEN the user clears the phone number field and saves, THE System SHALL remove the phone number from the database
3. WHEN the user enters a new phone number and saves, THE System SHALL update the phone number in the database
4. WHEN the profile loads with an existing phone number, THE System SHALL display it in the phone input
5. WHEN the profile loads without a phone number, THE System SHALL display an empty field with the placeholder
6. THE Phone_Input SHALL use Indonesian country code (+62) in the placeholder
7. THE System SHALL NOT retain the old phone number when the field is cleared and saved

## Technical Notes

### UI Changes
- Remove entire referral section component
- Replace firstName and lastName inputs with single companyName input
- Update form validation schema to reflect new field structure

### Logo Upload Fix
- Review API endpoint validation for logo upload
- Ensure proper file handling and storage
- Update venue data model if needed to support logo URL
- Verify logo is passed to tip payment page components

### Phone Number Fix
- Ensure empty string or null properly clears phone number in database
- Update API endpoint to handle phone number deletion
- Placeholder format: "+62 812-3456-7890"

### Database Considerations
- May need to add companyName field to Venue model
- Ensure logo field exists and is properly typed
- Phone field should be nullable

### Tip Payment Page Integration
- Verify venue logo is fetched and displayed on /tip/[shortCode] pages
- Ensure proper fallback when logo is not available
- Test logo display on example: https://tipsio.tech/tip/9Gm6vkWo
