# Implementation Plan: Tip Payment UI Enhancements v3

## Overview

This plan implements navigation improvements, input validation, hover states, and Google Pay integration for the tip payment UI.

## Tasks

- [x] 1. Add back navigation button
  - Add ArrowLeft icon import from lucide-react
  - Add back button to header (left of logo) on amount screen for Team QR
  - Implement handleBack function to navigate to staff selection
  - Hide back button for Individual QR types
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Fix custom amount input validation
  - Update finalAmount calculation to use 10000 minimum
  - Update button disabled logic: finalAmount < 10000
  - Ensure custom input clears preset selection
  - Add input validation for numeric-only values
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Fix language switching state preservation
  - Review existing sessionStorage implementation
  - Ensure step and selectedStaffId are saved on every change
  - Fix restoration logic to properly restore amount screen state
  - Test language switching on both staff and amount screens
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Add hover states to staff cards
  - Add hover:border-blue-600 to staff card buttons
  - Add hover:bg-blue-50 for subtle background change
  - Ensure transition-all for smooth animations
  - Verify hover doesn't conflict with selected state
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5. Add hover states to preset amount buttons
  - Add hover:border-blue-600 to unselected preset buttons
  - Add hover:bg-blue-50 for subtle background change
  - Ensure transition-all for smooth animations
  - Verify hover doesn't conflict with selected state
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6. Add Google Pay button
  - Add Google Pay button component below Send button
  - Style button with Google Pay branding
  - Implement disabled state based on amount validation
  - Add onClick handler for Google Pay flow (stub for now)
  - Match button height and styling with Send button
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.7, 6.8_

- [x] 7. Test all changes
  - Test back navigation on Team QR
  - Test amount validation with various inputs
  - Test language switching preserves state
  - Test hover states on staff cards and preset buttons
  - Test Google Pay button appears and is properly disabled/enabled
  - Verify responsive behavior on mobile and desktop

## Notes

- All changes are UI-only, no backend modifications needed
- Google Pay integration is stubbed for now (full implementation requires backend support)
- Minimum tip amount is 10000 (Rp 10 in rupiah minor units)
- Session storage keys: 'tipPageStep', 'selectedStaffId'
