# TIPS-53: Add Internationalization to Venue Profile Page

## Description
The venue profile page (`/venue/profile`) currently displays all text in Russian only. Users cannot switch to English or Indonesian languages, even though the Language Switcher component is present.

## Problem
- All text is hardcoded in Russian
- `useTranslations` hook is not used
- Translation keys don't exist in `messages/*.json` files
- Language switching has no effect on the profile page

## Requirements
1. Add translation support for English (en), Indonesian (id), and Russian (ru)
2. Translate all UI text: headers, labels, buttons, placeholders
3. Translate validation error messages
4. Translate success/error notifications
5. Ensure language switching works correctly

## Acceptance Criteria
- [ ] Profile page displays in the selected language (en/id/ru)
- [ ] All text elements are translated (no hardcoded Russian text)
- [ ] Language switcher updates the page content immediately
- [ ] Validation messages appear in the current language
- [ ] Toast notifications appear in the current language

## Files to Modify
- `src/app/venue/(dashboard)/profile/page.tsx` - Add useTranslations hook
- `messages/en.json` - Add English translations
- `messages/id.json` - Add Indonesian translations  
- `messages/ru.json` - Add Russian translations

## Related
- Spec: `.kiro/specs/venue-profile-i18n/`
- Related to: TIPS-52 (Venue Profile Simplification)
