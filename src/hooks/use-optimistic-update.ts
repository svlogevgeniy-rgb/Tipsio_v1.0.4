/**
 * Hook for optimistic UI updates with rollback on error
 */

import { useRef, useCallback } from 'react';

/**
 * Hook for performing optimistic updates with automatic rollback
 */
export function useOptimisticUpdate<T>() {
  const snapshotRef = useRef<T | null>(null);

  /**
   * Perform an optimistic update
   * @param currentState - Current state to snapshot
   * @param optimisticUpdate - Function to update state optimistically
   * @param apiCall - Async API call to perform
   * @param onError - Optional error handler
   * @param onRollback - Function to rollback state on error
   */
  const performUpdate = useCallback(
    async <R>(
      currentState: T,
      optimisticUpdate: () => void,
      apiCall: () => Promise<R>,
      onRollback: (snapshot: T) => void,
      onError?: (error: Error) => void
    ): Promise<{ success: boolean; data?: R; error?: Error }> => {
      // Save snapshot
      snapshotRef.current = currentState;

      // Apply optimistic update
      optimisticUpdate();

      try {
        // Perform API call
        const data = await apiCall();
        return { success: true, data };
      } catch (error) {
        // Rollback on error
        if (snapshotRef.current !== null) {
          onRollback(snapshotRef.current);
        }

        const err = error instanceof Error ? error : new Error('Unknown error');
        onError?.(err);
        return { success: false, error: err };
      }
    },
    []
  );

  return { performUpdate };
}
