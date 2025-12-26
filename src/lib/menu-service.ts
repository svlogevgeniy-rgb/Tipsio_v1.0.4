import { prisma } from './prisma';
import type { CategoryTree, PublicMenu, PublicCategory, PublicMenuItem } from '@/types/menu';
import type { CreateCategoryInput, UpdateCategoryInput, CreateItemInput, UpdateItemInput } from './menu-validation';

// ==================== CATEGORY OPERATIONS ====================

export async function createCategory(venueId: string, data: CreateCategoryInput) {
  // Get current max displayOrder for this venue
  const maxOrder = await prisma.menuCategory.aggregate({
    where: { venueId, parentId: data.parentId ?? null },
    _max: { displayOrder: true },
  });

  const displayOrder = (maxOrder._max.displayOrder ?? -1) + 1;

  return prisma.menuCategory.create({
    data: {
      name: data.name,
      description: data.description,
      parentId: data.parentId,
      venueId,
      displayOrder,
    },
  });
}

export async function updateCategory(id: string, data: UpdateCategoryInput) {
  // If changing parent, check for circular reference
  if (data.parentId !== undefined) {
    const isCircular = await checkCircularReference(id, data.parentId);
    if (isCircular) {
      throw new Error('Cannot create circular category reference');
    }
  }

  return prisma.menuCategory.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      parentId: data.parentId,
    },
  });
}

export async function deleteCategory(
  id: string, 
  strategy: 'cascade' | 'move' = 'cascade',
  targetCategoryId?: string
) {
  const category = await prisma.menuCategory.findUnique({
    where: { id },
    include: { items: true, children: true },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  // Check if this is the last category
  const categoryCount = await prisma.menuCategory.count({
    where: { venueId: category.venueId },
  });

  if (categoryCount === 1) {
    throw new Error('Cannot delete the last category');
  }

  if (strategy === 'move' && (category.items.length > 0 || category.children.length > 0)) {
    if (!targetCategoryId) {
      throw new Error('Target category required for move strategy');
    }

    // Move items to target category
    await prisma.menuItem.updateMany({
      where: { categoryId: id },
      data: { categoryId: targetCategoryId },
    });

    // Move children to target category (or root)
    await prisma.menuCategory.updateMany({
      where: { parentId: id },
      data: { parentId: targetCategoryId },
    });
  }

  // Delete category (cascade will handle items if not moved)
  await prisma.menuCategory.delete({ where: { id } });

  // Reorder remaining categories
  await reorderAfterDelete(category.venueId, category.parentId, category.displayOrder);
}

export async function reorderCategories(venueId: string, orderedIds: string[]) {
  const updates = orderedIds.map((id, index) =>
    prisma.menuCategory.update({
      where: { id },
      data: { displayOrder: index },
    })
  );

  await prisma.$transaction(updates);
}

export async function getCategoriesTree(venueId: string): Promise<CategoryTree[]> {
  const categories = await prisma.menuCategory.findMany({
    where: { venueId },
    include: { items: { orderBy: { displayOrder: 'asc' } } },
    orderBy: { displayOrder: 'asc' },
  });

  return buildCategoryTree(categories);
}

export async function getCategoryById(id: string) {
  return prisma.menuCategory.findUnique({
    where: { id },
    include: { items: { orderBy: { displayOrder: 'asc' } } },
  });
}
