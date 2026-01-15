/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PATCH } from './route';

// Mock dependencies
vi.mock('@/lib/api/middleware', () => ({
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    venue: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('Admin Venues API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/admin/venues', () => {
    it('should require authentication', async () => {
      const { requireAuth } = await import('@/lib/api/middleware');
      vi.mocked(requireAuth).mockResolvedValue({
        error: new Response('Unauthorized', { status: 401 }),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/venues');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should require admin role', async () => {
      const { requireAuth, requireRole } = await import('@/lib/api/middleware');
      vi.mocked(requireAuth).mockResolvedValue({
        session: { userId: '1', userRole: 'MANAGER' } as any,
      });
      vi.mocked(requireRole).mockReturnValue({
        error: new Response('Forbidden', { status: 403 }),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/venues');
      const response = await GET(request);

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/admin/venues', () => {
    it('should update venue status', async () => {
      const { requireAuth, requireRole } = await import('@/lib/api/middleware');
      const prisma = (await import('@/lib/prisma')).default;

      vi.mocked(requireAuth).mockResolvedValue({
        session: { userId: '1', userRole: 'ADMIN' } as any,
      });
      vi.mocked(requireRole).mockReturnValue({ authorized: true });
      vi.mocked(prisma.venue.update).mockResolvedValue({
        id: 'venue1',
        status: 'BLOCKED',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/venues', {
        method: 'PATCH',
        body: JSON.stringify({ venueId: 'venue1', status: 'BLOCKED' }),
      });

      const response = await PATCH(request);
      expect(response.status).toBe(200);
    });
  });
});
