import type { CategoryTree } from '@/types/menu';

export interface FlattenedCategory {
  id: string;
  name: string;
  depth: number;
}

export interface FlattenCategoryTreeOptions {
  excludeId?: string;
  skipDescendants?: boolean;
}

/**
 * Flatten CategoryTree nodes into a depth-aware array for form selects.
 * Optionally excludes a category and its descendants to avoid circular relationships.
 */
export function flattenCategoryTree(
  categories: CategoryTree[],
  options: FlattenCategoryTreeOptions = {},
): FlattenedCategory[] {
  const { excludeId, skipDescendants = false } = options;
  const flattened: FlattenedCategory[] = [];

  const walk = (
    nodes: CategoryTree[],
    depth: number,
    isPrunedBranch: boolean,
  ) => {
    if (isPrunedBranch) {
      return;
    }

    for (const node of nodes) {
      const isExcludedNode =
        typeof excludeId !== 'undefined' && node.id === excludeId;

      if (!isExcludedNode) {
        flattened.push({ id: node.id, name: node.name, depth });
      }

      const shouldPruneChildren =
        isPrunedBranch || (skipDescendants && isExcludedNode);

      walk(node.children, depth + 1, shouldPruneChildren);
    }
  };

  walk(categories, 0, false);
  return flattened;
}
