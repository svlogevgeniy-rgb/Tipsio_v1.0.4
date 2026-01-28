# Implementation Plan

## 1. Database Schema and Types

- [x] 1.1 Add MenuCategory and MenuItem models to Prisma schema
  - Add MenuCategory model with self-referencing relation for hierarchy
  - Add MenuItem model with category relation
  - Add relation from Venue to MenuCategory
  - Create indexes for performance
  - _Requirements: 1.1, 3.1, 5.1_

- [ ] 1.2 Run database migration
  - Execute `prisma db push` to apply schema changes
  - Verify tables created correctly
  - _Requirements: 1.5_

- [x] 1.3 Create TypeScript types for menu entities
  - Create `src/types/menu.ts` with all interfaces
  - Export MenuCategory, MenuItem, CategoryTree, PublicMenu types
  - Export input types for create/update operations
  - _Requirements: 7.1, 7.3_

- [x] 1.4 Create Zod validation schemas
  - Create `src/lib/menu-validation.ts`
  - Add schemas for category create/update
  - Add schemas for item create/update
  - Add reorder schema
  - _Requirements: 1.2, 3.1, 3.3, 7.2_

- [ ]* 1.5 Write property tests for validation schemas
  - **Property 2: Name validation bounds**
  - **Property 9: Description length validation**
  - **Validates: Requirements 1.2, 3.1, 3.3**

## 2. Menu Service Layer

- [x] 2.1 Create menu service with category operations
  - Create `src/lib/menu-service.ts`
  - Implement createCategory with auto displayOrder
  - Implement updateCategory with validation
  - Implement deleteCategory with cascade/move strategies
  - Implement reorderCategories
  - Implement getCategoriesTree for hierarchy
  - _Requirements: 1.1, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4_

- [ ]* 2.2 Write property tests for category operations
  - **Property 1: Category creation persists to database**
  - **Property 3: Display order auto-assignment**
  - **Property 4: Duplicate name rejection**
  - **Property 5: Category reordering consistency**
  - **Property 7: Deletion reorders remaining entities**
  - **Validates: Requirements 1.1, 1.3, 1.4, 1.5, 2.2, 2.4**

- [x] 2.3 Implement menu item operations in service
  - Implement createItem with auto displayOrder
  - Implement updateItem with validation
  - Implement deleteItem with reordering
  - Implement reorderItems
  - Implement toggleItemAvailability
  - _Requirements: 3.1, 3.2, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 2.4 Write property tests for item operations
  - **Property 8: Price stored as integer**
  - **Property 10: Availability toggle persistence**
  - **Property 11: Item update validation**
  - **Property 12: Item category move**
  - **Property 13: Item reordering consistency**
  - **Validates: Requirements 3.2, 3.5, 4.1, 4.2, 4.3, 4.5**

- [x] 2.5 Implement hierarchy operations
  - Implement subcategory creation with parent linking
  - Implement circular reference detection
  - Implement parent deletion with cascade/move
  - Implement subcategory move
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 2.6 Write property tests for hierarchy operations
  - **Property 14: Subcategory parent linking**
  - **Property 15: Tree structure integrity**
  - **Property 16: Parent deletion cascade**
  - **Property 17: Subcategory move preserves tree integrity**
  - **Property 18: Circular reference prevention**
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

- [x] 2.7 Implement public menu retrieval
  - Implement getPublicMenu with ordering
  - Filter out unavailable items option
  - Build tree structure for response
  - _Requirements: 6.1, 6.2, 6.3_

- [ ]* 2.8 Write property tests for public menu
  - **Property 19: Public menu ordering**
  - **Property 20: Public menu field completeness**
  - **Property 21: Menu data round-trip**
  - **Validates: Requirements 6.2, 6.3, 7.5**

## 3. Checkpoint

- [ ] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## 4. API Endpoints

- [x] 4.1 Create category API endpoints
  - Create `src/app/api/menu/categories/route.ts` (GET, POST)
  - Create `src/app/api/menu/categories/[id]/route.ts` (PUT, DELETE)
  - Create `src/app/api/menu/categories/reorder/route.ts` (PUT)
  - Add authentication and venue authorization
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4_

- [x] 4.2 Create item API endpoints
  - Create `src/app/api/menu/items/route.ts` (GET, POST)
  - Create `src/app/api/menu/items/[id]/route.ts` (PUT, DELETE)
  - Create `src/app/api/menu/items/reorder/route.ts` (PUT)
  - Add authentication and venue authorization
  - _Requirements: 3.1, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4.3 Create public menu API endpoint
  - Create `src/app/api/menu/[venueId]/public/route.ts` (GET)
  - No authentication required
  - Return ordered menu with categories and items
  - _Requirements: 6.1, 6.2, 6.3_

## 5. UI Components - Manager

- [x] 5.1 Create MenuManager main component
  - Create `src/components/venue/menu/MenuManager.tsx`
  - Implement category list with expand/collapse
  - Add create category button and modal
  - _Requirements: 1.1, 2.1_

- [x] 5.2 Create CategoryForm component
  - Create `src/components/venue/menu/CategoryForm.tsx`
  - Form for name, description, parent selection
  - Validation feedback
  - _Requirements: 1.2, 5.1_

- [ ] 5.3 Create CategoryList component with drag-n-drop
  - Create `src/components/venue/menu/CategoryList.tsx`
  - Render tree structure
  - Implement drag-n-drop reordering
  - Edit and delete actions
  - _Requirements: 2.2, 5.2_

- [x] 5.4 Create ItemForm component
  - Create `src/components/venue/menu/ItemForm.tsx`
  - Form for name, description, price, image, availability
  - Category selection dropdown
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 5.5 Create ItemList and ItemCard components
  - Create `src/components/venue/menu/ItemList.tsx`
  - Create `src/components/venue/menu/ItemCard.tsx`
  - Display item details with availability toggle
  - Drag-n-drop reordering
  - Edit and delete actions
  - _Requirements: 3.5, 4.3, 4.5_

- [x] 5.6 Create menu management page
  - Create `src/app/venue/(dashboard)/menu/page.tsx`
  - Integrate MenuManager component
  - Add to venue navigation
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

## 6. UI Components - Guest View

- [x] 6.1 Create PublicMenuView component
  - Create `src/components/venue/menu/PublicMenuView.tsx`
  - Display categories as accordion/tabs
  - Show items with images and prices
  - Visual indicator for unavailable items
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 6.2 Integrate menu into tip page
  - Update `src/app/tip/[shortCode]/page.tsx`
  - Fetch and display venue menu
  - Hide section if menu is empty
  - _Requirements: 6.1, 6.5_

## 7. Final Checkpoint

- [ ] 7. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
