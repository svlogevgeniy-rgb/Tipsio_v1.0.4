# Design Document

## Overview

This design document outlines three independent marketing and branding improvements for the Tipsio Next.js application. The changes focus on visual brand consistency through colored payment logos, codebase cleanup by removing unused venue menu functionality, and establishing brand identity through favicon implementation. All modifications preserve existing business logic, maintain responsive design, and ensure production-ready build quality.

The application uses Next.js 14 with App Router, TypeScript, Tailwind CSS, and Prisma ORM. The design leverages existing infrastructure without introducing new dependencies or architectural changes.

## Architecture

### Task 1: Colored Payment Logos

**Current State:**
- Payment logos are stored in `/public/images/payment/`
- Logos are rendered with `grayscale` CSS filter and reduced opacity
- Current assets: visa.svg, mastercard.svg, google-pay-official.svg, googlepay.svg
- GoPay and OVO are rendered as text elements

**Target State:**
- Replace monochrome assets with colored versions from `/images/` folder
- Remove all color-suppressing CSS (grayscale, filter, opacity)
- Add colored logo assets for GoPay and OVO
- Maintain consistent sizing and alignment

**Affected Components:**
- `src/components/landing/main/sections.tsx` - Main landing page payment section
- `src/app/page.test.tsx` - Test component with payment logos
- Any other components rendering payment method logos

### Task 2: Venue Menu Removal

**Current State:**
- Route: `/src/app/venue/(dashboard)/menu/page.tsx`
- Components: `/src/components/venue/menu/` (6 files)
- Services: `/src/lib/menu.ts`, `/src/lib/menu-service.ts`, `/src/lib/menu-validation.ts`
- Types: `/src/types/menu.ts`
- Tests: `/src/lib/menu.test.ts`
- Hooks: `/src/components/venue/menu/use-venue-menu.ts`
- Navigation: Link in `/src/app/venue/(dashboard)/layout.tsx`

**Target State:**
- Complete removal of menu-specific code
- Navigation link removed from venue dashboard sidebar
- Route returns 404
- Shared utilities preserved if used elsewhere
- No broken imports or references

**Preservation Strategy:**
- Audit all menu-related files for shared code
- Extract and relocate any utilities used by other features
- Verify no database migrations or schema changes needed

### Task 3: Branded Favicon

**Current State:**
- No custom favicon configured
- Default Next.js favicon displayed
- Logo assets available: `/public/images/Logo_tipsio.svg`, `/public/images/tipsio-logo.svg`

**Target State:**
- Custom favicon using brand color #1E5F4B
- Multiple sizes: 16×16, 32×32, 180×180 (apple-touch-icon)
- Favicon.ico with embedded sizes
- Proper metadata configuration in Next.js layout

**Implementation Approach:**
- Generate favicon assets from existing logo
- Use brand color #1E5F4B as background or primary element
- Configure in `src/app/layout.tsx` metadata
- Place assets in `/public/` directory

## Components and Interfaces

### Task 1: Payment Logo Components

**Component Updates:**

```typescript
// src/components/landing/main/sections.tsx
// Current implementation with grayscale
<div className="flex flex-wrap justify-center items-center gap-8 opacity-60 grayscale">
  <Image src="/images/payment/visa.svg" alt="Visa" width={60} height={24} className="h-6 w-auto" />
  <Image src="/images/payment/mastercard.svg" alt="Mastercard" width={60} height={40} className="h-6 w-auto" />
  <Image src="/images/payment/google-pay-official.svg" alt="Google Pay" width={60} height={24} className="h-6 w-auto" />
  <div className="text-slate-700 font-semibold">GoPay</div>
  <div className="text-slate-700 font-semibold">OVO</div>
</div>

// Target implementation with colored logos
<div className="flex flex-wrap justify-center items-center gap-8">
  <Image src="/images/payment/visa-color.svg" alt="Visa" width={60} height={24} className="h-6 w-auto" />
  <Image src="/images/payment/mastercard-color.svg" alt="Mastercard" width={60} height={40} className="h-6 w-auto" />
  <Image src="/images/payment/google-pay-color.svg" alt="Google Pay" width={60} height={24} className="h-6 w-auto" />
  <Image src="/images/payment/gopay-color.svg" alt="GoPay" width={60} height={24} className="h-6 w-auto" />
  <Image src="/images/payment/ovo-color.svg" alt="OVO" width={60} height={24} className="h-6 w-auto" />
</div>
```

**Asset Management:**
- Copy colored assets from `/images/` to `/public/images/payment/`
- Naming convention: `{provider}-color.svg`
- Maintain aspect ratios and clarity at small sizes

### Task 2: Menu Feature Removal

**Files to Remove:**
```
/src/app/venue/(dashboard)/menu/page.tsx
/src/components/venue/menu/CategoryForm.tsx
/src/components/venue/menu/ItemCard.tsx
/src/components/venue/menu/ItemForm.tsx
/src/components/venue/menu/MenuManager.tsx
/src/components/venue/menu/PublicMenuView.tsx
/src/components/venue/menu/use-venue-menu.ts
/src/lib/menu.ts
/src/lib/menu-service.ts
/src/lib/menu-validation.ts
/src/lib/menu.test.ts
/src/types/menu.ts
```

**Navigation Update:**
```typescript
// src/app/venue/(dashboard)/layout.tsx
// Remove this navigation item:
{ href: "/venue/menu", labelKey: "menu", icon: UtensilsCrossed, showFor: ["POOLED", "PERSONAL"] }
```

**Shared Code Audit:**
- Check if any menu utilities are used by other features
- Verify no database schema dependencies
- Ensure no API routes depend on menu types

### Task 3: Favicon Configuration

**Metadata Configuration:**

```typescript
// src/app/layout.tsx
export const metadata: Metadata = {
  title: "TIPSIO — Digital Tips for Bali",
  description: "TIPSIO is the cashless tipping platform for modern Bali venues",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  }
};
```

**Asset Generation:**
- Source: `/public/images/tipsio-logo.svg`
- Brand color: #1E5F4B
- Output formats: ICO, PNG (multiple sizes)
- Placement: `/public/` directory root

## Data Models

No database schema changes required for any of the three tasks.

**Task 2 Consideration:**
- Verify if `menu` table exists in Prisma schema
- If exists and unused, consider marking for future cleanup
- Do not modify schema in this implementation to avoid migration complexity

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After reviewing the prework analysis, several properties can be consolidated:

- Properties 1.1 and 1.2 (Visa and Mastercard colored assets) can be combined into a single property about all payment logos using colored assets
- Property 1.3 is specific to one section and can remain separate
- Property 1.4 about no color-suppressing styles can be merged with the colored asset property
- Properties 2.1 and 3.1, 3.4, 4.1 are specific examples rather than universal properties

The consolidated properties focus on universal rules that apply across all instances, with specific examples handled separately in testing.

### Correctness Properties

**Property 1: Payment logo color preservation**
*For any* payment method logo element (Visa, Mastercard, GPay, OVO, GoPay) rendered in the application, the image source should point to a colored asset file and the element should not have grayscale, filter with desaturation, or opacity-reducing styles applied.
**Validates: Requirements 1.1, 1.2, 1.4**

**Property 2: Payment section logo completeness**
*For any* "Guests pay in familiar ways" section, all payment methods (GPay, OVO, GoPay) should be rendered as image elements with valid src attributes, not as text elements.
**Validates: Requirements 1.3**

**Property 3: Navigation menu exclusion**
*For any* navigation component in the venue dashboard, there should be no navigation items with href="/venue/menu" or labelKey="menu".
**Validates: Requirements 2.3**

### Example Test Cases

**Example 1: Menu route returns 404**
When navigating to /venue/menu, the application should return a 404 status code.
**Validates: Requirements 2.1**

**Example 2: Favicon metadata present**
When the application HTML is rendered, the head section should contain link tags for favicon-16x16.png, favicon-32x32.png, favicon.ico, and apple-touch-icon.png.
**Validates: Requirements 3.1, 3.4**

**Example 3: Build succeeds**
When executing `npm run build`, the command should exit with code 0 and produce no error messages.
**Validates: Requirements 4.1**

## Error Handling

### Task 1: Payment Logo Errors

**Missing Asset Files:**
- If colored logo assets are not found, Next.js Image component will show broken image
- Mitigation: Verify all assets exist before deployment
- Fallback: Keep original assets as backup during transition

**CSS Conflicts:**
- Global styles might reintroduce grayscale filters
- Mitigation: Use specific selectors to override global styles
- Verification: Visual inspection and computed style testing

### Task 2: Menu Removal Errors

**Broken Imports:**
- Removing files may break imports in other modules
- Mitigation: Search entire codebase for menu-related imports before deletion
- Verification: TypeScript compilation and build process

**Database References:**
- Menu data may exist in database
- Mitigation: This implementation does not modify database schema
- Future consideration: Data migration if menu table exists

**Navigation Errors:**
- Users with bookmarked /venue/menu links
- Mitigation: Route naturally returns 404 (Next.js default behavior)
- No special error handling needed

### Task 3: Favicon Errors

**Asset Generation Failures:**
- Favicon generation tools may fail
- Mitigation: Manual verification of generated assets
- Fallback: Use existing logo as temporary favicon

**Browser Caching:**
- Old favicon may persist in browser cache
- Mitigation: Use versioned filenames or cache-busting
- User action: Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

**Format Compatibility:**
- Some browsers may not support certain formats
- Mitigation: Provide multiple formats (ICO, PNG)
- Verification: Test in major browsers (Chrome, Safari, Firefox)

## Testing Strategy

This feature uses a dual testing approach combining unit tests for specific examples and property-based tests for universal properties.

### Unit Testing

Unit tests will verify specific examples and edge cases:

**Task 1: Payment Logos**
- Verify specific logo files exist in `/public/images/payment/`
- Test that landing page component renders expected image elements
- Verify no grayscale class is present in payment logo containers

**Task 2: Menu Removal**
- Test that /venue/menu route returns 404
- Verify navigation array does not contain menu item
- Test that venue dashboard loads without errors

**Task 3: Favicon**
- Verify favicon files exist in `/public/` directory
- Test that layout metadata includes correct icon configuration
- Verify apple-touch-icon is configured

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using the `fast-check` library (already in dependencies).

**Configuration:**
- Minimum 100 iterations per property test
- Use `fast-check` library for property generation
- Each test tagged with format: `**Feature: marketing-improvements, Property {number}: {property_text}**`

**Property Test 1: Payment logo color preservation**
- Generate: Random payment method names from allowed list
- Test: For each method, verify image src contains "color" and no grayscale styles
- Validates: Property 1

**Property Test 2: Payment section logo completeness**
- Generate: Random payment section component instances
- Test: Verify GPay, OVO, GoPay are img elements, not text
- Validates: Property 2

**Property Test 3: Navigation menu exclusion**
- Generate: Random navigation configurations
- Test: Verify no items have href="/venue/menu"
- Validates: Property 3

### Integration Testing

**Build Verification:**
- Run `npm run build` and verify exit code 0
- Check build output for warnings related to changed files
- Verify no TypeScript errors

**Visual Regression:**
- Manual verification of payment logo colors
- Screenshot comparison of landing page before/after
- Favicon display in multiple browsers

**Route Testing:**
- Verify /venue/menu returns 404
- Verify other venue routes still work
- Test navigation flow in venue dashboard

### Test Execution Order

1. Unit tests for file existence and basic structure
2. Property-based tests for universal rules
3. Integration tests for build and routing
4. Manual visual verification

### Success Criteria

- All unit tests pass
- All property-based tests pass (100 iterations each)
- `npm run build` completes without errors
- No runtime errors in browser console
- Visual verification confirms colored logos and favicon display

## Implementation Notes

### Task 1: Asset Migration Strategy

1. Identify colored assets in `/images/` folder
2. Copy to `/public/images/payment/` with `-color` suffix
3. Update all Image component src attributes
4. Remove grayscale and opacity classes
5. Verify visual appearance in browser

### Task 2: Safe Deletion Process

1. Search codebase for all menu-related imports
2. Identify any shared utilities
3. Remove navigation link first (smallest change)
4. Delete route page
5. Delete components
6. Delete services and types
7. Run build after each major deletion
8. Verify no broken imports

### Task 3: Favicon Generation

1. Export logo SVG to PNG at high resolution
2. Use online tool or ImageMagick to generate sizes
3. Apply brand color #1E5F4B as background
4. Generate ICO file with embedded 16×16 and 32×32
5. Place all files in `/public/` root
6. Update layout.tsx metadata
7. Test in multiple browsers

### Responsive Design Considerations

**Payment Logos:**
- Use `h-6 w-auto` to maintain aspect ratio
- Flex wrap for mobile layout
- Consistent gap spacing (gap-8)

**Navigation:**
- Sidebar navigation already responsive
- Removing menu item maintains existing responsive behavior

**Favicon:**
- No responsive considerations (fixed sizes)
- Ensure clarity at smallest size (16×16)

### Browser Compatibility

**Payment Logos:**
- SVG support: All modern browsers
- Next.js Image optimization: Automatic WebP conversion

**Favicon:**
- ICO format: Universal support
- PNG format: Modern browsers
- Apple touch icon: iOS Safari

### Performance Considerations

**Payment Logos:**
- Colored SVGs may be slightly larger than monochrome
- Next.js Image component handles optimization
- No significant performance impact expected

**Menu Removal:**
- Reduces bundle size by removing unused code
- Improves build time
- Positive performance impact

**Favicon:**
- Small file sizes (< 10KB total)
- Cached by browser
- Negligible performance impact

## Deployment Checklist

1. **Pre-deployment:**
   - Verify all colored logo assets exist
   - Run full test suite
   - Build succeeds without errors
   - Visual verification in development

2. **Deployment:**
   - Deploy to staging environment
   - Test all three changes in staging
   - Verify favicon displays correctly
   - Test /venue/menu returns 404
   - Verify payment logos are colored

3. **Post-deployment:**
   - Monitor error logs for broken imports
   - Verify favicon in production
   - Check payment logo display on live site
   - Confirm no regression in other features

4. **Rollback Plan:**
   - Keep original assets as backup
   - Git revert available for quick rollback
   - No database changes to revert
