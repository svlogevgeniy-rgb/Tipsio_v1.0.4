# Requirements Document: Tip Payment UI Enhancements v3

## Introduction

This specification defines enhancements to the tip payment UI, building on tip-payment-ui-v2. The focus is on improving navigation, input validation, hover states, and adding Google Pay integration.

## Glossary

- **Tip_Page**: The main page where users enter tip amounts and select staff
- **Staff_Selection_Screen**: The screen where users choose which staff member to tip (Team QR only)
- **Amount_Screen**: The screen where users enter tip amount and rating
- **Back_Button**: Navigation button to return to staff selection
- **Custom_Amount_Input**: Manual input field for entering tip amounts
- **Preset_Button**: Quick-select button for predefined tip amounts (50, 100, 150)
- **Staff_Card**: Interactive card displaying staff member information
- **Google_Pay_Button**: Payment button for Google Pay integration
- **Language_Switcher**: Component for changing interface language
- **Session_Storage**: Browser storage for preserving state across page reloads

## Requirements

### Requirement 1: Back Navigation

**User Story:** As a user on the amount screen, I want to return to staff selection, so that I can change my staff choice without reloading the page.

#### Acceptance Criteria

1. WHEN the user is on the amount screen for Team QR, THE System SHALL display a back button to the left of the logo
2. WHEN the user clicks the back button, THE System SHALL navigate to the staff selection screen
3. WHEN navigating back, THE System SHALL preserve the QR data and not reload from the API
4. WHEN the user is on Individual QR amount screen, THE System SHALL NOT display a back button
5. WHEN navigating back, THE System SHALL clear the selected staff ID and reset to staff selection step

### Requirement 2: Custom Amount Input Validation

**User Story:** As a user, I want clear feedback on minimum tip amounts, so that I know when I can submit payment.

#### Acceptance Criteria

1. WHEN the user enters an amount less than 10000 (Rp 10), THE System SHALL disable the send button
2. WHEN the user enters an amount of 10000 or more, THE System SHALL enable the send button
3. WHEN the user types in the custom amount field, THE System SHALL clear any preset selection
4. WHEN the custom amount input is empty, THE System SHALL disable the send button
5. WHEN the user enters non-numeric characters, THE System SHALL prevent the input

### Requirement 3: Language Switching State Preservation

**User Story:** As a user who changes language on the amount screen, I want to stay on the amount screen, so that I don't lose my progress.

#### Acceptance Criteria

1. WHEN the user changes language on the amount screen, THE System SHALL preserve the current step in session storage
2. WHEN the page reloads after language change, THE System SHALL restore the user to the amount screen
3. WHEN restoring state, THE System SHALL preserve the selected staff ID
4. WHEN the user is on staff selection and changes language, THE System SHALL keep them on staff selection
5. WHEN session storage contains saved state, THE System SHALL apply it after QR data loads

### Requirement 4: Staff Card Hover States

**User Story:** As a user selecting staff, I want visual feedback when hovering over staff cards, so that I know which card I'm about to select.

#### Acceptance Criteria

1. WHEN the user hovers over a staff card, THE System SHALL change the border color to blue-600
2. WHEN the user hovers over a staff card, THE System SHALL apply a subtle background color change
3. WHEN the staff card is not hovered, THE System SHALL display gray-200 border
4. WHEN a staff card is selected, THE System SHALL maintain blue-600 border and blue-50 background
5. WHEN the user moves mouse away from card, THE System SHALL remove hover styles smoothly with transition

### Requirement 5: Preset Amount Button Hover States

**User Story:** As a user selecting a tip amount, I want visual feedback when hovering over preset buttons, so that I know which amount I'm about to select.

#### Acceptance Criteria

1. WHEN the user hovers over an unselected preset button, THE System SHALL change the border color to blue-600
2. WHEN the user hovers over an unselected preset button, THE System SHALL maintain white background
3. WHEN a preset button is selected, THE System SHALL display blue-600 background and white text
4. WHEN the user hovers over a selected preset button, THE System SHALL maintain selected styling
5. WHEN the user moves mouse away, THE System SHALL remove hover border smoothly with transition

### Requirement 6: Google Pay Integration

**User Story:** As a user, I want to pay with Google Pay, so that I can complete payment quickly using my saved payment method.

#### Acceptance Criteria

1. WHEN the amount screen loads, THE System SHALL display a Google Pay button below the Send button
2. WHEN the tip amount is less than 10000, THE System SHALL disable the Google Pay button
3. WHEN the tip amount is 10000 or more, THE System SHALL enable the Google Pay button
4. WHEN the user clicks Google Pay button, THE System SHALL initiate Google Pay payment flow
5. WHEN Google Pay payment completes successfully, THE System SHALL redirect to success page
6. WHEN Google Pay payment fails, THE System SHALL display error message and keep user on page
7. THE Google_Pay_Button SHALL display the Google Pay logo and "Pay with Google Pay" text
8. THE Google_Pay_Button SHALL use consistent styling with other buttons (height, border-radius)

## Technical Notes

### Back Button Implementation
- Use ArrowLeft icon from lucide-react
- Position to the left of logo in header
- Only show when step === "amount" && isTeamQr(qrData.type)
- onClick: setStep("staff"), setSelectedStaffId(null)

### Input Validation
- Minimum amount: 10000 (represents Rp 10 in rupiah minor units)
- Validation should happen on every input change
- Button disabled state: !finalAmount || finalAmount < 10000 || submitting

### Session Storage Keys
- 'tipPageStep': stores current step ('staff' | 'amount')
- 'selectedStaffId': stores selected staff member ID
- Clear these keys on successful payment submission

### Hover States
- Use Tailwind's hover: pseudo-class
- Transition: transition-all for smooth animations
- Staff cards: hover:border-blue-600
- Preset buttons: hover:border-blue-600

### Google Pay Integration
- Use Google Pay API for web
- Payment data should include: amount, currency (IDR), merchant info
- Handle payment authorization and completion
- Fallback to regular payment if Google Pay unavailable
