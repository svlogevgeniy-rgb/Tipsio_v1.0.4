/**
 * API middleware utilities for authentication and authorization
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { ApiContext, ApiErrorResponse, SessionUser } from '@/types/api';

/**
 * Check if user is authenticated
 * Returns session or error response
 */
export async function requireAuth(): Promise<
  { session: ApiContext } | { error: NextResponse }
> {
  const session = await auth();

  if (!session?.user) {
    return {
      error: NextResponse.json<ApiErrorResponse>(
        { code: 'AUTH_REQUIRED', message: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  const apiContext: ApiContext = {
    session: session as { user: SessionUser; expires: string },
    userId: session.user.id,
    userRole: session.user.role as SessionUser['role'],
  };

  return { session: apiContext };
}

/**
 * Check if user has access to a venue
 * Returns venue or error response
 */
export async function requireVenueAccess(
  venueId: string,
  session: ApiContext
): Promise<
  | { venue: NonNullable<Awaited<ReturnType<typeof prisma.venue.findUnique>>> }
  | { error: NextResponse }
> {
  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
  });

  if (!venue) {
    return {
      error: NextResponse.json<ApiErrorResponse>(
        { code: 'NOT_FOUND', message: 'Venue not found' },
        { status: 404 }
      ),
    };
  }

  // Admin has access to all venues
  if (session.userRole === 'ADMIN') {
    return { venue };
  }

  // Manager must own the venue
  if (venue.managerId !== session.userId) {
    return {
      error: NextResponse.json<ApiErrorResponse>(
        { code: 'FORBIDDEN', message: 'Access denied' },
        { status: 403 }
      ),
    };
  }

  return { venue };
}

/**
 * Check if user has required role
 * Returns true or error response
 */
export function requireRole(
  session: ApiContext,
  allowedRoles: SessionUser['role'][]
): { authorized: true } | { error: NextResponse } {
  if (!allowedRoles.includes(session.userRole)) {
    return {
      error: NextResponse.json<ApiErrorResponse>(
        { code: 'FORBIDDEN', message: 'Insufficient permissions' },
        { status: 403 }
      ),
    };
  }

  return { authorized: true };
}

/**
 * Extract and validate venueId from query params
 */
export function getVenueIdFromQuery(url: string): { venueId: string } | { error: NextResponse } {
  const { searchParams } = new URL(url);
  const venueId = searchParams.get('venueId');

  if (!venueId) {
    return {
      error: NextResponse.json<ApiErrorResponse>(
        { code: 'VALIDATION_ERROR', message: 'venueId is required' },
        { status: 400 }
      ),
    };
  }

  return { venueId };
}
