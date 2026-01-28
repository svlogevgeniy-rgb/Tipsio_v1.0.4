# Requirements Document

## Introduction

Модуль управления меню заведения для платформы Tipsio. Позволяет владельцам заведений создавать, редактировать и организовывать меню с блюдами, напитками и услугами. Меню отображается гостям на странице чаевых, повышая вовлечённость и предоставляя дополнительную информацию о заведении.

## Glossary

- **Venue**: Заведение (ресторан, кафе, бар) в системе Tipsio
- **Menu**: Меню заведения, содержащее категории и позиции
- **MenuCategory**: Категория меню (например, "Завтраки", "Напитки", "Десерты")
- **MenuItem**: Позиция меню (блюдо, напиток, услуга)
- **Manager**: Владелец/менеджер заведения с правами редактирования меню
- **Guest**: Посетитель заведения, просматривающий меню

## Requirements

### Requirement 1

**User Story:** As a venue manager, I want to create menu categories, so that I can organize menu items logically.

#### Acceptance Criteria

1. WHEN a manager creates a new category THEN the system SHALL add the category to the venue's menu with a unique identifier
2. WHEN a manager specifies a category name THEN the system SHALL validate that the name contains between 1 and 100 characters
3. WHEN a manager creates a category THEN the system SHALL assign a display order based on existing categories count
4. WHEN a manager creates a category with a duplicate name within the same venue THEN the system SHALL reject the creation and return a validation error
5. WHEN a category is created THEN the system SHALL persist the category to the database immediately

### Requirement 2

**User Story:** As a venue manager, I want to edit and delete menu categories, so that I can maintain an up-to-date menu structure.

#### Acceptance Criteria

1. WHEN a manager updates a category name THEN the system SHALL validate and persist the new name
2. WHEN a manager changes category display order THEN the system SHALL reorder all affected categories accordingly
3. WHEN a manager deletes a category containing menu items THEN the system SHALL move all items to an "Uncategorized" category or delete them based on manager choice
4. WHEN a manager deletes an empty category THEN the system SHALL remove the category and adjust display orders of remaining categories
5. IF a manager attempts to delete the last category THEN the system SHALL prevent deletion and display an error message

### Requirement 3

**User Story:** As a venue manager, I want to add menu items with details, so that guests can see what the venue offers.

#### Acceptance Criteria

1. WHEN a manager creates a menu item THEN the system SHALL require name (1-200 chars) and category assignment
2. WHEN a manager specifies item price THEN the system SHALL store the price as an integer in the smallest currency unit (cents/kopecks)
3. WHEN a manager adds an item description THEN the system SHALL accept text up to 1000 characters
4. WHEN a manager uploads an item image THEN the system SHALL validate the file format (JPEG, PNG, WebP) and size (max 5MB)
5. WHEN a manager marks an item as unavailable THEN the system SHALL display the item with a visual indicator to guests
6. WHEN a manager creates an item THEN the system SHALL assign a display order within its category

### Requirement 4

**User Story:** As a venue manager, I want to edit and delete menu items, so that I can keep the menu accurate.

#### Acceptance Criteria

1. WHEN a manager updates item details THEN the system SHALL validate all fields and persist changes
2. WHEN a manager moves an item to a different category THEN the system SHALL update the item's category and adjust display orders
3. WHEN a manager reorders items within a category THEN the system SHALL update display orders for all affected items
4. WHEN a manager deletes a menu item THEN the system SHALL remove the item and adjust display orders of remaining items
5. WHEN a manager toggles item availability THEN the system SHALL update the status immediately

### Requirement 5

**User Story:** As a venue manager, I want to create nested subcategories, so that I can organize complex menus hierarchically.

#### Acceptance Criteria

1. WHEN a manager creates a subcategory THEN the system SHALL link it to a parent category
2. WHEN the system displays categories THEN the system SHALL render them in a tree structure respecting parent-child relationships
3. WHEN a manager deletes a parent category THEN the system SHALL handle subcategories according to the deletion strategy (cascade or move to root)
4. WHEN a manager moves a subcategory THEN the system SHALL update the parent reference and maintain tree integrity
5. IF a manager attempts to create circular category references THEN the system SHALL reject the operation

### Requirement 6

**User Story:** As a guest, I want to view the venue's menu on the tip page, so that I can see what the venue offers.

#### Acceptance Criteria

1. WHEN a guest opens a tip page THEN the system SHALL display the venue's menu if it exists and contains items
2. WHEN displaying the menu THEN the system SHALL group items by categories in the correct display order
3. WHEN displaying menu items THEN the system SHALL show name, price, description (if present), and image (if present)
4. WHEN an item is marked unavailable THEN the system SHALL display it with a visual "unavailable" indicator
5. WHEN the menu is empty THEN the system SHALL hide the menu section from the tip page

### Requirement 7

**User Story:** As a developer, I want menu data to be serialized and parsed correctly, so that API communication is reliable.

#### Acceptance Criteria

1. WHEN the API returns menu data THEN the system SHALL serialize it as valid JSON
2. WHEN the API receives menu data THEN the system SHALL parse and validate it against the schema
3. WHEN serializing menu items THEN the system SHALL include all required fields (id, name, categoryId, price, isAvailable, displayOrder)
4. WHEN parsing menu data THEN the system SHALL reject malformed JSON with appropriate error messages
5. WHEN round-tripping menu data (serialize then parse) THEN the system SHALL produce equivalent data structures
