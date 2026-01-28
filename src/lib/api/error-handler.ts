/**
 * Centralized API error handling
 */

import { NextResponse } from 'next/server';
import type { ApiErrorResponse } from '@/types/api';

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  // Log error for debugging
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error(`${context ? `${context}: ` : ''}API error:`, errorMessage, error);

  // Handle specific error types
  if (error instanceof Error) {
    // Unique constraint violation
    if (error.message.includes('Unique constraint')) {
      return NextResponse.json<ApiErrorResponse>(
        { code: 'CONFLICT', message: 'Resource already exists' },
        { status: 409 }
      );
    }

    // Circular reference in categories
    if (error.message.includes('circular')) {
      return NextResponse.json<ApiErrorResponse>(
        { code: 'VALIDATION_ERROR', message: error.message },
        { status: 400 }
      );
    }

    // Last category deletion
    if (error.message.includes('last category')) {
      return NextResponse.json<ApiErrorResponse>(
        { code: 'VALIDATION_ERROR', message: error.message },
        { status: 400 }
      );
    }
  }

  // Default internal server error
  return NextResponse.json<ApiErrorResponse>(
    { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    { status: 500 }
  );
}

/**
 * Create validation error response
 */
export function validationError(message: string): NextResponse {
  return NextResponse.json<ApiErrorResponse>(
    { code: 'VALIDATION_ERROR', message },
    { status: 400 }
  );
}

/**
 * Create not found error response
 */
export function notFoundError(resource: string): NextResponse {
  return NextResponse.json<ApiErrorResponse>(
    { code: 'NOT_FOUND', message: `${resource} not found` },
    { status: 404 }
  );
}

/**
 * Create success response
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}
