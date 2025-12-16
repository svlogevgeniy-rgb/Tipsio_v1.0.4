'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { flattenCategoryTree } from '@/lib/category-tree';
import type { MenuItem, CategoryTree } from '@/types/menu';

interface ItemFormProps {
  item?: MenuItem;
  categories: CategoryTree[];
  categoryId: string;
  onSubmit: (data: {
    name: string;
    description?: string;
    price?: number;
    imageUrl?: string;
    isAvailable?: boolean;
    categoryId?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export function ItemForm({ item, categories, categoryId, onSubmit, onCancel }: ItemFormProps) {
  const [name, setName] = useState(item?.name || '');
  const [description, setDescription] = useState(item?.description || '');
  const [price, setPrice] = useState(item?.price ? String(item.price / 100) : '');
  const [imageUrl, setImageUrl] = useState(item?.imageUrl || '');
  const [isAvailable, setIsAvailable] = useState(item?.isAvailable ?? true);
  const [selectedCategoryId, setSelectedCategoryId] = useState(item?.categoryId || categoryId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const priceInCents = price ? Math.round(parseFloat(price) * 100) : undefined;
      
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        price: priceInCents,
        imageUrl: imageUrl.trim() || undefined,
        isAvailable,
        categoryId: item ? selectedCategoryId : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = useMemo(
    () => flattenCategoryTree(categories),
    [categories],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
          maxLength={200}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          maxLength={1000}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      {item && (
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {categoryOptions.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {'—'.repeat(cat.depth)} {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Switch
          id="isAvailable"
          checked={isAvailable}
          onCheckedChange={setIsAvailable}
        />
        <Label htmlFor="isAvailable">Available</Label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !name.trim()}>
          {loading ? 'Saving...' : item ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
