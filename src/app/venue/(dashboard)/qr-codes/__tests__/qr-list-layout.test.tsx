/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useVenueDashboard } from '@/features/venue-dashboard/hooks/useVenueDashboard';
import QrCodesPage from '../page';

// Mock dependencies
vi.mock('@/features/venue-dashboard/hooks/useVenueDashboard');
vi.mock('@/i18n/client', () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'user-1' } }, status: 'authenticated' }),
}));

const mockQrCodes = [
  {
    id: 'qr-1',
    type: 'INDIVIDUAL',
    label: 'Waiter QR',
    shortCode: 'ABC123',
    status: 'ACTIVE',
    staff: {
      id: 'staff-1',
      displayName: 'John Doe',
      status: 'ACTIVE',
      avatarUrl: null,
      role: 'Waiter',
    },
  },
  {
    id: 'qr-2',
    type: 'TEAM',
    label: 'Team QR',
    shortCode: 'XYZ789',
    status: 'ACTIVE',
    recipients: [
      { id: 'staff-1', displayName: 'John Doe', status: 'ACTIVE', avatarUrl: null, role: 'Waiter' },
      { id: 'staff-2', displayName: 'Jane Smith', status: 'ACTIVE', avatarUrl: null, role: 'Bartender' },
    ],
  },
];

describe('QR Codes List Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    
    (useVenueDashboard as any).mockReturnValue({
      data: {
        venue: { id: 'venue-1', name: 'Test Venue' },
      },
    });
  });

  it('should render QR codes in list format (not grid)', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ qrCodes: mockQrCodes }),
    });

    const { container } = render(<QrCodesPage />);

    await waitFor(() => {
      expect(screen.getByText('Waiter QR')).toBeInTheDocument();
    });

    // Check that the QR codes container uses space-y-4 (list layout)
    const listContainer = container.querySelector('.space-y-4');
    expect(listContainer).toBeInTheDocument();
    
    // Ensure the QR codes are not in a grid with md:grid-cols-2
    const gridContainer = container.querySelector('.md\\:grid-cols-2');
    expect(gridContainer).toBeNull();
  });

  it('should display QR code image for each entry', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ qrCodes: mockQrCodes }),
    });

    render(<QrCodesPage />);

    await waitFor(() => {
      const qrImages = screen.getAllByAltText('QR Code');
      expect(qrImages).toHaveLength(2);
      expect(qrImages[0]).toHaveAttribute('src', '/api/qr/qr-1/download?format=svg');
      expect(qrImages[1]).toHaveAttribute('src', '/api/qr/qr-2/download?format=svg');
    });
  });

  it('should display staff name for individual QR codes', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ qrCodes: mockQrCodes }),
    });

    render(<QrCodesPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should display recipient count for team QR codes', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ qrCodes: mockQrCodes }),
    });

    render(<QrCodesPage />);

    await waitFor(() => {
      expect(screen.getByText('2 сотрудников')).toBeInTheDocument();
    });
  });

  it('should display short code URL for each entry', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ qrCodes: mockQrCodes }),
    });

    render(<QrCodesPage />);

    await waitFor(() => {
      expect(screen.getByText(/\/tip\/ABC123/)).toBeInTheDocument();
      expect(screen.getByText(/\/tip\/XYZ789/)).toBeInTheDocument();
    });
  });

  it('should display delete button for each QR code entry', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ qrCodes: mockQrCodes }),
    });

    render(<QrCodesPage />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Удалить');
      expect(deleteButtons).toHaveLength(2);
    });
  });
});
