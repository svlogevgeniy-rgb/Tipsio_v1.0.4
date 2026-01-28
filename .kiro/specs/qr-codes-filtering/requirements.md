# Requirements Document

## Introduction

Добавление функциональности фильтрации QR-кодов по типу в разделе "QR-codes" панели управления venue. Пользователи смогут фильтровать отображаемые QR-коды по типу: все, командные или индивидуальные.

## Glossary

- **QR_Codes_Page**: Страница управления QR-кодами в панели venue dashboard
- **Filter_Control**: UI-элемент для выбора типа фильтрации (Tabs или segmented control)
- **Individual_QR**: QR-код, привязанный к одному конкретному получателю чаевых
- **Team_QR**: QR-код, привязанный к нескольким получателям через таблицу QrCodeRecipient
- **Active_QR**: QR-код со статусом ACTIVE
- **QR_Card**: Карточка (плитка) с информацией о QR-коде в списке

## Requirements

### Requirement 1: Фильтр "Все"

**User Story:** As a venue owner, I want to see all my active QR codes, so that I can get a complete overview of all QR codes in my venue.

#### Acceptance Criteria

1. WHEN a user opens QR_Codes_Page, THE Filter_Control SHALL display "Все" as the default selected option
2. WHEN "Все" filter is selected, THE QR_Codes_Page SHALL display all Active_QR codes regardless of type
3. WHEN "Все" filter is selected, THE QR_Codes_Page SHALL show both Individual_QR and Team_QR codes
4. THE "Все" filter SHALL be the leftmost option in Filter_Control

### Requirement 2: Фильтр "Командный QR"

**User Story:** As a venue owner, I want to filter and see only Team QR codes, so that I can manage QR codes where guests choose staff members.

#### Acceptance Criteria

1. WHEN a user selects "Командный QR" filter, THE QR_Codes_Page SHALL display only Team_QR codes
2. WHEN "Командный QR" filter is active, THE QR_Codes_Page SHALL hide all Individual_QR codes
3. WHEN "Командный QR" filter is active, THE QR_Codes_Page SHALL show QR codes with type TEAM, TABLE, or VENUE
4. IF no Team_QR codes exist, THEN THE QR_Codes_Page SHALL display an empty state message

### Requirement 3: Фильтр "Индивидуальный QR"

**User Story:** As a venue owner, I want to filter and see only Individual QR codes, so that I can manage QR codes assigned to specific staff members.

#### Acceptance Criteria

1. WHEN a user selects "Индивидуальный QR" filter, THE QR_Codes_Page SHALL display only Individual_QR codes
2. WHEN "Индивидуальный QR" filter is active, THE QR_Codes_Page SHALL hide all Team_QR codes
3. WHEN "Индивидуальный QR" filter is active, THE QR_Codes_Page SHALL show QR codes with type INDIVIDUAL or PERSONAL
4. IF no Individual_QR codes exist, THEN THE QR_Codes_Page SHALL display an empty state message

### Requirement 4: Визуальное отображение фильтров

**User Story:** As a venue owner, I want clear visual feedback on which filter is active, so that I know what QR codes I'm viewing.

#### Acceptance Criteria

1. THE Filter_Control SHALL use shadcn/ui Tabs component or similar segmented control
2. WHEN a filter is selected, THE Filter_Control SHALL highlight the active filter option
3. THE Filter_Control SHALL be positioned above the QR codes list
4. THE Filter_Control SHALL maintain visual consistency with the existing venue dashboard design
5. THE Filter_Control SHALL be responsive and work correctly on mobile (375px), tablet (768px), and desktop (1440px) viewports

### Requirement 5: Сохранение состояния фильтра

**User Story:** As a venue owner, I want the filter selection to persist during my session, so that I don't have to reselect it when navigating back to the page.

#### Acceptance Criteria

1. WHEN a user selects a filter, THE QR_Codes_Page SHALL remember the selection in component state
2. WHEN a user creates a new QR code, THE QR_Codes_Page SHALL maintain the current filter selection
3. WHEN a user edits a Team QR, THE QR_Codes_Page SHALL maintain the current filter selection
4. WHEN a user refreshes the page, THE Filter_Control SHALL reset to "Все" (default behavior)

### Requirement 6: Пустое состояние при фильтрации

**User Story:** As a venue owner, I want to see a helpful message when no QR codes match my filter, so that I understand why the list is empty.

#### Acceptance Criteria

1. WHEN a filter returns no results, THE QR_Codes_Page SHALL display an empty state message
2. THE empty state message SHALL indicate which filter is active
3. THE empty state message SHALL suggest creating a QR code of the filtered type
4. THE empty state SHALL include the "Создать QR" button for quick access

### Requirement 7: Совместимость с существующей функциональностью

**User Story:** As a venue owner, I want all existing QR code features to work correctly with filters, so that filtering doesn't break any functionality.

#### Acceptance Criteria

1. WHEN a filter is active, THE QR_Card actions SHALL work correctly (download, open, edit)
2. WHEN a filter is active, THE "Создать QR" button SHALL remain accessible
3. WHEN a new QR is created, THE QR_Codes_Page SHALL refresh the list and apply the current filter
4. WHEN a Team QR is edited, THE QR_Codes_Page SHALL refresh the list and apply the current filter
5. THE filter functionality SHALL NOT affect the QR Generator component display

### Requirement 8: Производительность фильтрации

**User Story:** As a venue owner, I want instant filter switching, so that I can quickly browse different types of QR codes.

#### Acceptance Criteria

1. WHEN a user switches filters, THE QR_Codes_Page SHALL update the display immediately without API calls
2. THE filtering logic SHALL be performed client-side on already loaded QR codes
3. THE filter switching SHALL NOT cause page loading indicators
4. THE filter switching SHALL NOT cause layout shifts or flickering
