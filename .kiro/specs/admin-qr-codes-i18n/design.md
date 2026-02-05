# TIPS-54: Admin QR Codes Page Updates - Design Document

## Overview
This document describes the design decisions and implementation approach for internationalizing the venue QR codes page.

## Design Goals
1. **Complete i18n coverage** - All UI text must be translatable
2. **Mobile-first filters** - Filter tabs must work well on small screens
3. **Locale-aware materials** - Material types must display in user's language
4. **Consistent UX** - Maintain existing functionality while adding translations
5. **Zero breaking changes** - No changes to business logic or API

## Architecture

### Component Structure
```
/venue/qr-codes (page.tsx)
├── Filter Tabs (Tabs component)
├── QR Code List (Card components)
│   ├── Individual QR Cards
│   └── Team QR Cards
├── Material Generator (QrGenerator component)
│   ├── Material Type Selector
│   ├── CTA Text Input
│   ├── Logo Upload
│   ├── Color Picker
│   └── PDF Download
├── Create QR Dialog (CreateQrDialog)
├── Edit Team QR Dialog (EditTeamQrDialog)
└── Delete Confirmation Dialog (AlertDialog)
```

### Translation Architecture
```
messages/
├── en.json
├── id.json
└── ru.json
    └── venue.qr.*
        ├── UI labels
        ├── Button texts
        ├── Empty states
        └── Error messages
```

### Locale Detection Flow
```
User selects language
    ↓
useLocale() hook returns current locale
    ↓
Components use locale to:
    ├── Access translation keys via t()
    └── Select material type labels via type.label[locale]
```

## Design Decisions

### 1. Filter Tabs Layout

**Problem:** Fixed 3-column grid causes text overlap on mobile for longer translations.

**Solution:** Use horizontal scrolling layout.

```tsx
// Before (Fixed Grid)
<TabsList className="grid w-full grid-cols-3 max-w-md">
  <TabsTrigger value="all">Все</TabsTrigger>
  <TabsTrigger value="team">Командный QR</TabsTrigger>
  <TabsTrigger value="individual">Индивидуальный QR</TabsTrigger>
</TabsList>

// After (Horizontal Scroll)
<TabsList className="flex overflow-x-auto w-full max-w-md">
  <TabsTrigger value="all" className="flex-1 whitespace-nowrap">
    {t('filterAll')}
  </TabsTrigger>
  <TabsTrigger value="team" className="flex-1 whitespace-nowrap">
    {t('filterTeam')}
  </TabsTrigger>
  <TabsTrigger value="individual" className="flex-1 whitespace-nowrap">
    {t('filterIndividual')}
  </TabsTrigger>
</TabsList>
```

**Benefits:**
- No text truncation or overlap
- Works with any translation length
- Native mobile scroll behavior
- Maintains desktop appearance

### 2. Material Type Localization

**Problem:** Material types were hardcoded to Russian labels.

**Solution:** Use locale-aware object structure.

```typescript
// Material Type Structure
{
  id: "table-tent",
  label: {
    ru: "Тейбл-тент",
    en: "Table Tent",
    id: "Tenda Meja"
  },
  description: {
    ru: "Домик на стол (А5)",
    en: "Table stand (A5)",
    id: "Dudukan meja (A5)"
  }
}

// Usage in Component
const locale = useLocale() as 'ru' | 'en' | 'id';
<div>{type.label[locale]}</div>
<div>{type.description[locale]}</div>
```

**Benefits:**
- Single source of truth for material types
- Type-safe locale access
- Easy to add new languages
- No separate translation files needed

### 3. Empty State Messages

**Problem:** Empty states need to change based on active filter.

**Solution:** Use dynamic translation key selection.

```tsx
const getEmptyStateMessage = (filter: QrFilter) => {
  switch (filter) {
    case 'all':
      return t('emptyStateAll');
    case 'team':
      return t('emptyStateTeam');
    case 'individual':
      return t('emptyStateIndividual');
    default:
      return t('emptyStateAll');
  }
};
```

**Benefits:**
- Context-aware messages
- Clear user guidance
- Consistent with filter selection

### 4. Translation Key Naming

**Convention:** Use descriptive, action-oriented names.

```json
{
  "createQrButton": "Create QR",        // Action + Element
  "deleteQrTitle": "Delete QR code?",   // Context + Element
  "emptyStateAll": "...",               // State + Context
  "materialFormat": "Material format",  // Feature + Property
  "employees": "employees"              // Standalone noun
}
```

**Benefits:**
- Self-documenting code
- Easy to find and update
- Consistent naming pattern
- Clear context for translators

### 5. A5 Format Correction

**Problem:** Table tent was incorrectly labeled as A4.

**Solution:** Update description in all languages.

```typescript
{
  id: "table-tent",
  description: {
    ru: "Домик на стол (А5)",  // Changed from А4
    en: "Table stand (A5)",     // Changed from A4
    id: "Dudukan meja (A5)"     // Changed from A4
  }
}
```

**Impact:**
- Correct paper size information
- Matches actual PDF output
- Prevents printing errors

## UI/UX Considerations

### Language Switching
- **Instant feedback** - No page reload required
- **Persistent state** - Filter selection and QR selection maintained
- **Smooth transition** - All text updates simultaneously

### Mobile Experience
- **Touch-friendly** - All tap targets ≥ 44x44px
- **Scrollable filters** - Natural swipe gesture
- **Readable text** - No truncation or overlap
- **Responsive layout** - Cards stack vertically

### Accessibility
- **Keyboard navigation** - All interactive elements accessible
- **Focus indicators** - Visible focus states
- **Screen reader support** - Proper ARIA labels
- **Color contrast** - WCAG AA compliant

## Translation Guidelines

### For Translators

#### Button Text
- Keep short and action-oriented
- Use imperative mood (e.g., "Create", "Delete")
- Maintain consistent terminology

#### Labels
- Use sentence case (not title case)
- Be descriptive but concise
- Match existing UI patterns

#### Error Messages
- Be clear and specific
- Suggest next action if possible
- Use friendly, non-technical language

#### Empty States
- Be encouraging, not negative
- Suggest action to resolve
- Keep tone consistent with brand

### Translation Examples

| Key | English | Indonesian | Russian | Notes |
|-----|---------|-----------|---------|-------|
| `createQrButton` | Create QR | Buat QR | Создать QR | Action button |
| `employees` | employees | staf | сотрудников | Lowercase, plural |
| `emptyStateAll` | You don't have any QR codes yet | Anda belum memiliki kode QR | У вас пока нет QR-кодов | Encouraging tone |
| `deleteQrTitle` | Delete QR code? | Hapus kode QR? | Удалить QR-код? | Question format |

## Technical Constraints

### Browser Support
- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+

### Performance Targets
- Language switch: < 100ms
- Filter switch: < 100ms
- Page load: < 2s
- PDF generation: < 3s

### Code Quality
- TypeScript strict mode
- ESLint rules enforced
- No console errors
- 100% translation coverage

## Testing Strategy

### Unit Tests (Not in scope)
- Translation key existence
- Locale detection
- Filter logic

### Integration Tests (Not in scope)
- Language switching
- Filter switching
- QR code CRUD operations

### Manual Tests (Required)
- Visual QA in all languages
- Mobile responsiveness
- Accessibility audit
- Cross-browser testing

## Future Enhancements

### Potential Improvements
1. **RTL Support** - Add right-to-left language support (Arabic, Hebrew)
2. **More Languages** - Add Spanish, French, German, etc.
3. **Dynamic CTA Texts** - Load preset texts from translations
4. **Material Previews** - Show actual size previews
5. **Batch Operations** - Select and download multiple QR codes

### Not Planned
- Backend API changes (out of scope)
- QR code generation algorithm (already implemented)
- PDF template redesign (only text translations)
- New material types (use existing 4 types)

## References

### Related Documents
- `requirements.md` - Detailed requirements
- `tasks.md` - Implementation tasks
- `IMPLEMENTATION_COMPLETE.md` - Completion report
- `QA_CHECKLIST.md` - Testing checklist

### Related Code
- `src/i18n/client.ts` - i18n hooks
- `src/lib/qr-materials.ts` - Material type definitions
- `messages/*.json` - Translation files

### Related Tasks
- TIPS-52: Venue Profile Simplification
- TIPS-53: Landing Page Footer & Problem Section Updates
