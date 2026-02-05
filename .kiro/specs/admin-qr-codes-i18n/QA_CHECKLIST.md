# QA Checklist: Admin QR Codes Page (TIPS-54)

## Test Environment
- [ ] Development server running on port 3001
- [ ] Database connected (PostgreSQL on localhost:5433)
- [ ] Logged in as venue admin
- [ ] Test data: Multiple QR codes (individual and team types)

## 1. Language Switching Tests

### English (EN)
- [ ] Navigate to `/venue/qr-codes`
- [ ] Page title shows "Venue QR Codes"
- [ ] Subtitle shows "Download and place QR code to receive tips"
- [ ] Filter tabs: "All", "Team QR", "Individual QR"
- [ ] Create button: "Create QR"
- [ ] Action buttons: "Edit", "Open", "Delete"
- [ ] Employee count: "X employees"
- [ ] Material format labels in English
- [ ] Download button: "Download PDF"

### Indonesian (ID)
- [ ] Switch language to Indonesian
- [ ] Page title shows "Kode QR Venue"
- [ ] Subtitle shows "Unduh dan tempatkan kode QR untuk menerima tip"
- [ ] Filter tabs: "Semua", "QR Tim", "QR Individual"
- [ ] Create button: "Buat QR"
- [ ] Action buttons: "Edit", "Buka", "Hapus"
- [ ] Employee count: "X staf"
- [ ] Material format labels in Indonesian
- [ ] Download button: "Unduh PDF"

### Russian (RU)
- [ ] Switch language to Russian
- [ ] Page title shows "QR-коды заведения"
- [ ] Subtitle shows "Скачайте и разместите QR-код для приёма чаевых"
- [ ] Filter tabs: "Все", "Командный QR", "Индивидуальный QR"
- [ ] Create button: "Создать QR"
- [ ] Action buttons: "Редактировать", "Открыть", "Удалить"
- [ ] Employee count: "X сотрудников"
- [ ] Material format labels in Russian
- [ ] Download button: "Скачать PDF"

## 2. Mobile Responsiveness

### Filter Tabs (Mobile)
- [ ] Open page on mobile device or narrow browser window (< 640px)
- [ ] Filter tabs display in horizontal scrollable row
- [ ] No text overlap or truncation
- [ ] Can scroll to see all three tabs
- [ ] Active tab is clearly visible
- [ ] Tap targets are adequate (min 44x44px)

### QR Code Cards (Mobile)
- [ ] Cards stack vertically on mobile
- [ ] QR preview displays correctly
- [ ] Action buttons wrap properly
- [ ] All text is readable

### Material Generator (Mobile)
- [ ] Material type buttons display in 2-column grid
- [ ] All form fields are accessible
- [ ] Color picker works on touch devices
- [ ] Download button is full-width and tappable

## 3. Filter Functionality

### "All" Filter
- [ ] Shows all QR codes (individual + team)
- [ ] Empty state: "You don't have any QR codes yet" (translated)
- [ ] Create button visible in empty state

### "Team QR" Filter
- [ ] Shows only team QR codes (TEAM, TABLE, VENUE types)
- [ ] Individual QR codes are hidden
- [ ] Empty state: "You don't have any team QR codes yet" (translated)
- [ ] Create button visible in empty state

### "Individual QR" Filter
- [ ] Shows only individual QR codes (INDIVIDUAL, PERSONAL types)
- [ ] Team QR codes are hidden
- [ ] Empty state: "You don't have any individual QR codes yet" (translated)
- [ ] Create button visible in empty state

## 4. QR Code List Display

### Individual QR Cards
- [ ] Badge shows "Individual" with user icon
- [ ] Staff member name displayed
- [ ] QR preview renders correctly
- [ ] Short URL displayed
- [ ] "Open" button works
- [ ] "Download PNG" button works
- [ ] "Download SVG" button works
- [ ] "Delete" button works
- [ ] No "Edit" button (individual QRs can't be edited)

### Team QR Cards
- [ ] Badge shows "Team" with users icon
- [ ] Employee count displayed (e.g., "5 employees")
- [ ] QR preview renders correctly
- [ ] Short URL displayed
- [ ] "Edit" button visible and works
- [ ] "Open" button works
- [ ] "Download PNG" button works
- [ ] "Download SVG" button works
- [ ] "Delete" button works

## 5. Delete Dialog

### Dialog Display
- [ ] Click "Delete" button on any QR code
- [ ] Dialog opens with translated title
- [ ] Dialog description is translated
- [ ] "Cancel" button is translated
- [ ] "Delete" button is translated and styled red

### Dialog Actions
- [ ] Click "Cancel" - dialog closes, QR not deleted
- [ ] Click "Delete" - QR code is deleted
- [ ] QR code removed from list immediately
- [ ] No error messages
- [ ] If error occurs, shows translated error message

## 6. Material Generator

### Material Type Selection
- [ ] All 4 material types display correctly
- [ ] Labels are translated (Table Tent, Sticker, Card, Poster)
- [ ] Descriptions are translated
- [ ] **Table Tent shows "А5" (not "А4") in all languages**
- [ ] Selected type has blue border and background
- [ ] Clicking type updates preview

### CTA Text
- [ ] Dropdown shows preset texts
- [ ] Can select from dropdown
- [ ] Can type custom text
- [ ] Custom text updates preview
- [ ] Placeholder text is translated

### Logo Upload
- [ ] Toggle switch works
- [ ] When enabled, upload button appears
- [ ] Button text: "Upload logo" (translated)
- [ ] Can select image file
- [ ] After upload, button text: "Change logo" (translated)
- [ ] Logo appears in preview

### Color Picker
- [ ] 6 preset colors display
- [ ] Clicking preset changes background color
- [ ] Custom color picker works
- [ ] Color changes update preview
- [ ] Text color adjusts for contrast

### Preview
- [ ] Preview updates in real-time
- [ ] QR code renders correctly
- [ ] Venue name displays
- [ ] CTA text displays
- [ ] Logo displays (if enabled)
- [ ] Colors match selection

### PDF Download
- [ ] Click "Download PDF" button
- [ ] Button shows "Generating..." while processing
- [ ] PDF downloads successfully
- [ ] PDF filename: `tipsio-{material-type}.pdf`
- [ ] PDF content matches preview
- [ ] **PDF shows A5 format for table tent**

## 7. QR Code Selection for Materials

### Dropdown
- [ ] Dropdown shows all QR codes
- [ ] Each item shows type icon
- [ ] Each item shows QR label/name
- [ ] Individual QRs show staff name
- [ ] Team QRs show employee count
- [ ] Can select different QR code
- [ ] Selection updates preview and download

### Default Selection
- [ ] First QR code selected by default
- [ ] Preview loads automatically
- [ ] Can generate PDF immediately

## 8. Error Handling

### Load Errors
- [ ] If QR codes fail to load, error message is translated
- [ ] Error message is visible and readable

### Download Errors
- [ ] If PNG download fails, error message is translated
- [ ] If SVG download fails, error message is translated
- [ ] If PDF generation fails, appropriate error shown

### Delete Errors
- [ ] If delete fails, error message is translated
- [ ] QR code remains in list
- [ ] Can retry delete

## 9. Cross-Language Consistency

### All Languages
- [ ] All UI elements have translations
- [ ] No hardcoded Russian text visible
- [ ] No missing translation keys
- [ ] No "[missing]" or "undefined" text
- [ ] Formatting is consistent across languages
- [ ] Button sizes accommodate longer text

## 10. Integration Tests

### Create QR Flow
- [ ] Click "Create QR" button
- [ ] Dialog opens (separate component, not in scope)
- [ ] After creating QR, list updates
- [ ] New QR appears in correct filter

### Edit Team QR Flow
- [ ] Click "Edit" on team QR
- [ ] Dialog opens (separate component, not in scope)
- [ ] After editing, list updates
- [ ] Changes reflected immediately

### Open QR Page
- [ ] Click "Open" button
- [ ] New tab opens with tip payment page
- [ ] URL is correct: `/tip/{shortCode}`

## 11. Performance

### Page Load
- [ ] Page loads within 2 seconds
- [ ] QR codes load within 1 second
- [ ] No layout shift during load

### Language Switch
- [ ] Language change is instant
- [ ] No page reload required
- [ ] All texts update simultaneously

### Filter Switch
- [ ] Filter change is instant
- [ ] No loading delay
- [ ] Smooth transition

## 12. Accessibility

### Keyboard Navigation
- [ ] Can tab through all interactive elements
- [ ] Filter tabs are keyboard accessible
- [ ] Buttons have focus indicators
- [ ] Dialogs trap focus correctly

### Screen Reader
- [ ] Page title is announced
- [ ] Filter tabs have proper labels
- [ ] Buttons have descriptive labels
- [ ] Dialog has proper ARIA attributes

## Test Results Summary

**Date:** _____________  
**Tester:** _____________  
**Language Tested:** [ ] EN [ ] ID [ ] RU  
**Device:** [ ] Desktop [ ] Mobile [ ] Tablet  

**Total Tests:** 150+  
**Passed:** _____  
**Failed:** _____  
**Blocked:** _____  

**Critical Issues Found:**
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

**Sign-off:** _____________  **Date:** _____________
