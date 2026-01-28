# Design Document

## Overview

This design document outlines the implementation approach for improving the TIPSIO landing page and QR code management interface.


## Architecture

### System Components

1. **Landing Page Components** (`src/components/landing/main/sections/`)
   - LandingNavigation.tsx
   - LandingProblemSection.tsx
   - LandingProductDemoSection.tsx
   - LandingBenefitsSection.tsx
   - LandingFAQSection.tsx

2. **Translation Files** (`messages/`)
   - ru.json, en.json, id.json

3. **QR Management** (`src/app/venue/(dashboard)/qr-codes/`)
   - page.tsx - QR codes list page
   - API routes for deletion

### Technology Stack

- React, Next.js 14, TypeScript
- shadcn/ui, Tailwind CSS
- Framer Motion
- next-intl
- Google Pay Button (official)
- Prisma ORM

## Components and Interfaces

### 1. Navigation Header Simplification

Replace dropdown with direct link:
```typescript
<Link href="/venue/login">
  <Button variant="headerCta">{t('nav.login')}</Button>
</Link>
```

Hide Products dropdown completely.

### 2. Problem Section Updates

**Text Updates** in `messages/ru.json`:
- `problem.desc1`: "Гости хотят сказать «спасибо» за отличный сервис — но всё чаще у них с собой только карта или телефон. Когда нет удобного способа оставить чаевые, эти «спасибо» так и остаются словами, а ваша команда теряет доход."
- `problem.desc2`: "превращает фразу «Извините, у меня только карта» в реальные чаевые для персонала — быстро, удобно и без неловкости."

**Google Pay Button**:
```typescript
import { GooglePayButton } from '@google-pay/button-react'

<GooglePayButton
  environment="TEST"
  buttonType="pay"
  buttonSizeMode="fill"
  style={{ width: '100%', height: '48px' }}
/>
```

**Midtrans Logo**:
```typescript
<Image
  src="/images/midtrans-logo.svg"
  alt="Midtrans"
  width={80}
  height={20}
/>
```

### 3. Product Demo Section Updates

Update `messages/ru.json`:
- `productDemo.title`: "Понятно каждому гостю"
- `productDemo.point1`: "Мультиязычный интерфейс"
- `productDemo.point2`: "Без приложений и аккаунтов"
- `productDemo.point3`: "Оптимальные суммы — больше чаевых без усилий"

### 4. Benefits Section Updates

Update `messages/ru.json`:
- `benefits.business.desc`: "Когда у персонала есть удобный и прозрачный способ получать чаевые от гостей, которые платят картой, работа ощущается более справедливой, а благодарность — реальной."
- `benefits.guests.desc`: "Никакого чувства вины из-за отсутствия наличных денег. Оплата в пару кликов!"

### 5. FAQ Section Updates

Update `messages/ru.json`:
- `faq.title`: "FAQ"
- `faq.q1.q`: "Нужно ли открывать счёт в Midtrans?"
- `faq.q3.a`: "Сейчас сервис полностью бесплатен. В будущем комиссия составит 10%."

### 6. QR Code Management Interface

**List Layout**:
```typescript
<div className="flex items-center justify-between p-4 border rounded-lg">
  <div className="flex items-center gap-4">
    <QRCodeSVG value={qrCode.url} size={80} />
    <div>
      <h3>{qrCode.staff.name}</h3>
      <p>{qrCode.staff.role}</p>
      <p className="text-sm text-muted-foreground">
        Created: {formatDate(qrCode.createdAt)}
      </p>
    </div>
  </div>
  <div className="flex items-center gap-2">
    <Button variant="outline" onClick={() => handleDownload(qrCode.id)}>
      Download
    </Button>
    <Button 
      variant="destructive" 
      onClick={() => handleDelete(qrCode.id)}
    >
      Delete
    </Button>
  </div>
</div>
```

**Delete Confirmation**:
```typescript
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete QR Code?</AlertDialogTitle>
      <AlertDialogDescription>
        This will permanently delete the QR code for {staffName}. 
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={confirmDelete}>
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Delete API Route**:
```typescript
// app/api/venue/qr-codes/[id]/route.ts
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession()
  
  if (!session?.user?.venueId) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  try {
    await prisma.qRCode.delete({
      where: {
        id: params.id,
        staff: {
          venueId: session.user.venueId
        }
      }
    })
    
    return new Response(null, { status: 204 })
  } catch (error) {
    return new Response('Failed to delete QR code', { status: 500 })
  }
}
```

## Data Models

No schema changes required. Using existing QRCode model with cascade deletion.


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Navigation Login Button Direct Link
*For any* user clicking the Login button in the navigation header, the system should navigate directly to `/venue/login` without showing a dropdown menu.
**Validates: Requirements 1.1, 1.2**

### Property 2: Products Dropdown Hidden
*For any* user viewing the navigation header, the Products dropdown menu should not be visible or accessible.
**Validates: Requirements 1.3**

### Property 3: Problem Section Text Update
*For any* user viewing the Problem Section in Russian locale, the displayed text should match the new problem description and solution statement exactly.
**Validates: Requirements 2.1, 2.2**

### Property 4: Google Pay Button Rendering
*For any* user viewing the Problem Section phone mockup, a valid Google Pay button component should be rendered instead of text.
**Validates: Requirements 2.3**

### Property 5: Midtrans Logo Display
*For any* user viewing the payment security badge, the Midtrans logo image should be displayed instead of text.
**Validates: Requirements 2.4**

### Property 6: Product Demo Title Update
*For any* user viewing the Product Demo Section in Russian locale, the title should display "Понятно каждому гостю".
**Validates: Requirements 3.1**

### Property 7: Product Demo Feature Points
*For any* user viewing the Product Demo Section feature points in Russian locale, all three points should display the updated text.
**Validates: Requirements 3.2, 3.3, 3.4**

### Property 8: Benefits Section Text Updates
*For any* user viewing the Benefits Section in Russian locale, the business and guest benefit descriptions should match the new text.
**Validates: Requirements 4.1, 4.2**

### Property 9: FAQ Section Updates
*For any* user viewing the FAQ Section in Russian locale, the title should be "FAQ" and the specified questions/answers should be updated.
**Validates: Requirements 5.1, 5.2, 5.3**

### Property 10: QR Code List Layout
*For any* authenticated venue user viewing the QR codes page, QR codes should be displayed in a list layout with each entry showing QR image, staff name, and creation date.
**Validates: Requirements 6.1, 6.2**

### Property 11: QR Code Delete Button Presence
*For any* QR code entry in the list, a delete button should be visible and clickable.
**Validates: Requirements 6.3**

### Property 12: Delete Confirmation Dialog
*For any* delete button click, a confirmation dialog should appear before deletion occurs.
**Validates: Requirements 6.4**

### Property 13: QR Code Deletion Success
*For any* confirmed QR code deletion, the QR code should be removed from the database and the list should update to reflect the removal.
**Validates: Requirements 6.5, 6.6**

### Property 14: QR Code Deletion Error Handling
*For any* failed QR code deletion attempt, an error message should be displayed and the list state should remain unchanged.
**Validates: Requirements 6.7**

## Error Handling

### Landing Page Components
- **Translation Missing**: Fall back to English if Russian translation key is missing
- **Image Load Failure**: Show alt text for Midtrans logo and Google Pay button
- **Google Pay Button Error**: Fall back to styled button with text if Google Pay component fails

### QR Code Management
- **Unauthorized Access**: Redirect to login if session is invalid
- **Delete API Failure**: Show toast notification with error message
- **Network Error**: Show retry option with error details
- **Concurrent Deletion**: Handle race conditions with optimistic UI updates

### Error Messages
```typescript
const ERROR_MESSAGES = {
  DELETE_UNAUTHORIZED: 'You do not have permission to delete this QR code',
  DELETE_FAILED: 'Failed to delete QR code. Please try again.',
  DELETE_NOT_FOUND: 'QR code not found or already deleted',
  NETWORK_ERROR: 'Network error. Please check your connection.',
}
```

## Testing Strategy

### Unit Tests
- Test navigation button renders correct href
- Test translation keys resolve to correct text
- Test QR code list renders with correct layout
- Test delete button triggers confirmation dialog
- Test API route authorization logic

### Property-Based Tests
- Generate random QR code data and verify list rendering
- Generate random user sessions and verify authorization
- Test delete operations with various QR code states

### Integration Tests
- Test complete delete flow from button click to database removal
- Test navigation flow from landing to login
- Test translation switching between locales

### Manual Testing Checklist
- Verify Google Pay button appearance matches official guidelines
- Verify Midtrans logo displays correctly at all screen sizes
- Verify all Russian text updates are grammatically correct
- Verify QR code list is responsive on mobile devices
- Verify delete confirmation prevents accidental deletions

## Implementation Notes

### Google Pay Button
- Use official `@google-pay/button-react` package
- Follow [Google Pay button guidelines](https://developers.google.com/pay/api/web/guides/brand-guidelines)
- Use TEST environment for development
- Button should be full width in phone mockup

### Midtrans Logo
- Logo file should be in `/public/images/` directory
- Use SVG format for scalability
- Maintain aspect ratio
- Add proper alt text for accessibility

### QR Code Deletion
- Implement soft delete if needed for audit trail
- Consider adding "undo" functionality for accidental deletions
- Log deletion events for security audit
- Ensure cascade deletion of related data

### Performance Considerations
- Lazy load Google Pay button component
- Optimize Midtrans logo image size
- Implement pagination for QR code list if count > 50
- Use optimistic UI updates for delete operations

### Accessibility
- Ensure delete button has proper ARIA labels
- Confirmation dialog should trap focus
- All images must have descriptive alt text
- Maintain keyboard navigation for all interactive elements

### Security Considerations
- Verify user owns the venue before allowing deletion
- Validate QR code belongs to user's venue
- Rate limit delete API to prevent abuse
- Log all deletion attempts for audit
- Use NextAuth session validation
- Implement CSRF protection
