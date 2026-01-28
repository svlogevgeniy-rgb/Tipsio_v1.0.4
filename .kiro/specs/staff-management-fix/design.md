# Design Document: Staff Management System Fix

## Overview

This design addresses the critical infinite render loop bug in the staff management system. The root cause is improper dependency management in the `useStaffManagement` hook, specifically the `fetchStaff` callback being included as a dependency in `useEffect`, causing it to re-run on every render.

The fix involves restructuring the hook to use proper React patterns:
- Remove `fetchStaff` from useEffect dependencies
- Use empty dependency array for initial load
- Ensure callbacks have stable references with proper memoization
- Add cleanup logic to prevent state updates on unmounted components

## Architecture

### Current Architecture (Problematic)

```
useStaffManagement Hook
├── fetchStaff (useCallback with no deps) ❌
├── useEffect([fetchStaff]) ❌ Causes infinite loop
└── CRUD operations (useCallback with venueId)
```

### Fixed Architecture

```
useStaffManagement Hook
├── useEffect([]) - Initial load only ✓
├── fetchStaff (stable function) ✓
└── CRUD operations (useCallback with proper deps) ✓
```

## Components and Interfaces

### useStaffManagement Hook Interface

```typescript
interface UseStaffManagementReturn {
  staff: Staff[];
  venueId: string | null;
  isPageLoading: boolean;
  addStaff: (data: StaffForm, avatarFile: File | null) => Promise<void>;
  toggleStatus: (staffMember: Staff) => Promise<void>;
  deleteStaff: (staffMember: Staff) => Promise<void>;
  refresh: () => Promise<void>;
}

function useStaffManagement(): UseStaffManagementReturn
```

### Staff Type

```typescript
interface Staff {
  id: string;
  displayName: string;
  fullName?: string;
  role: StaffRole;
  status: 'ACTIVE' | 'INACTIVE';
  avatarUrl?: string;
  participatesInPool: boolean;
  // ... other fields
}
```

## Data Models

The hook manages three primary pieces of state:

1. **staff**: Array of Staff objects
2. **venueId**: Current venue identifier (string | null)
3. **isPageLoading**: Loading state for initial page load (boolean)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the acceptance criteria analysis, this fix focuses on specific behavioral examples rather than universal properties, as we're dealing with React hook lifecycle and side effects that are best verified through concrete test scenarios. The following examples should be verified:

### Example 1: Single fetch on mount
When the staff management page loads, the fetchStaff function should be called exactly once, not triggering infinite re-renders.
**Validates: Requirements 1.1**

### Example 2: Loading state transitions
When the initial data fetch completes (successfully or with error), the loading state should transition to false.
**Validates: Requirements 1.3, 1.4**

### Example 3: Staff list updates after creation
When a staff member is created successfully, the new staff member should appear in the staff list with all provided data.
**Validates: Requirements 2.2**

### Example 4: Status toggle updates UI
When a staff member's status is toggled successfully, the UI should immediately reflect the new status (ACTIVE ↔ INACTIVE).
**Validates: Requirements 3.2**

### Example 5: Deletion removes from list
When a staff member is deleted successfully, that staff member should no longer appear in the staff list.
**Validates: Requirements 4.2**

### Example 6: No state updates after unmount
When the component unmounts during an async operation, no state updates should be attempted, preventing React warnings.
**Validates: Requirements 5.3**

## Error Handling

### Error Scenarios

1. **Network Errors**: API calls may fail due to network issues
   - Handle with try-catch blocks
   - Propagate errors to calling component for user feedback

2. **Authentication Errors**: User may not be authenticated
   - API will return 401
   - Let Next.js auth middleware handle redirects

3. **Validation Errors**: Invalid data submission
   - API returns 400 with error message
   - Display error message to user

4. **State Update After Unmount**: Component unmounts during async operation
   - Use cleanup flag in useEffect
   - Check flag before setState calls

## Testing Strategy

### Unit Tests

Unit tests will verify:
- Hook initialization with correct default values
- Error handling for failed API calls
- State updates after successful operations
- Proper cleanup on unmount

### Property-Based Tests

Property-based tests are not applicable for this fix as we're dealing with React hook behavior and side effects rather than pure functions with universal properties.

### Integration Tests

Integration tests should verify:
- Full user flow: load page → add staff → toggle status → delete staff
- Error recovery scenarios
- Concurrent operations handling

### Testing Framework

- **Unit Testing**: Vitest with React Testing Library
- **Test Utilities**: @testing-library/react-hooks for hook testing
- Property-based tests will run a minimum of 100 iterations

