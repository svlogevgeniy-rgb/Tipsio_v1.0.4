import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TipPage from './page';

vi.mock('next/navigation', () => ({
  useParams: () => ({ shortCode: 'test-code' }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const mockT = vi.fn((key: string) => key);
vi.mock('@/i18n/client', () => ({
  useTranslations: () => mockT,
}));

vi.mock('@/lib/i18n/formatters', () => ({
  formatCurrencyIDRIntl: (amount: number) => `Rp ${amount.toLocaleString()}`,
}));

vi.mock('@/components/ui/language-switcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">EN</div>,
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockQrDataWithStaff = {
  id: 'qr-1',
  type: 'TABLE',
  label: 'Table 1',
  venue: {
    id: 'venue-1',
    name: 'Test Cafe',
    logoUrl: null,
    distributionMode: 'POOLED',
    allowStaffChoice: true,
  },
  staff: null,
  availableStaff: [
    { id: 'staff-1', displayName: 'John Doe', avatarUrl: null, role: 'WAITER' },
    { id: 'staff-2', displayName: 'Jane Smith', avatarUrl: 'https://example.com/jane.jpg', role: 'BARTENDER' },
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
    distributionMode: 'INDIVIDUAL',
    allowStaffChoice: false,
  },
  staff: { id: 'staff-1', displayName: 'John Doe', avatarUrl: null, role: 'WAITER' },
  availableStaff: [],
};

describe('TipPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe.skip('Staff Selection Screen', () => {
    it('should render staff selection when multiple staff available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQrDataWithStaff),
      });

      render(<TipPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should display venue name', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQrDataWithStaff),
      });

      render(<TipPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Cafe')).toBeInTheDocument();
      });
    });

    it('should display "Who would you like to thank?" heading', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQrDataWithStaff),
      });

      render(<TipPage />);

      await waitFor(() => {
        expect(screen.getByText('Who would you like to thank?')).toBeInTheDocument();
      });
    });
  });

  describe.skip('Staff Selection Interaction', () => {
    it('should navigate to amount screen when staff is selected', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQrDataWithStaff),
      });

      render(<TipPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const johnButton = screen.getByText('John Doe').closest('button');
      fireEvent.click(johnButton!);

      await waitFor(() => {
        expect(screen.getByText('Tip Amount')).toBeInTheDocument();
      });
    });

    it('should skip staff selection for personal QR codes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPersonalQrData),
      });

      render(<TipPage />);

      await waitFor(() => {
        expect(screen.getByText('Tip Amount')).toBeInTheDocument();
      });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Amount Selection', () => {
    it('should render preset amount buttons', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPersonalQrData),
      });

      render(<TipPage />);

      await waitFor(() => {
        expect(screen.getByText('Rp 50')).toBeInTheDocument();
      });

      expect(screen.getByText('Rp 100')).toBeInTheDocument();
      expect(screen.getByText('Rp 150')).toBeInTheDocument();
    });

    it('should highlight selected amount button', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPersonalQrData),
      });

      render(<TipPage />);

      await waitFor(() => {
        expect(screen.getByText('Rp 100')).toBeInTheDocument();
      });

      const amountButton = screen.getByText('Rp 100');
      fireEvent.click(amountButton);

      await waitFor(() => {
        expect(amountButton).toHaveClass('bg-green-600');
      });
    });

    it('should allow custom amount input', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPersonalQrData),
      });

      render(<TipPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Amount')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Amount');
      fireEvent.change(input, { target: { value: '75000' } });

      expect(input).toHaveValue(75000);
    });
  });

  describe('Experience Rating', () => {
    it('should render experience rating emojis', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPersonalQrData),
      });

      render(<TipPage />);

      await waitFor(() => {
        expect(screen.getByText('Your Experience')).toBeInTheDocument();
      });

      expect(screen.getByText('🙂')).toBeInTheDocument();
      expect(screen.getByText('😊')).toBeInTheDocument();
      expect(screen.getByText('😀')).toBeInTheDocument();
      expect(screen.getByText('😍')).toBeInTheDocument();
    });

    it('should highlight selected experience rating', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPersonalQrData),
      });

      render(<TipPage />);

      await waitFor(() => {
        expect(screen.getByText('😊')).toBeInTheDocument();
      });

      const goodButton = screen.getByText('😊');
      fireEvent.click(goodButton);

      await waitFor(() => {
        expect(goodButton.closest('button')).toHaveClass('border-green-500');
      });
    });
  });

  describe('Message Input', () => {
    it('should render message textarea', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPersonalQrData),
      });

      render(<TipPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Add a message...')).toBeInTheDocument();
      });
    });

    it('should show character count', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPersonalQrData),
      });

      render(<TipPage />);

      await waitFor(() => {
        expect(screen.getByText('0/99')).toBeInTheDocument();
      });
    });

    it('should update character count on input', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPersonalQrData),
      });

      render(<TipPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Add a message...')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText('Add a message...');
      fireEvent.change(textarea, { target: { value: 'Thanks!' } });

      expect(screen.getByText('7/99')).toBeInTheDocument();
    });
  });

  describe('Submit Button State', () => {
    it('should be disabled when no amount selected', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPersonalQrData),
      });

      render(<TipPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /Send/i });
      expect(submitButton).toBeDisabled();
    });

    it('should be enabled when valid amount is selected', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPersonalQrData),
      });

      render(<TipPage />);

      await waitFor(() => {
        expect(screen.getByText('Rp 100')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Rp 100'));

      const submitButton = screen.getByRole('button', { name: /Send 100/i });
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading spinner initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));

      render(<TipPage />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should show error for 404 response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      render(<TipPage />);

      await waitFor(() => {
        expect(screen.getByText('Oops!')).toBeInTheDocument();
      });

      expect(screen.getByText('This QR code is not valid or has been deactivated.')).toBeInTheDocument();
    });

    it('should show error for network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<TipPage />);

      await waitFor(() => {
        expect(screen.getByText('Oops!')).toBeInTheDocument();
      });

      expect(screen.getByText('Failed to load. Please check your connection.')).toBeInTheDocument();
    });
  });

  describe.skip('Language Switcher', () => {
    it('should render language switcher', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQrDataWithStaff),
      });

      render(<TipPage />);

      await waitFor(() => {
        expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
      });
    });
  });

  describe.skip('Footer', () => {
    it('should display tips yo footer text', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQrDataWithStaff),
      });

      render(<TipPage />);

      await waitFor(() => {
        expect(screen.getByText("© 2026 TIPSIO.")).toBeInTheDocument();
      });
    });
  });

  describe.skip('Light Theme Styling', () => {
    it('should have light gray background', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQrDataWithStaff),
      });

      const { container } = render(<TipPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('bg-gray-50');
    });

    it('should have green branded header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQrDataWithStaff),
      });

      render(<TipPage />);

      await waitFor(() => {
        const logo = screen.getByText("tipsio");
        expect(logo).toHaveClass('text-green-700');
      });
    });
  });
});
