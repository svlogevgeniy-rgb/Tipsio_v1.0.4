# Design Document: Venue Menu

## Overview

Модуль управления меню заведения интегрируется в существующую архитектуру Tipsio. Использует Prisma ORM для работы с PostgreSQL, Next.js API Routes для бэкенда и React-компоненты для UI. Меню привязывается к Venue и отображается гостям на странице чаевых.

## Architecture

```mermaid
graph TB
    subgraph "Frontend"
        MC[MenuManager Component]
        MV[MenuView Component]
        MC --> API
        MV --> API
    end
    
    subgraph "API Layer"
        API[/api/menu/*]
        API --> SVC
    end
    
    subgraph "Service Layer"
        SVC[menu-service.ts]
        SVC --> VAL[validation.ts]
        SVC --> DB
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL)]
        DB --> MC_TBL[MenuCategory]
        DB --> MI_TBL[MenuItem]
    end
    
    subgraph "Existing"
        VENUE[Venue Model]
        TIP_PAGE[Tip Page]
    end
    
    MC_TBL --> VENUE
    MI_TBL --> MC_TBL
    TIP_PAGE --> MV
```

## Components and Interfaces

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/menu/categories` | GET | Получить все категории venue |
| `/api/menu/categories` | POST | Создать категорию |
| `/api/menu/categories/[id]` | PUT | Обновить категорию |
| `/api/menu/categories/[id]` | DELETE | Удалить категорию |
| `/api/menu/categories/reorder` | PUT | Изменить порядок категорий |
| `/api/menu/items` | GET | Получить все позиции venue |
| `/api/menu/items` | POST | Создать позицию |
| `/api/menu/items/[id]` | PUT | Обновить позицию |
| `/api/menu/items/[id]` | DELETE | Удалить позицию |
| `/api/menu/items/reorder` | PUT | Изменить порядок позиций |
| `/api/menu/[venueId]/public` | GET | Публичное меню для гостей |

### Service Layer (`src/lib/menu-service.ts`)

```typescript
// Category operations
createCategory(venueId: string, data: CreateCategoryInput): Promise<MenuCategory>
updateCategory(id: string, data: UpdateCategoryInput): Promise<MenuCategory>
deleteCategory(id: string, strategy: 'cascade' | 'move'): Promise<void>
reorderCategories(venueId: string, orderedIds: string[]): Promise<void>
getCategoriesTree(venueId: string): Promise<CategoryTree[]>

// Item operations
createItem(categoryId: string, data: CreateItemInput): Promise<MenuItem>
updateItem(id: string, data: UpdateItemInput): Promise<MenuItem>
deleteItem(id: string): Promise<void>
reorderItems(categoryId: string, orderedIds: string[]): Promise<void>
toggleItemAvailability(id: string): Promise<MenuItem>

// Public API
getPublicMenu(venueId: string): Promise<PublicMenu>
```

### UI Components

```
src/components/venue/menu/
├── MenuManager.tsx        # Главный компонент управления меню
├── CategoryList.tsx       # Список категорий с drag-n-drop
├── CategoryForm.tsx       # Форма создания/редактирования категории
├── ItemList.tsx           # Список позиций в категории
├── ItemForm.tsx           # Форма создания/редактирования позиции
├── ItemCard.tsx           # Карточка позиции
└── PublicMenuView.tsx     # Отображение меню для гостей
```

## Data Models

### Prisma Schema Extensions

```prisma
model MenuCategory {
  id           String   @id @default(cuid())
  name         String
  description  String?
  displayOrder Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  venueId      String
  venue        Venue    @relation(fields: [venueId], references: [id], onDelete: Cascade)
  
  parentId     String?
  parent       MenuCategory?  @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: SetNull)
  children     MenuCategory[] @relation("CategoryHierarchy")
  
  items        MenuItem[]

  @@unique([venueId, name])
  @@index([venueId])
  @@index([parentId])
  @@index([displayOrder])
}

model MenuItem {
  id           String   @id @default(cuid())
  name         String
  description  String?
  price        Int?              // Price in smallest currency unit (cents)
  imageUrl     String?
  isAvailable  Boolean  @default(true)
  displayOrder Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  categoryId   String
  category     MenuCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@index([categoryId])
  @@index([displayOrder])
  @@index([isAvailable])
}
```

### TypeScript Types (`src/types/menu.ts`)

```typescript
export interface MenuCategory {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number;
  parentId: string | null;
  venueId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  imageUrl: string | null;
  isAvailable: boolean;
  displayOrder: number;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryTree extends MenuCategory {
  children: CategoryTree[];
  items: MenuItem[];
}

export interface PublicMenu {
  categories: PublicCategory[];
}

export interface PublicCategory {
  id: string;
  name: string;
  description: string | null;
  children: PublicCategory[];
  items: PublicMenuItem[];
}

export interface PublicMenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  imageUrl: string | null;
  isAvailable: boolean;
}

// Input types for validation
export interface CreateCategoryInput {
  name: string;
  description?: string;
  parentId?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  parentId?: string | null;
}

export interface CreateItemInput {
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  isAvailable?: boolean;
}

export interface UpdateItemInput {
  name?: string;
  description?: string;
  price?: number | null;
  imageUrl?: string | null;
  isAvailable?: boolean;
  categoryId?: string;
}
```

### Zod Validation Schemas (`src/lib/menu-validation.ts`)

```typescript
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  parentId: z.string().cuid().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
});

export const createItemSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  price: z.number().int().min(0).optional(),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().optional().default(true),
});

export const updateItemSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  price: z.number().int().min(0).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  isAvailable: z.boolean().optional(),
  categoryId: z.string().cuid().optional(),
});

export const reorderSchema = z.object({
  orderedIds: z.array(z.string().cuid()).min(1),
});
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Category creation persists to database
*For any* valid category input (name 1-100 chars), creating a category should result in a persisted record with a unique id that can be retrieved from the database.
**Validates: Requirements 1.1, 1.5**

### Property 2: Name validation bounds
*For any* string, category and item name validation should accept strings with length 1-100 (categories) or 1-200 (items) and reject strings outside these bounds.
**Validates: Requirements 1.2, 3.1**

### Property 3: Display order auto-assignment
*For any* sequence of category or item creations, each new entity should receive a displayOrder equal to the count of existing entities in its scope (venue for categories, category for items).
**Validates: Requirements 1.3, 3.6**

### Property 4: Duplicate name rejection
*For any* venue with an existing category name, attempting to create another category with the same name should be rejected with a validation error.
**Validates: Requirements 1.4**

### Property 5: Category reordering consistency
*For any* list of category ids in a new order, after reordering, the displayOrder values should match the new order indices (0, 1, 2, ...).
**Validates: Requirements 2.2**

### Property 6: Category deletion with items
*For any* category containing items, deletion with 'cascade' strategy should remove all items, and deletion with 'move' strategy should relocate items to another category.
**Validates: Requirements 2.3**

### Property 7: Deletion reorders remaining entities
*For any* deletion of a category or item, the remaining entities should have contiguous displayOrder values starting from 0.
**Validates: Requirements 2.4, 4.4**

### Property 8: Price stored as integer
*For any* item with a price, the stored value should be an integer representing the smallest currency unit.
**Validates: Requirements 3.2**

### Property 9: Description length validation
*For any* string, item description validation should accept strings up to 1000 characters and reject longer strings.
**Validates: Requirements 3.3**

### Property 10: Availability toggle persistence
*For any* item, toggling availability should flip the isAvailable boolean and persist the change.
**Validates: Requirements 3.5, 4.5**

### Property 11: Item update validation
*For any* item update with valid data, all changed fields should be persisted and retrievable.
**Validates: Requirements 4.1**

### Property 12: Item category move
*For any* item moved to a different category, the item's categoryId should update and displayOrder should be assigned within the new category.
**Validates: Requirements 4.2**

### Property 13: Item reordering consistency
*For any* list of item ids in a new order within a category, after reordering, the displayOrder values should match the new order indices.
**Validates: Requirements 4.3**

### Property 14: Subcategory parent linking
*For any* subcategory creation with a parentId, the created category should have the correct parentId and appear in the parent's children list.
**Validates: Requirements 5.1**

### Property 15: Tree structure integrity
*For any* set of categories with parent-child relationships, building the tree should produce a structure where each category appears exactly once and children are nested under their parents.
**Validates: Requirements 5.2**

### Property 16: Parent deletion cascade
*For any* parent category deletion, subcategories should either be deleted (cascade) or moved to root (parentId = null) based on the strategy.
**Validates: Requirements 5.3**

### Property 17: Subcategory move preserves tree integrity
*For any* subcategory move to a new parent, the tree should remain valid with no orphaned nodes.
**Validates: Requirements 5.4**

### Property 18: Circular reference prevention
*For any* attempt to set a category's parent to itself or one of its descendants, the operation should be rejected.
**Validates: Requirements 5.5**

### Property 19: Public menu ordering
*For any* public menu retrieval, categories and items should be ordered by their displayOrder values.
**Validates: Requirements 6.2**

### Property 20: Public menu field completeness
*For any* item in the public menu, the response should include id, name, price, description, imageUrl, and isAvailable fields.
**Validates: Requirements 6.3**

### Property 21: Menu data round-trip
*For any* valid menu data structure, serializing to JSON and parsing back should produce an equivalent data structure.
**Validates: Requirements 7.5**

## Error Handling

### Validation Errors
- Invalid input data returns 400 with Zod error details
- Duplicate category name returns 409 Conflict
- Circular reference attempt returns 400 with specific message

### Authorization Errors
- Unauthenticated requests return 401
- Access to other venue's menu returns 403

### Not Found Errors
- Non-existent category/item returns 404
- Deleted parent category returns 404 when referenced

### Database Errors
- Connection failures return 503 Service Unavailable
- Constraint violations return 409 Conflict

## Testing Strategy

### Property-Based Testing Library
**fast-check** (already installed in project)

### Test Configuration
- Minimum 100 iterations per property test
- Custom generators for menu data structures

### Unit Tests
- Validation schema tests (edge cases for string lengths, price values)
- Tree building algorithm tests
- Display order calculation tests

### Property-Based Tests
Each correctness property will have a corresponding PBT:

```typescript
// Example structure for Property 21: Round-trip
describe('Property 21: Menu data round-trip', () => {
  it('should produce equivalent data after serialize/parse', () => {
    fc.assert(
      fc.property(menuItemArbitrary, (item) => {
        const serialized = JSON.stringify(item);
        const parsed = JSON.parse(serialized);
        expect(parsed).toEqual(item);
      }),
      { numRuns: 100 }
    );
  });
});
```

### Integration Tests
- API endpoint tests with real database
- Category hierarchy operations
- Concurrent modification handling

### Test Annotations
All property-based tests must include:
```typescript
/**
 * **Feature: venue-menu, Property {N}: {property_text}**
 * **Validates: Requirements X.Y**
 */
```
