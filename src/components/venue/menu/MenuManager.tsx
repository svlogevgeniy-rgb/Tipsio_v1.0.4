'use client';

import { useEffect, useState } from 'react';
import { Plus, ChevronDown, ChevronRight, Pencil, Trash2, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CategoryForm } from './CategoryForm';
import { ItemForm } from './ItemForm';
import { ItemCard } from './ItemCard';
import { useVenueMenu } from './use-venue-menu';
import type { CategoryTree, MenuItem } from '@/types/menu';
import type { CreateItemInput, UpdateItemInput } from '@/lib/menu-validation';

type ItemFormValues = {
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  isAvailable?: boolean;
  categoryId?: string;
};

interface MenuManagerProps {
  venueId: string;
}

type DeleteTarget =
  | { type: 'category'; entity: CategoryTree }
  | { type: 'item'; entity: MenuItem };

export function MenuManager({ venueId }: MenuManagerProps) {
  const {
    categories,
    loading,
    error,
    setError,
    createCategory,
    updateCategory,
    deleteCategory,
    createItem,
    updateItem,
    deleteItem,
    toggleAvailability,
  } = useVenueMenu(venueId);

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryTree | undefined>();
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<DeleteTarget | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleExecute = async (action: () => Promise<void>) => {
    setActionError(null);
    try {
      await action();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateCategory = async (data: { name: string; description?: string; parentId?: string }) => {
    await handleExecute(() => createCategory(data));
    setCategoryDialogOpen(false);
  };

  const handleUpdateCategory = async (data: { name: string; description?: string; parentId?: string }) => {
    if (!editingCategory) return;
    await handleExecute(() => updateCategory(editingCategory.id, data));
    setCategoryDialogOpen(false);
    setEditingCategory(undefined);
  };

  const handleCreateItem = async (data: ItemFormValues) => {
    const payload: CreateItemInput = {
      name: data.name,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl,
      isAvailable: data.isAvailable ?? true,
    };
    await handleExecute(() => createItem(selectedCategoryId, payload));
    setItemDialogOpen(false);
  };

  const handleUpdateItem = async (data: ItemFormValues) => {
    if (!editingItem) return;
    const payload: UpdateItemInput = {
      name: data.name,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl,
      isAvailable: data.isAvailable,
      categoryId: data.categoryId,
    };
    await handleExecute(() => updateItem(editingItem.id, payload));
    setItemDialogOpen(false);
    setEditingItem(undefined);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      if (pendingDelete.type === 'category') {
        await deleteCategory(pendingDelete.entity.id);
      } else {
        await deleteItem(pendingDelete.entity.id);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setPendingDelete(null);
    }
  };

  const handleToggleAvailability = async (id: string) => {
    try {
      await toggleAvailability(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to toggle availability');
    }
  };

  useEffect(() => {
    const allIds = new Set<string>();
    const collect = (nodes: CategoryTree[]) => {
      nodes.forEach((node) => {
        allIds.add(node.id);
        collect(node.children);
      });
    };
    collect(categories);
    setExpandedCategories(allIds);
  }, [categories]);

  const renderCategory = (category: CategoryTree, depth = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children.length > 0 || category.items.length > 0;

    return (
      <div key={category.id} className="border rounded-lg mb-2" style={{ marginLeft: depth * 16 }}>
        <div className="flex items-center gap-2 p-3 bg-muted/50">
          <button
            onClick={() => toggleExpanded(category.id)}
            className="p-1 hover:bg-muted rounded"
            disabled={!hasChildren}
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            ) : (
              <div className="w-4" />
            )}
          </button>

          <div className="flex-1">
            <h3 className="font-medium">{category.name}</h3>
            {category.description && <p className="text-sm text-muted-foreground">{category.description}</p>}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedCategoryId(category.id);
                setEditingItem(undefined);
                setItemDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Item
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditingCategory(category);
                setCategoryDialogOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPendingDelete({ type: 'category', entity: category })}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="p-3 space-y-2">
            {category.items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={() => {
                  setSelectedCategoryId(category.id);
                  setEditingItem(item);
                  setItemDialogOpen(true);
                }}
                onDelete={() => setPendingDelete({ type: 'item', entity: item })}
                onToggleAvailability={() => handleToggleAvailability(item.id)}
              />
            ))}
            {category.children.map((child) => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="p-8 text-center">Loading menu...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        {error}
        <Button variant="link" onClick={() => (setError(null), setActionError(null))}>
          Dismiss
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Menu</h2>
        <Button
          onClick={() => {
            setEditingCategory(undefined);
            setCategoryDialogOpen(true);
          }}
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {actionError && <p className="text-sm text-red-500">{actionError}</p>}

      {categories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No menu categories yet.</p>
          <p className="text-sm">Create your first category to start building your menu.</p>
        </div>
      ) : (
        <div className="space-y-2">{categories.map((cat) => renderCategory(cat))}</div>
      )}

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={editingCategory}
            categories={categories}
            onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
            onCancel={() => {
              setCategoryDialogOpen(false);
              setEditingCategory(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'New Item'}</DialogTitle>
          </DialogHeader>
          <ItemForm
            item={editingItem}
            categories={categories}
            categoryId={selectedCategoryId}
            onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
            onCancel={() => {
              setItemDialogOpen(false);
              setEditingItem(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {pendingDelete?.type === 'category'
              ? `Delete category "${pendingDelete.entity?.name}" and all nested content?`
              : `Delete item "${pendingDelete?.entity?.name}"?`}
          </p>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
