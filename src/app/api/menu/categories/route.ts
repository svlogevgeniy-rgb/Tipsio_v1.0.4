export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { createCategorySchema } from '@/lib/menu-validation';
import { createCategory, getCategoriesTree } from '@/lib/menu-service';
import { requireAuth, requireVenueAccess, getVenueIdFromQuery } from '@/lib/api/middleware';
import { handleApiError, validationError, successResponse } from '@/lib/api/error-handler';

// GET /api/menu/categories - List categories for venue
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { session } = authResult;

    // Get and validate venueId
    const venueIdResult = getVenueIdFromQuery(request.url);
    if ('error' in venueIdResult) return venueIdResult.error;
    const { venueId } = venueIdResult;

    // Check venue access
    const venueResult = await requireVenueAccess(venueId, session);
    if ('error' in venueResult) return venueResult.error;

    // Fetch categories tree
    const categories = await getCategoriesTree(venueId);
    return successResponse({ categories });
  } catch (error) {
    return handleApiError(error, 'List categories');
  }
}

// POST /api/menu/categories - Create category
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { session } = authResult;

    // Parse request body
    const body = await request.json();
    const { venueId, ...categoryData } = body;

    if (!venueId) {
      return validationError('venueId is required');
    }

    // Validate category data
    const parsed = createCategorySchema.safeParse(categoryData);
    if (!parsed.success) {
      return validationError(parsed.error.issues[0].message);
    }

    // Check venue access
    const venueResult = await requireVenueAccess(venueId, session);
    if ('error' in venueResult) return venueResult.error;

    // Create category
    const category = await createCategory(venueId, parsed.data);
    return successResponse({ category }, 201);
  } catch (error) {
    return handleApiError(error, 'Create category');
  }
}
