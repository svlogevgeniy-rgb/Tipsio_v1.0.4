/**
 * Reusable hook for sessionStorage with SSR safety
 */

import { useState, useEffect, useCallback } from 'react';

const isBrowser = () => typeof window !== 'undefined';

/**
 * Hook for persisting state in sessionStorage
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Initialize state
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isBrowser()) return initialValue;

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update sessionStorage when state changes
  useEffect(() => {
    if (!isBrowser()) return;

    try {
      window.sessionStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Clear function
  const clearValue = useCallback(() => {
    if (!isBrowser()) return;

    try {
      window.sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setStoredValue, clearValue];
}

/**
 * Hook for managing multiple related sessionStorage values
 */
export function useSessionStorageGroup<T extends Record<string, unknown>>(
  prefix: string,
  initialValues: T
): {
  values: T;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  clearAll: () => void;
} {
  const [values, setValues] = useState<T>(() => {
    if (!isBrowser()) return initialValues;

    const loaded = { ...initialValues };
    Object.keys(initialValues).forEach((key) => {
      try {
        const item = window.sessionStorage.getItem(`${prefix}_${key}`);
        if (item) {
          loaded[key as keyof T] = JSON.parse(item) as T[keyof T];
        }
      } catch (error) {
        console.error(`Error reading sessionStorage key "${prefix}_${key}":`, error);
      }
    });
    return loaded;
  });

  // Update individual value
  const setValue = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      if (!isBrowser()) return;

      try {
        window.sessionStorage.setItem(`${prefix}_${key as string}`, JSON.stringify(value));
        setValues((prev) => ({ ...prev, [key]: value }));
      } catch (error) {
        console.error(`Error setting sessionStorage key "${prefix}_${key as string}":`, error);
      }
    },
    [prefix]
  );

  // Clear all values
  const clearAll = useCallback(() => {
    if (!isBrowser()) return;

    Object.keys(initialValues).forEach((key) => {
      try {
        window.sessionStorage.removeItem(`${prefix}_${key}`);
      } catch (error) {
        console.error(`Error removing sessionStorage key "${prefix}_${key}":`, error);
      }
    });
    setValues(initialValues);
  }, [prefix, initialValues]);

  return { values, setValue, clearAll };
}
