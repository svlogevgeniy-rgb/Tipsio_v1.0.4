# Implementation Plan: Landing Connect Form

## Overview

This implementation plan breaks down the connection form feature into discrete, testable tasks. Each task builds on previous work and includes specific requirements references.

## Tasks

- [x] 1. Database schema and migrations
  - Create Prisma schema for ConnectionRequest model
  - Add ConnectionPurpose enum (CONNECTION, SUPPORT)
  - Generate and run migration
  - _Requirements: 4.1, 4.2_

- [x] 2. Add i18n translations
  - [x] 2.1 Add Russian translations to messages/ru.json
    - Button text: "Подключить"
    - Dialog title: "Подключить Tipsio"
    - Form labels and placeholders
    - Error messages
    - Success message
    - _Requirements: 1.1, 2.1, 7.2_

  - [x] 2.2 Add English translations to messages/en.json
    - Button text: "Connect"
    - Dialog title: "Connect Tipsio"
    - Form labels and placeholders
    - Error messages
    - Success message
    - _Requirements: 1.1, 2.1, 7.3_

  - [x] 2.3 Add Indonesian translations to messages/id.json
    - Button text: "Hubungkan"
    - Dialog title: "Hubungkan Tipsio"
    - Form labels and placeholders
    - Error messages
    - Success message
    - _Requirements: 1.1, 2.1, 7.4_

- [x] 3. Create API endpoint
  - [x] 3.1 Implement POST /api/connection-requests route
    - Request body validation with zod
    - Database record creation
    - Error handling (400, 500 status codes)
    - Success response (201 status code)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 3.2 Write unit tests for API endpoint
    - Test valid request handling
    - Test validation errors
    - Test database creation
    - Test error responses
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 3.3 Write property test for API validation
    - **Property 6: API endpoint validates request structure**
    - **Validates: Requirements 5.2, 5.4, 5.5, 5.6**

- [x] 4. Create ConnectionFormDialog component
  - [x] 4.1 Create base dialog component structure
    - Use shadcn/ui Dialog components
    - Add DialogHeader with title
    - Set up form with react-hook-form
    - _Requirements: 2.1, 2.7_

  - [x] 4.2 Implement form fields
    - Select field for purpose (CONNECTION/SUPPORT)
    - Input field for business name
    - Input field for contact name
    - Input field for phone number
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [x] 4.3 Add form validation with zod
    - Purpose field validation
    - Business name validation (2-100 chars)
    - Contact name validation (2-50 chars)
    - Phone number validation (+62 or +7 format)
    - _Requirements: 3.1, 3.4, 4.6_

  - [x] 4.4 Implement form submission logic
    - Call API endpoint on submit
    - Handle success response (show toast, close dialog)
    - Handle error response (show error message)
    - Reset form after successful submission
    - _Requirements: 4.3, 4.4, 4.5_

  - [x] 4.5 Write unit tests for form component
    - Test form rendering
    - Test field validation
    - Test submission flow
    - Test error handling
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 4.6 Write property test for form validation
    - **Property 1: Form validation prevents invalid submissions**
    - **Validates: Requirements 3.1, 3.2, 4.6**

  - [x] 4.7 Write property test for phone validation
    - **Property 3: Phone number validation accepts only valid formats**
    - **Validates: Requirements 3.1, 3.4**

- [x] 5. Add responsive design
  - [x] 5.1 Implement mobile styles (< 640px)
    - Dialog fits viewport
    - Touch targets minimum 44px
    - No horizontal scroll
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 5.2 Implement tablet styles (640px - 1024px)
    - Optimal dialog width
    - Proper spacing
    - _Requirements: 6.4_

  - [x] 5.3 Implement desktop styles (> 1024px)
    - Max-width constraint
    - Centered dialog
    - _Requirements: 6.5_

  - [x] 5.4 Write property test for responsive behavior
    - **Property 4: Dialog responsiveness maintains usability**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

- [x] 6. Update Hero Section
  - [x] 6.1 Replace button text with "Connect" translations
    - Update button onClick to open ConnectionFormDialog
    - Remove old tip/review dialog code
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 6.2 Integrate ConnectionFormDialog
    - Import and render ConnectionFormDialog
    - Manage dialog open/close state
    - _Requirements: 2.1_

  - [x] 6.3 Write unit tests for Hero Section updates
    - Test button renders with correct text
    - Test button opens dialog
    - Test dialog integration
    - _Requirements: 1.1, 2.1_

- [x] 7. Update Final CTA Section
  - [x] 7.1 Find and update Final CTA button
    - Replace button text with "Connect" translations
    - Update button onClick to open ConnectionFormDialog
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 7.2 Integrate ConnectionFormDialog
    - Import and render ConnectionFormDialog
    - Manage dialog open/close state
    - _Requirements: 2.1_

  - [x] 7.3 Write unit tests for Final CTA updates
    - Test button renders with correct text
    - Test button opens dialog
    - Test dialog integration
    - _Requirements: 1.1, 2.1_

- [x] 8. Integration testing
  - [x] 8.1 Write property test for database record creation
    - **Property 2: Valid submissions create database records**
    - **Validates: Requirements 4.1, 4.2**

  - [x] 8.2 Write property test for translation completeness
    - **Property 5: Translation completeness across languages**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**

  - [x] 8.3 Write property test for success flow
    - **Property 7: Success flow completes correctly**
    - **Validates: Requirements 4.3, 4.5**

  - [x] 8.4 Write end-to-end integration tests
    - Test complete form submission flow
    - Test in all three languages
    - Test both CONNECTION and SUPPORT purposes
    - Test error recovery
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Final verification
  - [x] 10.1 Test on mobile devices
    - Verify form works on iOS Safari
    - Verify form works on Android Chrome
    - Verify touch targets are accessible
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 10.2 Test in all languages
    - Verify Russian translations
    - Verify English translations
    - Verify Indonesian translations
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 10.3 Verify database records
    - Submit test forms
    - Check database for correct records
    - Verify all fields are stored correctly
    - _Requirements: 4.1, 4.2_

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests verify end-to-end functionality
