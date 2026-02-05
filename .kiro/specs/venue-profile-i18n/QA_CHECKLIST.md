# QA Checklist: Venue Profile Internationalization

## Test Environment Setup
- [ ] Development server is running (`npm run dev`)
- [ ] Docker with PostgreSQL is running (database on localhost:5433)
- [ ] User is logged in as venue owner
- [ ] Navigate to `/venue/profile`

## Language Switching Tests

### English (EN)
- [ ] Switch language to English
- [ ] Verify page title shows "Profile"
- [ ] Verify description shows "Manage your profile information and credentials"
- [ ] Verify all form labels are in English:
  - [ ] "Company Logo"
  - [ ] "Company Name"
  - [ ] "Email"
  - [ ] "Phone Number"
  - [ ] "New Password"
  - [ ] "Confirm Password"
- [ ] Verify button text:
  - [ ] "Upload Logo" or "Change Logo"
  - [ ] "Save"
- [ ] Verify placeholders:
  - [ ] Company name: "Enter company name"
  - [ ] Email: "admin@example.com"
  - [ ] Phone: "+62 812-3456-7890"
  - [ ] Password: "Leave empty if you don't want to change"
  - [ ] Confirm password: "Repeat new password"
- [ ] Verify helper text: "JPG or PNG, square photo 1:1, maximum 5MB"

### Indonesian (ID)
- [ ] Switch language to Indonesian
- [ ] Verify page title shows "Profil"
- [ ] Verify description shows "Kelola informasi profil dan kredensial Anda"
- [ ] Verify all form labels are in Indonesian:
  - [ ] "Logo Perusahaan"
  - [ ] "Nama Perusahaan"
  - [ ] "Email"
  - [ ] "Nomor Telepon"
  - [ ] "Kata Sandi Baru"
  - [ ] "Konfirmasi Kata Sandi"
- [ ] Verify button text:
  - [ ] "Unggah Logo" or "Ubah Logo"
  - [ ] "Simpan"
- [ ] Verify placeholders:
  - [ ] Company name: "Masukkan nama perusahaan"
  - [ ] Email: "admin@example.com"
  - [ ] Phone: "+62 812-3456-7890"
  - [ ] Password: "Biarkan kosong jika tidak ingin mengubah"
  - [ ] Confirm password: "Ulangi kata sandi baru"
- [ ] Verify helper text: "JPG atau PNG, foto persegi 1:1, maksimum 5MB"

### Russian (RU)
- [ ] Switch language to Russian
- [ ] Verify page title shows "Профиль"
- [ ] Verify description shows "Управление информацией вашего профиля и учетными данными"
- [ ] Verify all form labels are in Russian:
  - [ ] "Логотип компании"
  - [ ] "Название компании"
  - [ ] "Электронная почта"
  - [ ] "Номер телефона"
  - [ ] "Новый пароль"
  - [ ] "Подтвердите пароль"
- [ ] Verify button text:
  - [ ] "Загрузить логотип" or "Изменить логотип"
  - [ ] "Сохранить"
- [ ] Verify placeholders:
  - [ ] Company name: "Введите название компании"
  - [ ] Email: "admin@example.com"
  - [ ] Phone: "+62 812-3456-7890"
  - [ ] Password: "Оставьте пустым, если не хотите менять"
  - [ ] Confirm password: "Повторите новый пароль"
- [ ] Verify helper text: "JPG или PNG, квадратное фото 1:1, максимум 5MB"

## Validation Error Tests

### English
- [ ] Leave company name empty or enter 1 character
  - [ ] Error shows: "Company name must be at least 2 characters"
- [ ] Enter invalid email format
  - [ ] Error shows: "Invalid email format"
- [ ] Enter password less than 6 characters
  - [ ] Error shows: "Password must be at least 6 characters"
- [ ] Enter mismatched passwords
  - [ ] Error shows: "Passwords do not match"

### Indonesian
- [ ] Leave company name empty or enter 1 character
  - [ ] Error shows: "Nama perusahaan harus minimal 2 karakter"
- [ ] Enter invalid email format
  - [ ] Error shows: "Format email tidak valid"
- [ ] Enter password less than 6 characters
  - [ ] Error shows: "Kata sandi harus minimal 6 karakter"
- [ ] Enter mismatched passwords
  - [ ] Error shows: "Kata sandi tidak cocok"

### Russian
- [ ] Leave company name empty or enter 1 character
  - [ ] Error shows: "Название компании должно содержать минимум 2 символа"
- [ ] Enter invalid email format
  - [ ] Error shows: "Неверный формат email"
- [ ] Enter password less than 6 characters
  - [ ] Error shows: "Пароль должен содержать минимум 6 символов"
- [ ] Enter mismatched passwords
  - [ ] Error shows: "Пароли не совпадают"

## File Upload Error Tests

### English
- [ ] Try to upload a .txt file
  - [ ] Error toast shows: "Only JPG or PNG files allowed"
- [ ] Try to upload a file larger than 5MB
  - [ ] Error toast shows: "File too large. Maximum 5MB"

### Indonesian
- [ ] Try to upload a .txt file
  - [ ] Error toast shows: "Hanya file JPG atau PNG yang diizinkan"
- [ ] Try to upload a file larger than 5MB
  - [ ] Error toast shows: "File terlalu besar. Maksimum 5MB"

### Russian
- [ ] Try to upload a .txt file
  - [ ] Error toast shows: "Разрешены только файлы JPG или PNG"
- [ ] Try to upload a file larger than 5MB
  - [ ] Error toast shows: "Файл слишком большой. Максимум 5MB"

## Success Message Tests

### English
- [ ] Successfully save profile changes
  - [ ] Success toast shows: "Profile updated successfully"

### Indonesian
- [ ] Successfully save profile changes
  - [ ] Success toast shows: "Profil berhasil diperbarui"

### Russian
- [ ] Successfully save profile changes
  - [ ] Success toast shows: "Профиль успешно обновлен"

## Loading State Tests

### All Languages
- [ ] Click save button
  - [ ] Button shows loading spinner
  - [ ] Button text changes to "Saving..." (or translated equivalent)
- [ ] Upload a logo
  - [ ] Button shows loading spinner
  - [ ] Button text changes to "Uploading image..." (or translated equivalent)

## Persistence Tests
- [ ] Switch to English, refresh page
  - [ ] Language remains English
- [ ] Switch to Indonesian, refresh page
  - [ ] Language remains Indonesian
- [ ] Switch to Russian, refresh page
  - [ ] Language remains Russian

## Edge Cases
- [ ] Phone placeholder remains "+62 812-3456-7890" in all languages
- [ ] Empty phone field can be saved (converts to null)
- [ ] Company name with exactly 2 characters is accepted
- [ ] Logo displays correctly after upload in all languages

## Sign-off
- [ ] All tests passed
- [ ] No console errors
- [ ] No visual glitches
- [ ] Language switching is smooth and instant

**Tested by:** _______________  
**Date:** _______________  
**Notes:** _______________
