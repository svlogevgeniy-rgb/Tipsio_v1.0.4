export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { createItemSchema } from '@/lib/menu-validation';
import { createItem } from '@/lib/menu-service';
import { requireAuth, requireVenueAccess, getVenueIdFromQuery } from '@/lib/api/middleware';
import { handleApiError, validationError, notFoundError, successResponse } from '@/lib/api/error-handler';

// GET /api/menu/items - List items for venue
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

    // Get optional categoryId filter
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    // Fetch items
    const items = await prisma.menuItem.findMany({
      where: {
        category: { venueId },
        ...(categoryId ? { categoryId } : {}),
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return successResponse({ items });
  } catch (error) {
    return handleApiError(error, 'List items');
  }
}

// POST /api/menu/items - Create item
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth();
    if ('error' in authResult) return authResult.error;
    const { session } = authResult;

    // Parse request body
    const body = await request.json();
    const { categoryId, ...itemData } = body;

    if (!categoryId) {
      return validationError('categoryId is required');
    }

    // Validate item data
    const parsed = createItemSchema.safeParse(itemData);
    if (!parsed.success) {
      return validationError(parsed.error.issues[0].message);
    }

    // Check category exists and get venue
    const category = await prisma.menuCategory.findUnique({
      where: { id: categoryId },
      include: { venue: true },
    });

    if (!category) {
      return notFoundError('Category');
    }

    // Check venue access
    const venueResult = await requireVenueAccess(category.venue.id, session);
    if ('error' in venueResult) return venueResult.error;

    // Create item
    const item = await createItem(categoryId, parsed.data);
    return successResponse({ item }, 201);
  } catch (error) {
    return handleApiError(error, 'Create item');
  }
}
