# Requirements Document

## Introduction

Полная замена механики "Модель распределения чаевых" (Distribution Mode) на новую систему QR-кодов двух типов: INDIVIDUAL (индивидуальный) и TEAM (командный). Задача включает удаление старой механики из UI и backend, миграцию существующих данных, и обеспечение автоматического создания QR после регистрации.

## Glossary

- **QR_Code_System**: Система управления QR-кодами для приёма чаевых
- **Individual_QR**: QR-код, привязанный к одному конкретному получателю чаевых (recipientStaffId)
- **Team_QR**: QR-код, привязанный к нескольким получателям через таблицу QrCodeRecipient
- **Recipient**: Сотрудник (Staff), который может получать чаевые через QR-код
- **Staff_Selection_Page**: Промежуточная страница выбора сотрудника при сканировании Team QR
- **Tip_Payment_Page**: Страница оплаты чаевых конкретному сотруднику
- **Registration_Flow**: Процесс регистрации нового venue в системе (2 шага)
- **Distribution_Mode**: Устаревшая механика распределения чаевых (сохраняется в БД для истории)
- **Venue_Dashboard**: Панель управления заведением
- **Owner_Staff_Profile**: Автоматически создаваемый профиль сотрудника для владельца venue (Admin)
- **Inactive_Staff_Popup**: Попап с сообщением "Выберите другого сотрудника!" при попытке оплаты неактивному сотруднику

## Requirements

### Requirement 1: Удаление механики Distribution Mode из UI

**User Story:** As a venue owner, I want the old distribution mode selection removed from the interface, so that I can use the new simplified QR-based system.

#### Acceptance Criteria

1. WHEN a user navigates to the registration flow, THE Registration_Flow SHALL NOT display step 3 (distribution mode selection)
2. WHEN a user opens venue settings, THE Venue_Dashboard SHALL NOT display the "Tip Distribution" section
3. WHEN a user views the onboarding flow, THE Registration_Flow SHALL NOT display distribution mode selection step
4. THE Registration_Flow SHALL consist of exactly 2 steps: Account Details and Midtrans Credentials
5. THE Venue_Dashboard settings SHALL NOT display allowStaffChoice option

### Requirement 2: Создание Individual QR-кода

**User Story:** As a venue owner, I want to create Individual QR codes assigned to specific staff members, so that tips go directly to the selected recipient.

#### Acceptance Criteria

1. WHEN a user creates a new QR code, THE QR_Code_System SHALL offer "Individual" type option
2. WHEN creating an Individual QR, THE QR_Code_System SHALL require selection of exactly one Recipient
3. WHEN displaying recipient selection, THE QR_Code_System SHALL show recipient name, photo (or placeholder avatar), and role
4. WHEN an Individual QR is scanned, THE QR_Code_System SHALL redirect directly to Tip_Payment_Page for the assigned Recipient
5. THE Individual_QR SHALL store reference to exactly one recipientStaffId
6. THE QR_Code_System SHALL NOT allow converting Individual_QR to Team_QR after creation

### Requirement 3: Создание Team QR-кода

**User Story:** As a venue owner, I want to create Team QR codes with multiple recipients, so that guests can choose who to tip.

#### Acceptance Criteria

1. WHEN a user creates a new QR code, THE QR_Code_System SHALL offer "Team" type option
2. WHEN creating a Team QR, THE QR_Code_System SHALL require selection of at least 2 Recipients
3. WHEN creating a Team QR, THE QR_Code_System SHALL pre-select the Admin (venue owner) by default
4. WHEN displaying recipient selection for Team QR, THE QR_Code_System SHALL allow multi-select with checkboxes for all venue staff
5. WHEN a Team QR is scanned, THE QR_Code_System SHALL display Staff_Selection_Page with assigned Recipients
6. WHEN a guest selects a staff member on Staff_Selection_Page, THE QR_Code_System SHALL redirect to Tip_Payment_Page for selected Recipient
7. THE Team_QR SHALL store references to multiple staffIds via QrCodeRecipient relation table
8. THE QR_Code_System SHALL NOT allow converting Team_QR to Individual_QR after creation

### Requirement 4: Staff Selection Page для Team QR

**User Story:** As a guest, I want to see a list of staff members when scanning a Team QR, so that I can choose who to tip.

#### Acceptance Criteria

1. WHEN Staff_Selection_Page loads, THE QR_Code_System SHALL display only active Recipients assigned to the Team QR
2. WHEN displaying a Recipient, THE QR_Code_System SHALL show name, photo (or placeholder avatar), and role
3. WHEN a Recipient has no photo, THE QR_Code_System SHALL display a default avatar placeholder
4. WHEN a guest taps on a Recipient, THE QR_Code_System SHALL navigate to Tip_Payment_Page with selected staffId
5. IF a previously assigned Recipient becomes inactive, THEN THE QR_Code_System SHALL exclude them from Staff_Selection_Page display

### Requirement 5: Обработка неактивных сотрудников

**User Story:** As a guest, I want to be notified when a staff member is unavailable, so that I can choose another recipient.

#### Acceptance Criteria

1. IF a guest navigates directly to Tip_Payment_Page for an inactive staff member, THEN THE QR_Code_System SHALL display Inactive_Staff_Popup
2. WHEN Inactive_Staff_Popup is displayed, THE QR_Code_System SHALL show message "Выберите другого сотрудника!"
3. WHEN guest dismisses Inactive_Staff_Popup, THE QR_Code_System SHALL redirect to Staff_Selection_Page
4. IF all Recipients of a Team QR become inactive, THEN THE QR_Code_System SHALL display error message that venue is not accepting tips

### Requirement 6: Автоматическое создание Staff + QR после регистрации

**User Story:** As a new venue owner, I want a Staff profile and QR code automatically created after registration, so that I can start accepting tips immediately.

#### Acceptance Criteria

1. WHEN registration completes successfully, THE Registration_Flow SHALL create User with role ADMIN
2. WHEN User is created, THE Registration_Flow SHALL create Owner_Staff_Profile linked to the User
3. WHEN Owner_Staff_Profile is created, THE Registration_Flow SHALL set displayName to venue name
4. WHEN Owner_Staff_Profile is created, THE Registration_Flow SHALL set role to ADMINISTRATOR
5. WHEN Owner_Staff_Profile is created, THE Registration_Flow SHALL create an Individual_QR assigned to the owner
6. WHEN user navigates to QR codes section after registration, THE Venue_Dashboard SHALL display the auto-created Individual_QR
7. THE auto-created Individual_QR SHALL have label set to venue name

### Requirement 7: Миграция существующих QR-кодов

**User Story:** As a system administrator, I want existing QR codes migrated to new types, so that they continue working without breaking existing links.

#### Acceptance Criteria

1. WHEN migration runs, THE QR_Code_System SHALL convert PERSONAL type QR codes to INDIVIDUAL type preserving staffId as recipientStaffId
2. WHEN migration runs, THE QR_Code_System SHALL convert TABLE type QR codes to TEAM type
3. WHEN migration runs, THE QR_Code_System SHALL convert VENUE type QR codes to TEAM type
4. WHEN converting to TEAM type, THE QR_Code_System SHALL assign all active staff of the venue as Recipients at migration time
5. THE QR_Code_System SHALL preserve all existing shortCode values to maintain URL compatibility
6. IF a QR code has associated tips history, THEN THE QR_Code_System SHALL NOT delete or modify the QR code record
7. THE migration SHALL be documented in PR with conversion rules and recipient assignment logic

### Requirement 8: Обратная совместимость URL

**User Story:** As a venue owner with printed QR codes, I want my existing QR URLs to continue working, so that I don't need to reprint materials.

#### Acceptance Criteria

1. WHEN an existing QR shortCode is accessed via /tip/:shortCode, THE QR_Code_System SHALL resolve it correctly
2. WHEN a migrated TEAM QR is scanned, THE QR_Code_System SHALL show Staff_Selection_Page
3. WHEN a migrated INDIVIDUAL QR is scanned, THE QR_Code_System SHALL redirect to Tip_Payment_Page
4. THE QR_Code_System SHALL NOT change any existing shortCode values during migration

### Requirement 9: Сохранение исторических данных

**User Story:** As a venue owner, I want my transaction history preserved, so that I can view past tips and reports.

#### Acceptance Criteria

1. WHEN viewing transaction history, THE Venue_Dashboard SHALL display all historical tips correctly
2. THE QR_Code_System SHALL NOT delete any Tip records during migration
3. THE QR_Code_System SHALL NOT delete any TipAllocation records during migration
4. IF a tip was made to a pool (type=POOL), THEN THE Venue_Dashboard SHALL continue displaying it with original allocation data
5. THE distributionMode field SHALL remain in database for historical data integrity

### Requirement 10: Удаление Distribution Mode из Backend логики

**User Story:** As a developer, I want the distribution mode logic removed from backend flows, so that the codebase is simplified.

#### Acceptance Criteria

1. THE QR_Code_System SHALL NOT use distributionMode field in new QR creation logic
2. THE QR_Code_System SHALL NOT use allowStaffChoice field in new QR creation logic
3. WHEN determining available staff for tip page, THE QR_Code_System SHALL use QR type (INDIVIDUAL/TEAM) instead of distributionMode
4. THE Registration_Flow SHALL NOT accept distributionMode parameter
5. THE Venue_Dashboard settings API SHALL NOT accept distributionMode or allowStaffChoice updates
6. WHEN creating new tips, THE QR_Code_System SHALL always set TipType to PERSONAL (POOL no longer used)

### Requirement 11: Управление получателями Team QR

**User Story:** As a venue owner, I want to manage recipients of Team QR codes, so that I can add or remove staff from the selection list.

#### Acceptance Criteria

1. WHEN viewing a Team QR details, THE Venue_Dashboard SHALL display list of assigned Recipients
2. WHEN editing a Team QR, THE QR_Code_System SHALL allow adding new Recipients from venue staff
3. WHEN editing a Team QR, THE QR_Code_System SHALL allow removing Recipients (minimum 2 must remain)
4. WHEN a staff member is deactivated, THE QR_Code_System SHALL automatically exclude them from Team QR selection pages
5. THE Admin (venue owner) SHALL be pre-selected by default when creating Team QR and cannot be accidentally removed

### Requirement 12: Модель данных QrCodeRecipient

**User Story:** As a developer, I want a proper data model for Team QR recipients, so that many-to-many relationships are handled correctly.

#### Acceptance Criteria

1. THE QR_Code_System SHALL create QrCodeRecipient table for Team QR to Staff relationships
2. THE QrCodeRecipient table SHALL have foreign key to QrCode
3. THE QrCodeRecipient table SHALL have foreign key to Staff
4. THE QrCodeRecipient table SHALL enforce unique constraint on (qrCodeId, staffId) pair
5. WHEN a Team QR is deleted, THE QR_Code_System SHALL cascade delete related QrCodeRecipient records
