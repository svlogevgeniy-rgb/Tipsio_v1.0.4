# Requirements Document

## Introduction

Система администрирования персонала в настоящее время имеет критическую ошибку, вызывающую бесконечный цикл рендеринга в хуке `use-staff-management.ts`. Ошибка возникает из-за неправильного использования зависимостей в `useEffect`, что приводит к постоянному пересозданию функции `fetchStaff` и повторным вызовам эффекта. Необходимо исправить эту проблему, обеспечив корректную работу системы управления персоналом.

## Glossary

- **Staff Management System**: Система управления персоналом заведения
- **useStaffManagement Hook**: React хук для управления состоянием и операциями с персоналом
- **Infinite Render Loop**: Бесконечный цикл рендеринга, вызванный неправильными зависимостями в useEffect
- **Venue**: Заведение (ресторан, бар и т.д.)
- **Staff Member**: Сотрудник заведения

## Requirements

### Requirement 1

**User Story:** Как владелец заведения, я хочу, чтобы страница управления персоналом загружалась корректно без ошибок, чтобы я мог управлять своими сотрудниками.

#### Acceptance Criteria

1. WHEN the staff management page loads THEN the system SHALL fetch staff data exactly once without triggering infinite re-renders
2. WHEN the venue data is loaded THEN the system SHALL store the venue ID and fetch associated staff members
3. WHEN the initial data fetch completes THEN the system SHALL set the loading state to false
4. WHEN an error occurs during data fetching THEN the system SHALL handle it gracefully and set loading state to false

### Requirement 2

**User Story:** Как владелец заведения, я хочу добавлять новых сотрудников, чтобы они могли получать чаевые.

#### Acceptance Criteria

1. WHEN a venue owner submits a new staff member form THEN the system SHALL create the staff member with provided data
2. WHEN a staff member is created successfully THEN the system SHALL add the new staff member to the displayed list
3. WHEN avatar file is provided THEN the system SHALL upload the file before creating the staff member
4. WHEN staff creation fails THEN the system SHALL display an appropriate error message

### Requirement 3

**User Story:** Как владелец заведения, я хочу изменять статус сотрудников (активный/неактивный), чтобы контролировать, кто может получать чаевые.

#### Acceptance Criteria

1. WHEN a venue owner toggles staff status THEN the system SHALL update the status in the database
2. WHEN status update succeeds THEN the system SHALL update the staff member status in the UI immediately
3. WHEN status update fails THEN the system SHALL display an error message and maintain the previous state

### Requirement 4

**User Story:** Как владелец заведения, я хочу удалять сотрудников из системы, чтобы поддерживать актуальный список персонала.

#### Acceptance Criteria

1. WHEN a venue owner deletes a staff member THEN the system SHALL remove the staff member from the database
2. WHEN deletion succeeds THEN the system SHALL remove the staff member from the displayed list
3. WHEN deletion fails THEN the system SHALL display an error message and maintain the current list

### Requirement 5

**User Story:** Как разработчик, я хочу, чтобы хук useStaffManagement использовал правильные паттерны React, чтобы избежать проблем с производительностью и ошибками рендеринга.

#### Acceptance Criteria

1. WHEN the useStaffManagement hook is initialized THEN the system SHALL use proper dependency arrays in useEffect hooks
2. WHEN callbacks are defined THEN the system SHALL use useCallback with correct dependencies to prevent unnecessary re-creations
3. WHEN the component unmounts THEN the system SHALL not trigger any state updates
4. WHEN multiple operations are performed THEN the system SHALL maintain consistent state without race conditions
