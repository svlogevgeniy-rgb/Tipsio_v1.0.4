# TIPS-54: Admin QR Codes Page Updates

## Overview
Update the venue QR codes page (`/venue/qr-codes`) with internationalization support, mobile-friendly filters, and corrected material format (A5 for table tent).

## User Stories

### US-1: Multilingual QR Codes Page
**As a** venue administrator  
**I want** the QR codes page to display in my selected language (English, Indonesian, or Russian)  
**So that** I can manage QR codes in my preferred language

**Acceptance Criteria:**
- All UI text translates when language is changed
- Page title changes to "Venue QR Codes" (EN), "Kode QR Venue" (ID), "QR-коды заведения" (RU)
- Filter tabs, buttons, labels, and messages are translated
- Material generator labels and descriptions are translated
- No hardcoded Russian text remains

### US-2: Mobile-Friendly Filter Tabs
**As a** venue administrator on mobile  
**I want** filter tabs to scroll horizontally  
**So that** I can access all filters without text overlap

**Acceptance Criteria:**
- Filter tabs use horizontal scroll on mobile (not fixed grid)
- All three tabs are accessible via swipe/scroll
- No text truncation or overlap
- Active tab is clearly visible
- Tap targets meet minimum size requirements (44x44px)

### US-3: Correct Table Tent Format
**As a** venue administrator  
**I want** table tent materials to show A5 format  
**So that** I know the correct paper size to use

**Acceptance Criteria:**
- Table tent description shows "А5" in all languages
- Description updated from previous "А4" format
- Change applies to material selector and generated PDFs

### US-4: Localized Material Types
**As a** venue administrator  
**I want** material type labels in my language  
**So that** I understand what each format is for

**Acceptance Criteria:**
- Material type labels display in current language
- Material type descriptions display in current language
- Indonesian translations available for all material types
- Locale detection works correctly

## Requirements

### Functional Requirements

#### FR-1: Page Title Translation
- Page title must use translation key `venue.qr.title`
- Must display correctly in EN, ID, RU

#### FR-2: Filter Tabs
- Three filter tabs: All, Team QR, Individual QR
- Must use translation keys: `filterAll`, `filterTeam`, `filterIndividual`
- Must scroll horizontally on mobile (< 640px width)
- Must filter QR codes correctly by type

#### FR-3: Action Buttons
- Create button: `createQrButton`
- Edit button: `edit`
- Delete button: `delete`
- Open button: `open` (already translated)
- All buttons must be translated

#### FR-4: QR Code Display
- Employee count must use `employees` translation key
- Empty states must use `emptyStateAll`, `emptyStateTeam`, `emptyStateIndividual`
- Must show correct empty state based on active filter

#### FR-5: Delete Dialog
- Dialog title: `deleteQrTitle`
- Dialog description: `deleteQrDescription`
- Cancel button: `deleteQrCancel`
- Confirm button: `deleteQrConfirm`
- Error message: `failedToDelete`

#### FR-6: Material Generator
- Format label: `materialFormat`
- CTA text label: `ctaText`
- CTA placeholder: `ctaPlaceholder`
- Logo label: `venueLogo`
- Upload button: `uploadLogo` / `changeLogo`
- Background label: `backgroundColor`
- Download button: `downloadPdf`
- Loading states: `generating`, `loading`

#### FR-7: Material Types
- Must use locale-aware labels: `type.label[locale]`
- Must use locale-aware descriptions: `type.description[locale]`
- Table tent must show "А5" format
- Indonesian translations must be available

### Non-Functional Requirements

#### NFR-1: Performance
- Language switching must be instant (< 100ms)
- Filter switching must be instant (< 100ms)
- Page load must complete within 2 seconds

#### NFR-2: Compatibility
- Must work on desktop (1920x1080)
- Must work on tablet (768x1024)
- Must work on mobile (375x667)
- Must support Chrome, Safari, Firefox, Edge

#### NFR-3: Accessibility
- All interactive elements must be keyboard accessible
- Focus indicators must be visible
- Screen reader labels must be descriptive
- Color contrast must meet WCAG AA standards

#### NFR-4: Code Quality
- No TypeScript errors
- No ESLint warnings
- All translation keys must be defined
- No hardcoded text strings

## Technical Specifications

### Translation Keys Structure
```json
{
  "venue": {
    "qr": {
      "filterAll": "...",
      "filterTeam": "...",
      "filterIndividual": "...",
      "createQrButton": "...",
      "edit": "...",
      "delete": "...",
      "employees": "...",
      "deleteQrTitle": "...",
      "deleteQrDescription": "...",
      "deleteQrCancel": "...",
      "deleteQrConfirm": "...",
      "failedToDelete": "...",
      "emptyStateAll": "...",
      "emptyStateTeam": "...",
      "emptyStateIndividual": "...",
      "materialFormat": "...",
      "ctaText": "...",
      "ctaPlaceholder": "...",
      "venueLogo": "...",
      "uploadLogo": "...",
      "changeLogo": "...",
      "backgroundColor": "...",
      "downloadPdf": "...",
      "generating": "...",
      "loading": "..."
    }
  }
}
```

### Material Types Structure
```typescript
{
  id: "table-tent",
  label: { ru: "Тейбл-тент", en: "Table Tent", id: "Tenda Meja" },
  description: { ru: "Домик на стол (А5)", en: "Table stand (A5)", id: "Dudukan meja (A5)" }
}
```

### Mobile Filter Tabs
```tsx
<TabsList className="flex overflow-x-auto w-full max-w-md">
  <TabsTrigger value="all" className="flex-1 whitespace-nowrap">
    {t('filterAll')}
  </TabsTrigger>
  {/* ... */}
</TabsList>
```

### Locale Detection
```tsx
const locale = useLocale() as 'ru' | 'en' | 'id';
// Use locale to access material type labels
<div>{type.label[locale]}</div>
```

## Out of Scope
- Creating new QR codes (handled by CreateQrDialog)
- Editing team QR codes (handled by EditTeamQrDialog)
- QR code generation logic (already implemented)
- PDF template changes (only text translations)
- Backend API changes (no API modifications needed)

## Dependencies
- `@/i18n/client` - useTranslations, useLocale hooks
- `messages/en.json`, `messages/id.json`, `messages/ru.json` - Translation files
- `src/lib/qr-materials.ts` - Material types definitions

## Success Criteria
1. All UI text is translated in EN, ID, RU
2. Filter tabs scroll horizontally on mobile
3. Table tent shows A5 format in all languages
4. Material types display in current language
5. No TypeScript or ESLint errors
6. All translation keys defined in all language files
7. QA checklist passes 100%

## Related Tasks
- TIPS-52: Venue Profile Simplification (Complete)
- TIPS-53: Landing Page Footer & Problem Section Updates (Complete)
