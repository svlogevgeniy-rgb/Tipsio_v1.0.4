# Implementation Plan: Venue Profile Simplification

## Overview

This plan implements UI simplifications, logo upload fixes, and phone number handling improvements for the venue profile page.

## Tasks

- [x] 1. Update frontend profile page UI
  - [x] 1.1 Remove referral and bonuses tabs from TabsList
    - Remove "Бонусы" tab trigger and content
    - Remove "Реферальная программа" tab trigger and content
    - Keep only "Настройка профиля" tab
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.2 Replace name fields with company name field
    - Remove firstName and lastName input fields
    - Add single companyName input field with label "Название компании"
    - Update form schema to use companyName instead of firstName/lastName
    - Update ProfileData interface to use companyName
    - _Requirements: 2.1, 2.2, 2.5_

  - [x] 1.3 Update logo upload section
    - Change label from "Фото профиля" to "Логотип компании"
    - Update avatar display to use company name for initials
    - Update getInitials function to use companyName
    - _Requirements: 3.3_

  - [x] 1.4 Fix phone number field
    - Change placeholder to "+62 812-3456-7890"
    - Ensure empty phone field sends empty string or null to API
    - _Requirements: 4.1, 4.6_

- [x] 2. Update backend profile API
  - [x] 2.1 Update GET /api/venues/profile endpoint
    - Fetch Venue.logoUrl instead of User.avatarUrl
    - Return companyName from Venue.name
    - Remove firstName, lastName, avatarUrl from response
    - _Requirements: 2.3, 2.4, 3.4_

  - [x] 2.2 Update PATCH /api/venues/profile validation schema
    - Add companyName field validation (min 2 characters)
    - Add logoUrl field validation (URL, empty string, or null)
    - Remove firstName, lastName, avatarUrl from schema
    - Fix phone field to accept null and empty string
    - _Requirements: 2.3, 3.1, 3.2, 4.2_

  - [x] 2.3 Update PATCH /api/venues/profile logic
    - Update Venue.name with companyName value
    - Update Venue.logoUrl with logoUrl value
    - Handle phone deletion: convert empty string to null
    - Remove firstName, lastName, avatarUrl update logic
    - _Requirements: 2.3, 3.1, 3.2, 4.2, 4.7_

- [x] 3. Verify tip payment page logo display
  - [x] 3.1 Check tip payment page fetches venue logoUrl
    - Verify /tip/[shortCode] page fetches venue data
    - Ensure logoUrl is included in venue data
    - Verify logo displays when logoUrl exists
    - Verify fallback to company name initials when no logo
    - _Requirements: 3.4, 3.5_

- [x] 4. Test all changes
  - Test profile page loads without referral/bonuses tabs
  - Test company name field saves and loads correctly
  - Test logo upload completes without validation errors
  - Test logo displays on tip payment pages
  - Test phone number updates correctly
  - Test phone number deletes when field is cleared
  - Test phone placeholder shows Indonesian format
  - Verify responsive behavior on mobile and desktop

## Notes

- Logo is stored in Venue.logoUrl, not User.avatarUrl
- Company name is stored in Venue.name
- Phone deletion: empty string or null should set phone to null in database
- All UI text should remain in Russian as per current implementation
- Minimum company name length: 2 characters
- Phone placeholder: "+62 812-3456-7890" (Indonesian format)
