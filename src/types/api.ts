/**
 * Common API types and interfaces
 */

// Standard API error codes
export type ApiErrorCode =
  | 'AUTH_REQUIRED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'
  | 'MIDTRANS_REQUIRED';

// Standard API error response
export interface ApiErrorResponse {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
}

// Standard API success response wrapper
export interface ApiSuccessResponse<T = unknown> {
  data?: T;
  message?: string;
}

// Session user type
export interface SessionUser {
  id: string;
  email?: string | null;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
}

// Extended session type
export interface AppSession {
  user: SessionUser;
  expires: string;
}

// API handler context
export interface ApiContext {
  session: AppSession;
  userId: string;
  userRole: SessionUser['role'];
}

// Venue access check result
export interface VenueAccessResult {
  hasAccess: boolean;
  venue?: {
    id: string;
    managerId: string;
    [key: string]: unknown;
  };
}
