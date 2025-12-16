'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CategoryTree } from '@/types/menu';
import type { CreateCategoryInput, UpdateCategoryInput, CreateItemInput, UpdateItemInput } from '@/lib/menu-validation';

type DeleteStrategy = 'cascade' | 'move';

function cloneTree(categories: CategoryTree[]): CategoryTree[] {
  return categories.map((category) => ({
    ...category,
    children: cloneTree(category.children),
    items: category.items.map((item) => ({ ...item })),
  }));
}

function removeCategoryById(categories: CategoryTree[], id: string): CategoryTree[] {
  return categories
    .filter((category) => category.id !== id)
    .map((category) => ({
      ...category,
      children: removeCategoryById(category.children, id),
    }));
}

function removeItemById(categories: CategoryTree[], itemId: string): CategoryTree[] {
  return categories.map((category) => ({
    ...category,
    items: category.items.filter((item) => item.id !== itemId),
    children: removeItemById(category.children, itemId),
  }));
}

function toggleItemAvailability(categories: CategoryTree[], itemId: string): CategoryTree[] {
  return categories.map((category) => ({
    ...category,
    items: category.items.map((item) =>
      item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item,
    ),
    children: toggleItemAvailability(category.children, itemId),
  }));
}

export function useVenueMenu(venueId: string) {
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const categoriesRef = useRef<CategoryTree[]>([]);

  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);

  const fetchCategories = useCallback(async () => {
    if (!venueId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/menu/categories?venueId=${venueId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to load menu');
      }
      setCategories(data.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = useCallback(
    async (payload: CreateCategoryInput) => {
      const res = await fetch('/api/menu/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venueId, ...payload }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create category');
      }
      await fetchCategories();
    },
    [venueId, fetchCategories],
  );

  const updateCategory = useCallback(
    async (id: string, payload: UpdateCategoryInput) => {
      const res = await fetch(`/api/menu/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update category');
      }
      await fetchCategories();
    },
    [fetchCategories],
  );

  const deleteCategory = useCallback(
    async (id: string, strategy: DeleteStrategy = 'cascade', targetCategoryId?: string) => {
      const snapshot = cloneTree(categoriesRef.current);
      setCategories((current) => removeCategoryById(current, id));
      try {
        const res = await fetch(`/api/menu/categories/${id}?strategy=${strategy}${
          targetCategoryId ? `&targetCategoryId=${targetCategoryId}` : ''
        }`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Failed to delete category');
        }
      } catch (err) {
        setCategories(snapshot);
        throw err;
      }
    },
    [],
  );

  const createItem = useCallback(
    async (categoryId: string, payload: CreateItemInput) => {
      const res = await fetch('/api/menu/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, ...payload }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create item');
      }
      await fetchCategories();
    },
    [fetchCategories],
  );

  const updateItem = useCallback(
    async (id: string, payload: UpdateItemInput) => {
      const res = await fetch(`/api/menu/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update item');
      }
      await fetchCategories();
    },
    [fetchCategories],
  );

  const deleteItem = useCallback(async (id: string) => {
    const snapshot = cloneTree(categoriesRef.current);
    setCategories((current) => removeItemById(current, id));
    try {
      const res = await fetch(`/api/menu/items/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete item');
      }
    } catch (err) {
      setCategories(snapshot);
      throw err;
    }
  }, []);

  const toggleAvailability = useCallback(async (id: string) => {
    const snapshot = cloneTree(categoriesRef.current);
    setCategories((current) => toggleItemAvailability(current, id));
    try {
      const res = await fetch(`/api/menu/items/${id}`, {
        method: 'PATCH',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to toggle availability');
      }
    } catch (err) {
      setCategories(snapshot);
      throw err;
    }
  }, []);

  return {
    categories,
    loading,
    error,
    setError,
    refresh: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    createItem,
    updateItem,
    deleteItem,
    toggleAvailability,
  };
}
