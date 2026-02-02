/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
];

describe('QR Code Delete Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    
    (useVenueDashboard as any).mockReturnValue({
      data: {
        venue: { id: 'venue-1', name: 'Test Venue' },
      },
    });
  });

  it('should open confirmation dialog when delete button is clicked', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ qrCodes: mockQrCodes }),
    });

    const user = userEvent.setup();
    render(<QrCodesPage />);

    await waitFor(() => {
      expect(screen.getByText('Waiter QR')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Удалить');
    await user.click(deleteButton);

    // Check that confirmation dialog appears
    await waitFor(() => {
      expect(screen.getByText('Удалить QR-код?')).toBeInTheDocument();
      expect(screen.getByText('Это действие нельзя отменить. QR-код будет удалён навсегда.')).toBeInTheDocument();
    });
  });

  it('should close dialog without deleting when cancel is clicked', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ qrCodes: mockQrCodes }),
    });

    const user = userEvent.setup();
    render(<QrCodesPage />);

    await waitFor(() => {
      expect(screen.getByText('Waiter QR')).toBeInTheDocument();
    });

    // Open dialog
    const deleteButton = screen.getByText('Удалить');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Удалить QR-код?')).toBeInTheDocument();
    });

    // Click cancel
    const cancelButton = screen.getByText('Отмена');
    await user.click(cancelButton);

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText('Удалить QR-код?')).not.toBeInTheDocument();
    });

    // QR code should still be visible
    expect(screen.getByText('Waiter QR')).toBeInTheDocument();
  });

  it('should call DELETE API and update list when confirm is clicked', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ qrCodes: mockQrCodes }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

    const user = userEvent.setup();
    render(<QrCodesPage />);

    await waitFor(() => {
      expect(screen.getByText('Waiter QR')).toBeInTheDocument();
    });

    // Open dialog
    const deleteButton = screen.getByText('Удалить');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Удалить QR-код?')).toBeInTheDocument();
    });

    // Click confirm
    const confirmButton = screen.getByRole('button', { name: /удалить/i });
    await user.click(confirmButton);

    // Check API was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/venue/qr-codes/qr-1',
        { method: 'DELETE' }
      );
    });

    // QR code should be removed from list
    await waitFor(() => {
      expect(screen.queryByText('Waiter QR')).not.toBeInTheDocument();
    });
  });

  it('should show error message when deletion fails', async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ qrCodes: mockQrCodes }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

    const user = userEvent.setup();
    render(<QrCodesPage />);

    await waitFor(() => {
      expect(screen.getByText('Waiter QR')).toBeInTheDocument();
    });

    // Open dialog and confirm
    const deleteButton = screen.getByText('Удалить');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('Удалить QR-код?')).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /удалить/i });
    await user.click(confirmButton);

    // Error message should appear
    await waitFor(() => {
      expect(screen.getByText('Не удалось удалить QR-код')).toBeInTheDocument();
    });

    // QR code should still be visible
    expect(screen.getByText('Waiter QR')).toBeInTheDocument();
  });
});
