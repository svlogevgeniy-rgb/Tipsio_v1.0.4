/**
 * Type-safe API client utilities
 */

import type { ApiErrorResponse } from '@/types/api';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public code: ApiErrorResponse['code'],
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Parse API response and handle errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    const error = data as ApiErrorResponse;
    throw new ApiError(
      error.code || 'INTERNAL_ERROR',
      error.message || 'Request failed',
      response.status,
      error.details
    );
  }

  return data as T;
}

/**
 * Type-safe GET request
 */
export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  return handleResponse<T>(response);
}

/**
 * Type-safe POST request
 */
export async function apiPost<T, D = unknown>(url: string, data: D): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse<T>(response);
}

/**
 * Type-safe PUT request
 */
export async function apiPut<T, D = unknown>(url: string, data: D): Promise<T> {
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse<T>(response);
}

/**
 * Type-safe PATCH request
 */
export async function apiPatch<T, D = unknown>(url: string, data?: D): Promise<T> {
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
  });

  return handleResponse<T>(response);
}

/**
 * Type-safe DELETE request
 */
export async function apiDelete<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  return handleResponse<T>(response);
}

/**
 * Build URL with query parameters
 */
export function buildUrl(base: string, params: Record<string, string | number | boolean>): string {
  const url = new URL(base, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}
