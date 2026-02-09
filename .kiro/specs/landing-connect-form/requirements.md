# Requirements Document

## Introduction

This specification defines the implementation of a connection request form for the TIPSIO landing page. The feature replaces the current "Leave tip or review" button functionality with a business connection form, allowing potential clients to submit connection requests directly from the Hero and Final CTA sections.

## Glossary

- **Hero Section**: The main landing page section at the top with primary call-to-action buttons
- **Final CTA Section**: The bottom call-to-action section before the footer
- **Connection Form**: A dialog form for collecting business connection requests
- **Dialog**: A modal overlay component from shadcn/ui library
- **Lead**: A potential client who submits a connection request

## Requirements

### Requirement 1: Button Text Update

**User Story:** As a potential client, I want to see a clear "Connect" button, so that I understand I can request business connection.

#### Acceptance Criteria

1. WHEN viewing the Hero Section THEN the system SHALL display a button with text "Подключить" (RU), "Connect" (EN), "Hubungkan" (ID)
2. WHEN viewing the Final CTA Section THEN the system SHALL display a button with text "Подключить" (RU), "Connect" (EN), "Hubungkan" (ID)
3. THE system SHALL remove the previous "Leave tip or review" button text from all translations
4. THE system SHALL maintain consistent button styling across both sections

### Requirement 2: Connection Form Dialog

**User Story:** As a potential client, I want to fill out a connection form, so that I can request TIPSIO integration for my business.

#### Acceptance Criteria

1. WHEN a user clicks the "Connect" button THEN the system SHALL open a dialog with title "Подключить Tipsio" (RU), "Connect Tipsio" (EN), "Hubungkan Tipsio" (ID)
2. THE dialog SHALL contain a Select field labeled "Цель обращения" (RU), "Purpose" (EN), "Tujuan" (ID) with options:
   - "Подключение" / "Connection" / "Koneksi"
   - "Техподдержка" / "Technical Support" / "Dukungan Teknis"
3. THE dialog SHALL contain an Input field labeled "Название вашего заведения и город" (RU), "Your business name and city" (EN), "Nama bisnis dan kota Anda" (ID)
4. THE dialog SHALL contain an Input field labeled "Ваше имя" (RU), "Your name" (EN), "Nama Anda" (ID)
5. THE dialog SHALL contain an Input field labeled "Телефон" (RU), "Phone" (EN), "Telepon" (ID) with support for +62 and +7 prefixes
6. THE dialog SHALL contain a Submit button with text:
   - RU: "Подключить заведение"
   - EN: "Connect business"
   - ID: "Hubungkan bisnis"
7. THE dialog SHALL use shadcn/ui components exclusively
8. THE dialog SHALL be responsive and work correctly on mobile devices

### Requirement 3: Phone Number Validation

**User Story:** As a system, I want to validate phone numbers, so that only valid Indonesian (+62) or Russian (+7) numbers are accepted.

#### Acceptance Criteria

1. WHEN a user enters a phone number THEN the system SHALL validate it matches +62 or +7 format
2. WHEN a phone number is invalid THEN the system SHALL display an error message
3. WHEN a phone number is valid THEN the system SHALL allow form submission
4. THE system SHALL accept phone numbers in formats: +62XXXXXXXXXX or +7XXXXXXXXXX

### Requirement 4: Form Submission and Data Storage

**User Story:** As a business owner, I want connection requests to be stored in the database, so that I can follow up with potential clients.

#### Acceptance Criteria

1. WHEN a user submits the form THEN the system SHALL create a new record in the ConnectionRequest table
2. THE system SHALL store the following fields:
   - purpose (enum: CONNECTION or SUPPORT)
   - businessName (string)
   - contactName (string)
   - phone (string)
   - createdAt (timestamp)
3. WHEN submission is successful THEN the system SHALL display a success message
4. WHEN submission fails THEN the system SHALL display an error message
5. WHEN submission is successful THEN the system SHALL close the dialog
6. THE system SHALL validate all required fields before submission

### Requirement 5: API Endpoint

**User Story:** As a developer, I want a dedicated API endpoint for connection requests, so that the form can submit data securely.

#### Acceptance Criteria

1. THE system SHALL provide a POST endpoint at /api/connection-requests
2. WHEN receiving a POST request THEN the system SHALL validate the request body
3. WHEN validation passes THEN the system SHALL create a database record
4. WHEN validation fails THEN the system SHALL return a 400 status code with error details
5. WHEN creation succeeds THEN the system SHALL return a 201 status code
6. WHEN creation fails THEN the system SHALL return a 500 status code

### Requirement 6: Responsive Design

**User Story:** As a mobile user, I want the connection form to work properly on my device, so that I can submit requests from anywhere.

#### Acceptance Criteria

1. WHEN viewing on mobile (< 640px) THEN the dialog SHALL fit within the viewport
2. WHEN viewing on mobile THEN all form fields SHALL be easily tappable (min 44px touch target)
3. WHEN viewing on mobile THEN the dialog SHALL not break layout or cause horizontal scroll
4. WHEN viewing on tablet (640px - 1024px) THEN the dialog SHALL display optimally
5. WHEN viewing on desktop (> 1024px) THEN the dialog SHALL display with appropriate max-width

### Requirement 7: Internationalization

**User Story:** As a user, I want to see the form in my preferred language, so that I can understand all fields and labels.

#### Acceptance Criteria

1. THE system SHALL support Russian (ru), English (en), and Indonesian (id) languages
2. WHEN language is Russian THEN all labels, placeholders, and buttons SHALL display in Russian
3. WHEN language is English THEN all labels, placeholders, and buttons SHALL display in English
4. WHEN language is Indonesian THEN all labels, placeholders, and buttons SHALL display in Indonesian
5. THE system SHALL use the existing i18n infrastructure for translations
