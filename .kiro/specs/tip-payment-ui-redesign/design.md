# Design Document: Tip Payment UI Redesign

## Overview

This design document outlines the UI/UX improvements for the tip payment pages (payment page and success page) to match the provided reference scans. The redesign focuses on three key areas:

1. **Visual Design Alignment**: Match layout, typography, spacing, and component arrangement to reference scans
2. **Staff Photo Display**: Implement proper avatar display with placeholders for missing photos
3. **Internationalization**: Full i18n support for RU/EN/ID languages

The design preserves all existing business logic, payment processing, and Midtrans integration while modernizing the user interface.

## Architecture

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **UI Components**: shadcn/ui (Card, Button, Badge, Separator, Skeleton, Alert, Avatar)
- **Styling**: Tailwind CSS
- **i18n**: next-intl (already integrated)
- **Payment**: Midtrans Snap (existing integration)
- **Image Handling**: Next.js Image component with optimization

### Page Structure

```
src/app/tip/
├── [shortCode]/
│   └── page.tsx          # Payment page (staff selection + amount input)
├── success/
│   └── page.tsx          # Success confirmation page
├── pending/
│   └── page.tsx          # Payment pending page (unchanged)
└── error/
    └── page.tsx          # Error page (unchanged)
```

## Components and Interfaces

### 1. Staff Avatar Component

A reusable component for displaying staff photos with proper fallback handling.

**Component**: `StaffAvatar.tsx`

```typescript
interface StaffAvatarProps {
  src: string | null;
  alt: string;
  size: 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Features**:
- Fixed dimensions to prevent CLS (Cumulative Layout Shift)
- Skeleton loading state during image load
- Placeholder avatar when no photo available
- Proper object-fit for image scaling
- Accessible alt text

**Size Mapping**:
- `sm`: 48x48px (staff selection cards)
- `md`: 64x64px (payment page header)
- `lg`: 96x96px (success page)

### 2. Payment Page Redesign

**Route**: `/tip/[shortCode]`

**Layout Structure** (based on reference scans):

```
┌─────────────────────────────────────┐
│ Header: Venue Logo + Language       │
├─────────────────────────────────────┤
│                                     │
│  "Who would you like to thank?"    │
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │ Avatar   │  │ Avatar   │       │
│  │ Name     │  │ Name     │       │
│  │ Role     │  │ Role     │       │
│  └──────────┘  └──────────┘       │
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │ Avatar   │  │ Avatar   │       │
│  │ Name     │  │ Name     │       │
│  │ Role     │  │ Role     │       │
│  └──────────┘  └──────────┘       │
│                                     │
│  Footer: "tips'yo - service..."    │
└─────────────────────────────────────┘
```

**Key Changes**:
1. Simplified header with venue info
2. Grid layout for staff selection (2 columns on mobile, 3-4 on desktop)
3. Prominent staff avatars with names and roles
4. Clean card-based design using shadcn/ui Card component
5. Sticky footer with branding

### 3. Tip Amount Page

**Route**: `/tip/[shortCode]` (after staff selection)

**Layout Structure**:

```
┌─────────────────────────────────────┐
│ Back Arrow + "tips'yo"              │
├─────────────────────────────────────┤
│                                     │
│  Staff Name                         │
│  Role at Venue                      │
│                          [Avatar]   │
│                                     │
│  Tip Amount                         │
│  ┌─────────────────────────────┐   │
│  │ Amount Input                │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌────┐ ┌────┐ ┌────┐             │
│  │ 50 │ │100 │ │150 │             │
│  └────┘ └────┘ └────┘             │
│                                     │
│  Your Experience                    │
│  😐 😊 🙂 😍 ✕                     │
│                                     │
│  Message                            │
│  ┌─────────────────────────────┐   │
│  │ Add a message...            │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Footer: "tips'yo - service..."    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Send 100                    │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Key Changes**:
1. Staff info with avatar in header
2. Preset amount buttons (Rp 50, 100, 150)
3. Custom amount input with number spinner
4. Experience rating with emoji buttons
5. Optional message textarea with character counter
6. Fixed bottom CTA button with amount display

### 4. Success Page Redesign

**Route**: `/tip/success`

**Layout Structure**:

```
┌─────────────────────────────────────┐
│ Back Arrow + "tips'yo"              │
├─────────────────────────────────────┤
│                                     │
│                                     │
│          [Success Icon]             │
│                                     │
│      Thank you! 🙌                  │
│                                     │
│  Your tip has been sent             │
│  successfully                       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Amount: Rp 100              │   │
│  │ To: Staff Name              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Your support helps us...           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Close                       │   │
│  └─────────────────────────────┘   │
│                                     │
│  Footer: "tips'yo - service..."    │
└─────────────────────────────────────┘
```

**Key Changes**:
1. Centered success icon with animation
2. Clear success message
3. Summary card with amount and recipient
4. Supportive message text
5. Close button to dismiss

## Data Models

### Staff Interface

```typescript
interface Staff {
  id: string;
  displayName: string;
  avatarUrl: string | null;  // URL to staff photo or null
  role: string;
}
```

### QR Data Interface

```typescript
interface QrData {
  id: string;
  type: "PERSONAL" | "TABLE" | "VENUE";
  label: string | null;
  venue: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  staff: Staff | null;
  availableStaff: Staff[];
}
```

### Tip Details Interface

```typescript
interface TipDetails {
  amount: number;
  staffName: string | null;
  venueName: string;
  staffAvatarUrl?: string | null;  // Added for success page
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Staff Photo Display

*For any* staff member with a non-null avatarUrl, the rendered avatar component should display an image element with src matching the avatarUrl.

**Validates: Requirements 2.1**

### Property 2: Staff Placeholder Display

*For any* staff member with a null avatarUrl, the rendered avatar component should display a placeholder icon or default avatar image.

**Validates: Requirements 2.2**

### Property 3: Consistent Avatar Dimensions

*For any* page rendering staff avatars, all avatar containers should have consistent width and height dimensions based on their size variant (sm/md/lg).

**Validates: Requirements 2.3**

### Property 4: Skeleton Loading State

*For any* staff avatar that is loading, a skeleton placeholder should be rendered before the image loads to prevent layout shift.

**Validates: Requirements 2.5**

### Property 5: Meaningful Alt Text

*For any* staff avatar image, the alt attribute should contain either the staff member's name or a meaningful fallback like "Staff photo".

**Validates: Requirements 2.6**

### Property 6: Complete i18n Coverage

*For any* static text element on Payment_Page or Success_Page, a corresponding translation key should exist in all three language files (en.json, ru.json, id.json).

**Validates: Requirements 3.1, 3.4, 3.5, 3.6, 3.7, 3.8**

### Property 7: Language Switching Without Reload

*For any* language switch action, all text content should update to the new language without triggering a full page reload.

**Validates: Requirements 3.3**

### Property 8: Backend Status Mapping

*For any* backend-provided status key, the system should map it to a corresponding i18n translation key for display.

**Validates: Requirements 3.9**

### Property 9: Success Page Query Parameter Handling

*For any* set of query parameters on Success_Page, the system should display success state when parameters are valid, and error state when parameters are invalid or missing.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 10: No Console Errors

*For any* page render after UI changes, the browser console should contain no error messages.

**Validates: Requirements 6.4**

### Property 11: CLS Prevention

*For any* staff avatar container, explicit width and height should be set to prevent Cumulative Layout Shift during image loading.

**Validates: Requirements 7.1**

### Property 12: Loading State Display

*For any* asynchronous content loading, a skeleton or loading indicator should be visible until content is ready.

**Validates: Requirements 7.2**

### Property 13: Accessibility Compliance

*For any* page, the HTML structure should use semantic elements, all interactive elements should be keyboard accessible, and appropriate ARIA labels should be present where needed.

**Validates: Requirements 7.3, 7.4, 7.5**

## Error Handling

### Image Loading Errors

**Scenario**: Staff photo fails to load (404, network error, CORS issue)

**Handling**:
1. Catch image load error event
2. Fall back to placeholder avatar
3. Log error for monitoring (non-blocking)
4. Ensure no broken image icon is shown

**Implementation**:
```typescript
<Image
  src={avatarUrl}
  alt={displayName}
  onError={(e) => {
    e.currentTarget.src = '/placeholder-avatar.svg';
  }}
/>
```

### Missing Translation Keys

**Scenario**: Translation key not found in language file

**Handling**:
1. next-intl will show the key name as fallback
2. Log missing key for developer attention
3. System remains functional with English fallback

**Prevention**:
- Run i18n validation script before deployment
- Use TypeScript for translation key type safety

### Invalid Query Parameters

**Scenario**: Success page accessed with malformed or missing parameters

**Handling**:
1. Validate query parameters on page load
2. Show user-friendly error state
3. Provide "Try again" action
4. Log invalid access for monitoring

### Network Failures

**Scenario**: API call to fetch tip details fails

**Handling**:
1. Show loading state during fetch
2. Display error message on failure
3. Provide retry button
4. Maintain existing error handling patterns

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

1. **StaffAvatar Component**
   - Renders image when avatarUrl is provided
   - Renders placeholder when avatarUrl is null
   - Applies correct size classes
   - Shows skeleton during loading
   - Handles image load errors

2. **i18n Integration**
   - All translation keys exist in all languages
   - Language switcher updates locale
   - Formatted currency displays correctly

3. **Success Page**
   - Valid parameters show success state
   - Invalid parameters show error state
   - Missing order_id shows error state

### Property-Based Tests

Property-based tests will verify universal properties across all inputs using **fast-check** library (already in package.json):

1. **Property 1-2: Staff Photo Display**
   - Generate random staff objects with/without avatarUrl
   - Verify correct rendering for all cases

2. **Property 3: Consistent Avatar Dimensions**
   - Generate random staff lists
   - Verify all avatars have consistent dimensions

3. **Property 6: Complete i18n Coverage**
   - Generate list of all text keys used in components
   - Verify each key exists in all language files

4. **Property 9: Query Parameter Handling**
   - Generate random valid/invalid query parameter combinations
   - Verify correct state display for all cases

5. **Property 13: Accessibility Compliance**
   - Generate random page states
   - Verify semantic HTML and ARIA labels present

**Test Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with: `Feature: tip-payment-ui-redesign, Property {number}: {property_text}`

### Integration Tests

Integration tests will verify end-to-end flows:

1. **Payment Flow**
   - User selects staff → sees amount page → completes payment
   - Verify all UI states transition correctly
   - Verify i18n works throughout flow

2. **Success Flow**
   - Payment completes → redirects to success page
   - Verify correct data displayed
   - Verify language persists

### Visual Regression Tests

While not automated in this spec, visual regression testing is recommended:

1. Capture screenshots at 375px, 768px, 1440px
2. Compare against reference scans
3. Flag any layout differences for manual review

## Implementation Notes

### Responsive Breakpoints

```css
/* Mobile-first approach */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small desktops */
xl: 1440px  /* Large desktops */
```

### Avatar Sizes

```typescript
const AVATAR_SIZES = {
  sm: 'w-12 h-12',  // 48px - staff selection cards
  md: 'w-16 h-16',  // 64px - payment page header
  lg: 'w-24 h-24',  // 96px - success page
};
```

### Color Palette

Following existing design system:
- Primary: Cyan/Blue gradient (`from-cyan-500 to-blue-600`)
- Background: Dark slate (`slate-900`, `slate-800`)
- Text: White with slate variants for secondary text
- Success: Green (`green-400`, `green-500`)
- Error: Red (`red-400`, `red-500`)

### Typography Scale

```css
/* Headings */
h1: text-2xl font-bold
h2: text-xl font-semibold
h3: text-lg font-medium

/* Body */
body: text-base
small: text-sm
tiny: text-xs
```

### Spacing System

Using Tailwind's spacing scale (4px base):
- Tight: p-2, gap-2 (8px)
- Normal: p-4, gap-4 (16px)
- Relaxed: p-6, gap-6 (24px)
- Loose: p-8, gap-8 (32px)

### Animation Guidelines

- Use subtle transitions for state changes
- Skeleton pulse animation for loading states
- Success icon animation on success page
- Keep animations under 300ms for responsiveness

### Accessibility Requirements

1. **Keyboard Navigation**
   - All interactive elements focusable
   - Visible focus indicators
   - Logical tab order

2. **Screen Readers**
   - Semantic HTML (header, main, footer, nav)
   - ARIA labels for icon buttons
   - Alt text for all images
   - Status announcements for dynamic content

3. **Color Contrast**
   - Minimum 4.5:1 for normal text
   - Minimum 3:1 for large text
   - Don't rely on color alone for information

4. **Touch Targets**
   - Minimum 44x44px for mobile
   - Adequate spacing between interactive elements

## Migration Strategy

### Phase 1: Component Creation
1. Create StaffAvatar component
2. Add missing i18n keys
3. Update shadcn/ui components if needed

### Phase 2: Payment Page Update
1. Update layout to match reference scan
2. Integrate StaffAvatar component
3. Add i18n to all text
4. Test responsive behavior

### Phase 3: Success Page Update
1. Update layout to match reference scan
2. Add staff avatar to success display
3. Add i18n to all text
4. Test query parameter handling

### Phase 4: Testing & QA
1. Run unit tests
2. Run property-based tests
3. Manual QA at all breakpoints
4. Accessibility audit
5. Cross-browser testing

### Rollback Plan

If issues arise:
1. Feature flag to toggle new UI
2. Revert to previous version via Git
3. Monitor error rates and user feedback
4. Fix issues and redeploy

## Performance Considerations

### Image Optimization

- Use Next.js Image component for automatic optimization
- Serve WebP format with fallbacks
- Lazy load images below the fold
- Set explicit width/height to prevent CLS

### Bundle Size

- Tree-shake unused shadcn/ui components
- Code-split by route (already done with App Router)
- Monitor bundle size impact

### Loading Performance

- Prefetch critical resources
- Use skeleton loaders for perceived performance
- Minimize layout shifts
- Optimize font loading

## Security Considerations

### XSS Prevention

- All user input sanitized (already handled by React)
- Avatar URLs validated before rendering
- No dangerouslySetInnerHTML usage

### CSRF Protection

- Existing Midtrans integration handles CSRF
- No changes to payment flow security

### Data Privacy

- No PII stored in localStorage
- Avatar URLs served over HTTPS
- Comply with existing privacy policies

## Monitoring & Analytics

### Metrics to Track

1. **Performance**
   - Page load time
   - Time to Interactive (TTI)
   - Cumulative Layout Shift (CLS)
   - Largest Contentful Paint (LCP)

2. **User Behavior**
   - Language selection distribution
   - Staff selection patterns
   - Payment completion rate
   - Error rate by type

3. **Technical**
   - Image load failures
   - Missing translation keys
   - Console errors
   - API response times

### Error Tracking

- Log image load failures
- Track missing i18n keys
- Monitor query parameter validation failures
- Alert on increased error rates

## Future Enhancements

### Potential Improvements

1. **Animations**
   - Smooth transitions between pages
   - Micro-interactions on button clicks
   - Success celebration animation

2. **Personalization**
   - Remember language preference
   - Show recently tipped staff
   - Suggest tip amounts based on history

3. **Accessibility**
   - High contrast mode
   - Font size adjustment
   - Reduced motion mode

4. **Performance**
   - Progressive Web App (PWA) support
   - Offline mode for basic functionality
   - Image preloading for faster navigation

## Conclusion

This design provides a comprehensive plan for updating the tip payment UI to match the reference scans while maintaining all existing functionality. The focus on proper avatar handling, complete i18n support, and responsive design will create a polished, professional experience for users across all devices and languages.

The property-based testing approach ensures correctness across a wide range of inputs, while the phased migration strategy minimizes risk. By preserving all business logic and payment integration, we can confidently deploy these UI improvements without impacting core functionality.
