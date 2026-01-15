/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock dependencies
vi.mock('@/lib/api/middleware', () => ({
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    tip: {
      findMany: vi.fn(),
    },
  },
}));

describe('Admin Transactions API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/admin/transactions', () => {
    it('should require authentication', async () => {
      const { requireAuth } = await import('@/lib/api/middleware');
      vi.mocked(requireAuth).mockResolvedValue({
        error: new Response('Unauthorized', { status: 401 }),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/admin/transactions');
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

      const request = new NextRequest('http://localhost:3000/api/admin/transactions');
      const response = await GET(request);

      expect(response.status).toBe(403);
    });

    it('should return transactions for admin', async () => {
      const { requireAuth, requireRole } = await import('@/lib/api/middleware');
      const prisma = (await import('@/lib/prisma')).default;

      vi.mocked(requireAuth).mockResolvedValue({
        session: { userId: '1', userRole: 'ADMIN' } as any,
      });
      vi.mocked(requireRole).mockReturnValue({ authorized: true });
      vi.mocked(prisma.tip.findMany).mockResolvedValue([
        {
          id: 'tip1',
          orderId: 'TIP-123',
          venueId: 'venue1',
          netAmount: 50000,
          midtransStatus: 'capture',
          status: 'PAID',
          paymentMethod: 'GoPay',
          createdAt: new Date(),
          venue: { name: 'Test Venue' },
          staff: { name: 'Test Staff' },
        },
      ] as any);

      const request = new NextRequest('http://localhost:3000/api/admin/transactions');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });
});
