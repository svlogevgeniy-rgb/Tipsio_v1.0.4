# Design Document

## Overview

This design implements a connection request form for the TIPSIO landing page. The solution replaces the existing tip/review dialog with a business connection form, allowing potential clients to submit connection requests. The implementation uses shadcn/ui components, follows the existing design system, and integrates with the current i18n infrastructure.

## Architecture

### Component Structure

```
LandingHeroSection (existing)
├── Button "Connect" (modified)
└── ConnectionFormDialog (new)
    ├── DialogHeader
    ├── Form (react-hook-form)
    │   ├── Select (Purpose)
    │   ├── Input (Business Name)
    │   ├── Input (Contact Name)
    │   └── Input (Phone)
    └── Submit Button

LandingFinalCtaSection (existing)
└── Button "Connect" (modified)
```

### Data Flow

```
User clicks "Connect" button
    ↓
Dialog opens with empty form
    ↓
User fills form fields
    ↓
Client-side validation (react-hook-form + zod)
    ↓
Submit → POST /api/connection-requests
    ↓
Server validates and saves to DB
    ↓
Success: Show toast + close dialog
Error: Show error message
```

## Components and Interfaces

### 1. ConnectionFormDialog Component

**Location:** `src/components/landing/ConnectionFormDialog.tsx`

**Props:**
```typescript
interface ConnectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**State:**
```typescript
interface FormData {
  purpose: 'CONNECTION' | 'SUPPORT';
  businessName: string;
  contactName: string;
  phone: string;
}
```

**Validation Schema (Zod):**
```typescript
const formSchema = z.object({
  purpose: z.enum(['CONNECTION', 'SUPPORT']),
  businessName: z.string().min(2).max(100),
  contactName: z.string().min(2).max(50),
  phone: z.string().regex(/^\+(?:62|7)\d{10,11}$/),
});
```

### 2. API Route

**Location:** `src/app/api/connection-requests/route.ts`

**Request Body:**
```typescript
interface ConnectionRequestBody {
  purpose: 'CONNECTION' | 'SUPPORT';
  businessName: string;
  contactName: string;
  phone: string;
}
```

**Response:**
```typescript
// Success (201)
{
  id: string;
  createdAt: string;
}

// Error (400/500)
{
  error: string;
  details?: string[];
}
```

### 3. Database Schema

**Prisma Model:**
```prisma
enum ConnectionPurpose {
  CONNECTION
  SUPPORT
}

model ConnectionRequest {
  id           String            @id @default(cuid())
  purpose      ConnectionPurpose
  businessName String
  contactName  String
  phone        String
  createdAt    DateTime          @default(now())
  
  @@index([createdAt])
  @@index([purpose])
}
```

## Data Models

### ConnectionRequest Entity

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| id | string (cuid) | Yes | Auto-generated |
| purpose | enum | Yes | CONNECTION or SUPPORT |
| businessName | string | Yes | 2-100 characters |
| contactName | string | Yes | 2-50 characters |
| phone | string | Yes | +62 or +7 format |
| createdAt | DateTime | Yes | Auto-generated |

### Phone Number Format

- **Indonesian:** `+62` followed by 10-11 digits
- **Russian:** `+7` followed by 10 digits
- **Regex:** `^\+(?:62|7)\d{10,11}$`

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Form validation prevents invalid submissions

*For any* form submission attempt with invalid data (empty fields, invalid phone format), the system should prevent submission and display appropriate error messages without making an API call.

**Validates: Requirements 3.1, 3.2, 4.6**

### Property 2: Valid submissions create database records

*For any* valid form submission, the system should create exactly one ConnectionRequest record in the database with all provided fields correctly stored.

**Validates: Requirements 4.1, 4.2**

### Property 3: Phone number validation accepts only valid formats

*For any* phone number input, the system should accept only numbers matching +62XXXXXXXXXX or +7XXXXXXXXXX format and reject all other formats.

**Validates: Requirements 3.1, 3.4**

### Property 4: Dialog responsiveness maintains usability

*For any* viewport size (mobile, tablet, desktop), the dialog should remain fully functional with all interactive elements accessible and properly sized.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

### Property 5: Translation completeness across languages

*For any* supported language (ru, en, id), all form labels, placeholders, buttons, and messages should display in the selected language without fallbacks to other languages.

**Validates: Requirements 7.1, 7.2, 7.3, 7.4**

### Property 6: API endpoint validates request structure

*For any* POST request to /api/connection-requests, the endpoint should validate the request body structure and return appropriate status codes (400 for invalid, 201 for success, 500 for server errors).

**Validates: Requirements 5.2, 5.4, 5.5, 5.6**

### Property 7: Success flow completes correctly

*For any* successful form submission, the system should display a success message, close the dialog, and reset the form state.

**Validates: Requirements 4.3, 4.5**

## Error Handling

### Client-Side Errors

1. **Validation Errors**
   - Display inline error messages below each field
   - Prevent form submission until all errors are resolved
   - Use react-hook-form error state

2. **Network Errors**
   - Show toast notification with retry option
   - Keep dialog open with form data preserved
   - Log error to console for debugging

### Server-Side Errors

1. **400 Bad Request**
   - Return validation error details
   - Client displays specific field errors

2. **500 Internal Server Error**
   - Return generic error message
   - Client shows "Something went wrong" message
   - Log full error server-side

### Error Messages (i18n)

```typescript
// messages/ru.json
"connectionForm": {
  "errors": {
    "required": "Это поле обязательно",
    "phoneInvalid": "Введите номер в формате +62 или +7",
    "minLength": "Минимум {min} символов",
    "maxLength": "Максимум {max} символов",
    "networkError": "Ошибка сети. Попробуйте снова.",
    "serverError": "Что-то пошло не так. Попробуйте позже."
  }
}
```

## Testing Strategy

### Unit Tests

1. **Form Validation**
   - Test each validation rule (required, min/max length, phone format)
   - Test error message display
   - Test form reset after submission

2. **API Route**
   - Test request validation
   - Test database record creation
   - Test error responses

3. **Phone Number Validation**
   - Test valid +62 numbers
   - Test valid +7 numbers
   - Test invalid formats

### Property-Based Tests

1. **Property 1: Form validation**
   - Generate random invalid form data
   - Verify submission is prevented
   - Verify no API calls are made

2. **Property 2: Database record creation**
   - Generate random valid form data
   - Submit and verify record exists
   - Verify all fields match input

3. **Property 3: Phone validation**
   - Generate random phone numbers
   - Verify only +62/+7 formats pass
   - Verify rejection of invalid formats

4. **Property 4: Responsive behavior**
   - Test at various viewport widths
   - Verify dialog fits viewport
   - Verify touch targets meet minimum size

5. **Property 5: Translation completeness**
   - For each language, verify all keys exist
   - Verify no missing translations
   - Verify correct language displays

6. **Property 6: API validation**
   - Generate random request bodies
   - Verify correct status codes
   - Verify error messages

7. **Property 7: Success flow**
   - Submit valid forms
   - Verify success message appears
   - Verify dialog closes
   - Verify form resets

### Integration Tests

1. **End-to-End Form Submission**
   - Open dialog → fill form → submit → verify success
   - Test with both CONNECTION and SUPPORT purposes
   - Test in all three languages

2. **Error Recovery**
   - Submit with network error → retry → success
   - Submit with validation error → fix → success

### Test Configuration

- Minimum 100 iterations per property test
- Use fast-check library for property-based testing
- Tag format: **Feature: landing-connect-form, Property {number}: {property_text}**

## Implementation Notes

### Styling

- Use existing Tailwind classes from the design system
- Match button styling from Hero section
- Use shadcn/ui default styles for form components
- Ensure 44px minimum touch targets on mobile

### Accessibility

- Proper ARIA labels for all form fields
- Keyboard navigation support
- Focus management (trap focus in dialog)
- Screen reader announcements for errors

### Performance

- Lazy load dialog component
- Debounce phone number validation
- Optimize re-renders with React.memo if needed

### Security

- Sanitize all inputs server-side
- Rate limit API endpoint (10 requests per minute per IP)
- Log all submissions for monitoring
- No sensitive data in client-side logs
