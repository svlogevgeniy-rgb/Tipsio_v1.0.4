/**
 * Reusable hook for API requests with loading and error states
 */

import { useState, useCallback } from 'react';
import { ApiError } from '@/lib/api/client';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiActions {
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * Hook for managing API request state
 */
export function useApiState<T>(initialData: T | null = null) {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  return {
    data,
    setData,
    loading,
    setLoading,
    error,
    setError,
    clearError,
  };
}

/**
 * Execute an async API call with automatic error handling
 */
export async function executeApiCall<T>(
  apiCall: () => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: string) => void
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await apiCall();
    onSuccess?.(data);
    return { data };
  } catch (err) {
    const errorMessage =
      err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Request failed';
    onError?.(errorMessage);
    return { error: errorMessage };
  }
}

/**
 * Hook for API mutations (POST, PUT, PATCH, DELETE)
 */
export function useApiMutation<TData = unknown, TVariables = unknown>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (
      apiCall: (variables: TVariables) => Promise<TData>,
      variables: TVariables
    ): Promise<{ data?: TData; error?: string }> => {
      setLoading(true);
      setError(null);

      const result = await executeApiCall(
        () => apiCall(variables),
        undefined,
        (err) => setError(err)
      );

      setLoading(false);
      return result;
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    mutate,
    loading,
    error,
    setError,
    clearError,
  };
}
