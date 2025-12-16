'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { flattenCategoryTree } from '@/lib/category-tree';
import type { CategoryTree } from '@/types/menu';

interface CategoryFormProps {
  category?: CategoryTree;
  categories: CategoryTree[];
  onSubmit: (data: { name: string; description?: string; parentId?: string }) => Promise<void>;
  onCancel: () => void;
}

export function CategoryForm({ category, categories, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [parentId, setParentId] = useState(category?.parentId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        parentId: parentId || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const excludedCategoryId = category?.id;
  const availableParents = useMemo(
    () =>
      flattenCategoryTree(categories, {
        excludeId: excludedCategoryId,
        skipDescendants: true,
      }),
    [categories, excludedCategoryId],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          maxLength={100}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          maxLength={500}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentId">Parent Category</Label>
        <select
          id="parentId"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">None (Root level)</option>
          {availableParents.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {'—'.repeat(cat.depth)} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !name.trim()}>
          {loading ? 'Saving...' : category ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
