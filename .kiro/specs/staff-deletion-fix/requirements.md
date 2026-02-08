# Requirements Document - Staff Deletion Fix

## Introduction

Fix the staff deletion functionality to properly handle database constraints and provide clear user feedback about deletion status.

## Glossary

- **Staff**: Employee record in the system
- **Hard Delete**: Permanent removal from database
- **Soft Delete**: Setting status to INACTIVE while preserving record
- **TipAllocation**: Record of tip distribution to staff member
- **Financial History**: Any Tip or TipAllocation records associated with staff

## Requirements

### Requirement 1: Database Schema Integrity

**User Story:** As a system, I want proper foreign key cascade rules, so that data integrity is maintained during deletions.

#### Acceptance Criteria

1. WHEN a Tip references a Staff member THEN the system SHALL allow setting staffId to NULL on staff deletion
2. WHEN a TipAllocation references a Staff member THEN the system SHALL prevent hard deletion (RESTRICT behavior is correct)
3. WHEN a QrCodeRecipient references a Staff member THEN the system SHALL cascade delete the recipient record

### Requirement 2: Deletion Logic

**User Story:** As a venue manager, I want staff deletion to work correctly, so that I can manage my team roster.

#### Acceptance Criteria

1. WHEN a staff member has TipAllocation records THEN the system SHALL perform soft delete only
2. WHEN a staff member has Tip records but no TipAllocation records THEN the system SHALL perform soft delete only
3. WHEN a staff member has no financial history THEN the system SHALL perform hard delete
4. WHEN soft deleting staff THEN the system SHALL set status to INACTIVE and deactivate associated QR codes
5. WHEN hard deleting staff THEN the system SHALL delete associated INDIVIDUAL QR codes in a transaction

### Requirement 3: User Feedback

**User Story:** As a venue manager, I want clear feedback about deletion results, so that I understand what happened.

#### Acceptance Criteria

1. WHEN staff is soft deleted THEN the system SHALL return a message indicating the staff was deactivated due to financial history
2. WHEN staff is hard deleted THEN the system SHALL return a message indicating permanent deletion
3. WHEN deletion fails THEN the system SHALL return a descriptive error message
4. WHEN viewing staff list THEN the system SHALL allow filtering to show/hide inactive staff

### Requirement 4: Error Handling

**User Story:** As a system, I want robust error handling during deletion, so that failures are properly reported.

#### Acceptance Criteria

1. WHEN database constraints prevent deletion THEN the system SHALL catch the error and return appropriate message
2. WHEN transaction fails THEN the system SHALL rollback all changes
3. WHEN API returns error THEN the client SHALL display error message to user
4. WHEN API returns success THEN the client SHALL update UI state correctly
