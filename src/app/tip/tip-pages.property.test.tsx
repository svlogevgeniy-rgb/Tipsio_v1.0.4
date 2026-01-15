import { render, screen, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: () => ({ shortCode: 'test-code' }),
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({
    get: (key: string) => key === 'order_id' ? 'test-order-123' : null,
  }),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock i18n
const mockT = vi.fn((key: string) => key);
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

// Sample QR data for tests
const mockQrDataWithStaff = {
  id: 'qr-1',
  type: 'TABLE',
  label: 'Table 1',
  venue: {
    id: 'venue-1',
    name: 'Test Cafe',
    logoUrl: null,
  },
  staff: null,
  recipients: [
    { id: 'staff-1', displayName: 'John Doe', avatarUrl: 'https://example.com/john.jpg', role: 'WAITER', status: 'ACTIVE' },
    { id: 'staff-2', displayName: 'Jane Smith', avatarUrl: null, role: 'BARTENDER', status: 'ACTIVE' },
  ],
};

const mockPersonalQrData = {
  id: 'qr-2',
  type: 'PERSONAL',
  label: null,
  venue: {
    id: 'venue-1',
    name: 'Test Cafe',
    logoUrl: 'https://example.com/logo.png',
  },
  staff: { id: 'staff-1', displayName: 'John Doe', avatarUrl: null, role: 'WAITER', status: 'ACTIVE' },
  recipients: [],
};

/**
 * Property-based tests for Accessibility Compliance
 * 
 * **Feature: tip-payment-ui-redesign**
 * **Property 13: Accessibility Compliance**
 * Semantic HTML, keyboard navigation, ARIA labels
 * 
 * **Validates: Requirements 7.3, 7.4, 7.5**
 */
describe('Accessibility Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Property 13: All interactive elements should be keyboard accessible', async () => {
    const { default: TipPage } = await import('./[shortCode]/page');
    
    await fc.assert(
      fc.asyncProperty(
        fc.constant(mockQrDataWithStaff),
        async (qrData) => {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(qrData),
          });

          const { container, unmount } = render(<TipPage />);

          await waitFor(() => {
            expect(screen.getByText('Who would you like to thank?')).toBeInTheDocument();
          });

          // All buttons should be focusable (have no negative tabindex)
          const buttons = container.querySelectorAll('button');
          buttons.forEach((button) => {
            const tabIndex = button.getAttribute('tabindex');
            expect(tabIndex === null || parseInt(tabIndex) >= 0).toBe(true);
          });

          // All inputs should be focusable
          const inputs = container.querySelectorAll('input');
          inputs.forEach((input) => {
            const tabIndex = input.getAttribute('tabindex');
            expect(tabIndex === null || parseInt(tabIndex) >= 0).toBe(true);
          });

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 13: Page should use semantic HTML structure', async () => {
    const { default: TipPage } = await import('./[shortCode]/page');
    
    await fc.assert(
      fc.asyncProperty(
        fc.constant(mockQrDataWithStaff),
        async (qrData) => {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(qrData),
          });

          const { container, unmount } = render(<TipPage />);

          await waitFor(() => {
            expect(screen.getByText('Who would you like to thank?')).toBeInTheDocument();
          });

          // Should have header element
          const header = container.querySelector('header');
          expect(header).toBeInTheDocument();

          // Should have main element
          const main = container.querySelector('main');
          expect(main).toBeInTheDocument();

          // Should have footer element
          const footer = container.querySelector('footer');
          expect(footer).toBeInTheDocument();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 13: Images should have alt text', async () => {
    const { default: TipPage } = await import('./[shortCode]/page');
    
    await fc.assert(
      fc.asyncProperty(
        fc.constant(mockQrDataWithStaff),
        async (qrData) => {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(qrData),
          });

          const { container, unmount } = render(<TipPage />);

          await waitFor(() => {
            expect(screen.getByText('Who would you like to thank?')).toBeInTheDocument();
          });

          // All images should have alt attribute
          const images = container.querySelectorAll('img');
          images.forEach((img) => {
            expect(img.hasAttribute('alt')).toBe(true);
          });

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property-based tests for No Console Errors
 * 
 * **Feature: tip-payment-ui-redesign**
 * **Property 10: No Console Errors**
 * No errors logged during page render
 * 
 * **Validates: Requirements 6.4**
 */
describe('Console Error Property Tests', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it('Property 10: Page render should not produce console errors', async () => {
    const { default: TipPage } = await import('./[shortCode]/page');
    
    await fc.assert(
      fc.asyncProperty(
        fc.constant(mockQrDataWithStaff),
        async (qrData) => {
          consoleErrorSpy.mockClear();
          
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(qrData),
          });

          const { unmount } = render(<TipPage />);

          await waitFor(() => {
            expect(screen.getByText('Who would you like to thank?')).toBeInTheDocument();
          });

          // Should not have any console errors during normal render
          // Note: React warnings are acceptable, but actual errors are not
          const errorCalls = consoleErrorSpy.mock.calls.filter(
            (call: unknown[]) => !String(call[0]).includes('Warning:')
          );
          expect(errorCalls.length).toBe(0);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property-based tests for CLS Prevention
 * 
 * **Feature: tip-payment-ui-redesign**
 * **Property 11: CLS Prevention**
 * Avatar containers have explicit dimensions
 * 
 * **Validates: Requirements 7.1**
 */
describe('CLS Prevention Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Property 11: Avatar containers should have explicit dimensions', async () => {
    const { default: TipPage } = await import('./[shortCode]/page');
    
    await fc.assert(
      fc.asyncProperty(
        fc.constant(mockQrDataWithStaff),
        async (qrData) => {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(qrData),
          });

          const { container, unmount } = render(<TipPage />);

          await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
          });

          // Avatar containers should have width and height classes
          const avatarContainers = container.querySelectorAll('[class*="w-"][class*="h-"]');
          expect(avatarContainers.length).toBeGreaterThan(0);

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property-based tests for Loading States
 * 
 * **Feature: tip-payment-ui-redesign**
 * **Property 12: Loading State Display**
 * Skeletons shown during async loading
 * 
 * **Validates: Requirements 7.2**
 */
describe('Loading State Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Property 12: Loading spinner should be shown during data fetch', async () => {
    const { default: TipPage } = await import('./[shortCode]/page');
    
    await fc.assert(
      fc.asyncProperty(
        fc.constant(true),
        async () => {
          // Create a promise that never resolves to keep loading state
          mockFetch.mockImplementationOnce(() => new Promise(() => {}));

          const { container, unmount } = render(<TipPage />);

          // Should show loading spinner immediately
          const spinner = container.querySelector('.animate-spin');
          expect(spinner).toBeInTheDocument();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 12: Loading state should disappear after data loads', async () => {
    const { default: TipPage } = await import('./[shortCode]/page');
    
    await fc.assert(
      fc.asyncProperty(
        fc.constant(mockQrDataWithStaff),
        async (qrData) => {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(qrData),
          });

          const { container, unmount } = render(<TipPage />);

          // Wait for content to load
          await waitFor(() => {
            expect(screen.getByText('Who would you like to thank?')).toBeInTheDocument();
          });

          // Loading spinner should be gone
          const spinner = container.querySelector('.animate-spin');
          expect(spinner).not.toBeInTheDocument();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property-based tests for Two-Step Flow
 * 
 * **Feature: tip-payment-ui-redesign**
 * **Property: Staff Selection Flow**
 * Staff selection leads to amount screen
 * 
 * **Validates: Requirements 3.1, 3.2**
 */
describe('Two-Step Flow Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Property: Personal QR should skip staff selection', async () => {
    const { default: TipPage } = await import('./[shortCode]/page');
    
    await fc.assert(
      fc.asyncProperty(
        fc.constant(mockPersonalQrData),
        async (qrData) => {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(qrData),
          });

          const { unmount } = render(<TipPage />);

          // Should go directly to amount screen
          await waitFor(() => {
            expect(screen.getByText('Tip Amount')).toBeInTheDocument();
          });

          // Should not show staff selection
          expect(screen.queryByText('Who would you like to thank?')).not.toBeInTheDocument();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Table QR should show staff selection first', async () => {
    const { default: TipPage } = await import('./[shortCode]/page');
    
    await fc.assert(
      fc.asyncProperty(
        fc.constant(mockQrDataWithStaff),
        async (qrData) => {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(qrData),
          });

          const { unmount } = render(<TipPage />);

          // Should show staff selection first
          await waitFor(() => {
            expect(screen.getByText('Who would you like to thank?')).toBeInTheDocument();
          });

          // Should not show amount screen yet
          expect(screen.queryByText('Tip Amount')).not.toBeInTheDocument();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property-based tests for Light Theme
 * 
 * **Feature: tip-payment-ui-redesign**
 * **Property: Light Theme Styling**
 * Light gray background, white cards, green accents
 * 
 * **Validates: Requirements 2.1, 2.2**
 */
describe('Light Theme Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Property: Page should have light gray background', async () => {
    const { default: TipPage } = await import('./[shortCode]/page');
    
    await fc.assert(
      fc.asyncProperty(
        fc.constant(mockQrDataWithStaff),
        async (qrData) => {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(qrData),
          });

          const { container, unmount } = render(<TipPage />);

          await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
          });

          const mainDiv = container.firstChild as HTMLElement;
          expect(mainDiv).toHaveClass('bg-gray-50');

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property: Header should have green branding', async () => {
    const { default: TipPage } = await import('./[shortCode]/page');
    
    await fc.assert(
      fc.asyncProperty(
        fc.constant(mockQrDataWithStaff),
        async (qrData) => {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(qrData),
          });

          const { unmount } = render(<TipPage />);

          await waitFor(() => {
            const logo = screen.getByText("tipsio");
            expect(logo).toHaveClass('text-green-700');
          });

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
