import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import TipSuccessPage from './page';

// Mock next/navigation
const mockSearchParams = new Map<string, string>();
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) || null,
  }),
}));

// Mock i18n
const mockT = vi.fn((key: string) => {
  const translations: Record<string, string> = {
    'title': 'Thank you! 🙌',
    'subtitle': 'Your tip has been sent successfully.',
    'amount': 'Amount',
    'to': 'To',
    'theTeam': 'The Team',
    'message': 'Your support helps us reward our staff.',
    'close': 'Close',
    'poweredBy': '© 2026 TIPSIO.',
  };
  return translations[key] || key;
});

vi.mock('@/i18n/client', () => ({
  useTranslations: () => mockT,
}));

// Mock formatCurrencyIDRIntl
vi.mock('@/lib/i18n/formatters', () => ({
  formatCurrencyIDRIntl: (amount: number) => `Rp ${amount.toLocaleString()}`,
}));

// Mock LanguageSwitcher
vi.mock('@/components/ui/language-switcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">EN</div>,
}));

// Mock StaffAvatar
vi.mock('@/components/tip/StaffAvatar', () => ({
  StaffAvatar: ({ src, alt, size }: { src: string | null; alt: string; size: string }) => (
    <div data-testid="staff-avatar" data-src={src} data-alt={alt} data-size={size}>
      Avatar
    </div>
  ),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Sample tip details for tests
const mockTipDetails = {
  amount: 50000,
  staffName: 'John Doe',
  venueName: 'Test Cafe',
  staffAvatarUrl: 'https://example.com/john.jpg',
};

const mockTipDetailsNoStaff = {
  amount: 30000,
  staffName: null,
  venueName: 'Test Cafe',
  staffAvatarUrl: null,
};

/**
 * Property-based tests for Success Page query parameters
 * 
 * **Feature: tip-payment-ui-redesign**
 * **Property 9: Success Page Query Parameter Handling**
 * Valid params show success, invalid show error
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3**
 */
describe('Success Page Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    mockSearchParams.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Property 9: Valid order_id should show success state', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        async (orderId) => {
          mockSearchParams.clear();
          mockSearchParams.set('order_id', orderId);
          
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockTipDetails),
          });

          const { unmount } = render(<TipSuccessPage />);

          await waitFor(() => {
            expect(screen.getByText('Thank you! 🙌')).toBeInTheDocument();
          });

          expect(screen.getByText('Your tip has been sent successfully.')).toBeInTheDocument();
          
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 9: Missing order_id should show error state', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          mockSearchParams.clear();
          // No order_id set

          const { unmount } = render(<TipSuccessPage />);

          await waitFor(() => {
            expect(screen.getByText('Oops!')).toBeInTheDocument();
          });

          expect(screen.getByText('Missing order information')).toBeInTheDocument();
          
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 9: API failure should show error state', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.integer({ min: 400, max: 599 }),
        async (orderId, statusCode) => {
          mockSearchParams.clear();
          mockSearchParams.set('order_id', orderId);
          
          mockFetch.mockResolvedValueOnce({
            ok: false,
            status: statusCode,
          });

          const { unmount } = render(<TipSuccessPage />);

          await waitFor(() => {
            expect(screen.getByText('Oops!')).toBeInTheDocument();
          });

          expect(screen.getByText('Could not load tip details')).toBeInTheDocument();
          
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 9: Network error should show error state', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        async (orderId) => {
          mockSearchParams.clear();
          mockSearchParams.set('order_id', orderId);
          
          mockFetch.mockRejectedValueOnce(new Error('Network error'));

          const { unmount } = render(<TipSuccessPage />);

          await waitFor(() => {
            expect(screen.getByText('Oops!')).toBeInTheDocument();
          });

          expect(screen.getByText('Failed to load tip details')).toBeInTheDocument();
          
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Unit tests for Success Page
 * 
 * **Feature: tip-payment-ui-redesign**
 * **Validates: Requirements 4.1, 4.2, 4.3**
 */
describe('Success Page Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    mockSearchParams.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Success State with Valid Parameters', () => {
    it('should display success message with valid order_id', async () => {
      mockSearchParams.set('order_id', 'test-order-123');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTipDetails),
      });

      render(<TipSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText('Thank you! 🙌')).toBeInTheDocument();
      });

      expect(screen.getByText('Your tip has been sent successfully.')).toBeInTheDocument();
    });

    it('should display tip amount correctly', async () => {
      mockSearchParams.set('order_id', 'test-order-123');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTipDetails),
      });

      render(<TipSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText('Rp 50,000')).toBeInTheDocument();
      });
    });

    it('should display staff name when available', async () => {
      mockSearchParams.set('order_id', 'test-order-123');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTipDetails),
      });

      render(<TipSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should display staff avatar when available', async () => {
      mockSearchParams.set('order_id', 'test-order-123');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTipDetails),
      });

      render(<TipSuccessPage />);

      await waitFor(() => {
        const avatar = screen.getByTestId('staff-avatar');
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute('data-src', 'https://example.com/john.jpg');
      });
    });

    it('should display venue name', async () => {
      mockSearchParams.set('order_id', 'test-order-123');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTipDetails),
      });

      render(<TipSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Cafe')).toBeInTheDocument();
      });
    });

    it('should display "The Team" when no staff name', async () => {
      mockSearchParams.set('order_id', 'test-order-123');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTipDetailsNoStaff),
      });

      render(<TipSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText('The Team')).toBeInTheDocument();
      });
    });

    it('should display close button', async () => {
      mockSearchParams.set('order_id', 'test-order-123');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTipDetails),
      });

      render(<TipSuccessPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();
      });
    });

    it('should display supportive message', async () => {
      mockSearchParams.set('order_id', 'test-order-123');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTipDetails),
      });

      render(<TipSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText('Your support helps us reward our staff.')).toBeInTheDocument();
      });
    });
  });

  describe('Error State with Invalid Parameters', () => {
    it('should show error when order_id is missing', async () => {
      // No order_id set
      render(<TipSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText('Oops!')).toBeInTheDocument();
      });

      expect(screen.getByText('Missing order information')).toBeInTheDocument();
    });

    it('should show error when API returns 404', async () => {
      mockSearchParams.set('order_id', 'invalid-order');
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      render(<TipSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText('Oops!')).toBeInTheDocument();
      });

      expect(screen.getByText('Could not load tip details')).toBeInTheDocument();
    });

    it('should show error when API returns 500', async () => {
      mockSearchParams.set('order_id', 'test-order');
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<TipSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText('Oops!')).toBeInTheDocument();
      });

      expect(screen.getByText('Could not load tip details')).toBeInTheDocument();
    });

    it('should show Go Back button on error', async () => {
      // No order_id set
      render(<TipSuccessPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Go Back/i })).toBeInTheDocument();
      });
    });
  });

  describe('Error State with Missing Parameters', () => {
    it('should show error immediately when no order_id', async () => {
      render(<TipSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText('Oops!')).toBeInTheDocument();
      });

      // Should not have called fetch
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner while fetching', async () => {
      mockSearchParams.set('order_id', 'test-order-123');
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<TipSuccessPage />);

      // Should show loading spinner
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Language Switcher', () => {
    it('should render language switcher', async () => {
      mockSearchParams.set('order_id', 'test-order-123');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTipDetails),
      });

      render(<TipSuccessPage />);

      await waitFor(() => {
        expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
      });
    });
  });

  describe('Footer', () => {
    it('should display tips yo footer text', async () => {
      mockSearchParams.set('order_id', 'test-order-123');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTipDetails),
      });

      render(<TipSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText("© 2026 TIPSIO.")).toBeInTheDocument();
      });
    });
  });

  describe('Light Theme Styling', () => {
    it('should have light gray background', async () => {
      mockSearchParams.set('order_id', 'test-order-123');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTipDetails),
      });

      const { container } = render(<TipSuccessPage />);

      await waitFor(() => {
        expect(screen.getByText('Thank you! 🙌')).toBeInTheDocument();
      });

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('bg-gray-50');
    });

    it('should have green branded header', async () => {
      mockSearchParams.set('order_id', 'test-order-123');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTipDetails),
      });

      render(<TipSuccessPage />);

      await waitFor(() => {
        const logo = screen.getByText("tipsio");
        expect(logo).toHaveClass('text-green-700');
      });
    });
  });
});
