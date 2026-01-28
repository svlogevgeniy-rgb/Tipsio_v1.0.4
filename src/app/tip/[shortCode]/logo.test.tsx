/**
 * Unit Tests for Logo Styling and Positioning
 * Feature: tip-payment-ui-v2
 * 
 * Tests specific logo styling requirements
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import TipPage from "./page";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useParams: () => ({ shortCode: "test-code" }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

vi.mock("@/i18n/client", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/components/ui/language-switcher", () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">EN</div>,
}));

const mockQrData = {
  id: "qr-1",
  type: "INDIVIDUAL",
  label: null,
  venue: {
    id: "venue-1",
    name: "Test Cafe",
    logoUrl: null,
  },
  staff: {
    id: "staff-1",
    displayName: "John Doe",
    avatarUrl: null,
    role: "WAITER",
    status: "ACTIVE",
  },
  recipients: [],
};

describe("Logo Styling Unit Tests", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQrData),
      } as Response)
    );
  });

  describe("Logo color is #1e5f4b", () => {
    it("logo has text-gradient class (green color)", async () => {
      render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Wait for logo to appear
      await vi.waitFor(() => {
        const logos = screen.getAllByText("TIPSIO");
        expect(logos.length).toBeGreaterThan(0);
      });

      const logos = screen.getAllByText("TIPSIO");
      // Check at least one logo has the text-gradient class
      const hasGradientClass = logos.some((logo) =>
        logo.className.includes("text-gradient")
      );
      expect(hasGradientClass).toBe(true);
    });

    it("logo does not have old green color class", async () => {
      render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      await vi.waitFor(() => {
        const logos = screen.getAllByText("TIPSIO");
        expect(logos.length).toBeGreaterThan(0);
      });

      const logos = screen.getAllByText("TIPSIO");
      // None of the logos should have the old green class
      const hasGreenClass = logos.some((logo) =>
        logo.className.includes("text-green-700")
      );
      expect(hasGreenClass).toBe(false);
    });
  });

  describe("Logo is left-aligned with icon", () => {
    it("logo is in a flex container with justify-between", async () => {
      render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      await vi.waitFor(() => {
        const logos = screen.getAllByText("TIPSIO");
        expect(logos.length).toBeGreaterThan(0);
      });

      const logos = screen.getAllByText("TIPSIO");
      const logo = logos[0]; // Check first logo
      const header = logo.closest("header");

      expect(header).toBeTruthy();
      expect(header?.className).toContain("flex");
      expect(header?.className).toContain("justify-between");
    });

    it("logo has icon image (Logo_1.svg)", async () => {
      render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      await vi.waitFor(() => {
        const logoImages = screen.getAllByAltText("TIPSIO Logo");
        expect(logoImages.length).toBeGreaterThan(0);
      });

      const logoImages = screen.getAllByAltText("TIPSIO Logo");
      const logoImage = logoImages[0];
      
      expect(logoImage).toHaveAttribute("src", "/images/Logo_1.svg");
    });

    it("logo icon and text are in flex container with gap", async () => {
      render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      await vi.waitFor(() => {
        const logos = screen.getAllByText("TIPSIO");
        expect(logos.length).toBeGreaterThan(0);
      });

      const logos = screen.getAllByText("TIPSIO");
      const logo = logos[0];
      const logoContainer = logo.parentElement;

      expect(logoContainer?.className).toContain("flex");
      expect(logoContainer?.className).toContain("gap-2");
    });
  });

  describe("Proper spacing around logo", () => {
    it("header has vertical padding", async () => {
      render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      await vi.waitFor(() => {
        const logos = screen.getAllByText("TIPSIO");
        expect(logos.length).toBeGreaterThan(0);
      });

      const logos = screen.getAllByText("TIPSIO");
      const logo = logos[0];
      const header = logo.closest("header");

      expect(header).toBeTruthy();
      // Should have py-6 for proper spacing
      expect(header?.className).toContain("py-6");
    });

    it("header has horizontal padding", async () => {
      render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      await vi.waitFor(() => {
        const logos = screen.getAllByText("TIPSIO");
        expect(logos.length).toBeGreaterThan(0);
      });

      const logos = screen.getAllByText("TIPSIO");
      const logo = logos[0];
      const header = logo.closest("header");

      expect(header).toBeTruthy();
      // Should have px-4 base and md:px-6 responsive
      expect(header?.className).toContain("px-4");
      expect(header?.className).toContain("md:px-6");
    });
  });

  describe("Back arrow removed", () => {
    it("no back arrow button present in header", async () => {
      render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      await vi.waitFor(() => {
        const logos = screen.getAllByText("TIPSIO");
        expect(logos.length).toBeGreaterThan(0);
      });

      const logos = screen.getAllByText("TIPSIO");
      const logo = logos[0];
      const header = logo.closest("header");

      // Header should not contain any button elements (except language switcher container)
      const buttonsInHeader = header?.querySelectorAll("button");
      
      // Should be 0 buttons in header (language switcher is in a div)
      expect(buttonsInHeader?.length || 0).toBe(0);
    });

    it("header does not have gap-4 class (used with back arrow)", async () => {
      render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      await vi.waitFor(() => {
        const logos = screen.getAllByText("TIPSIO");
        expect(logos.length).toBeGreaterThan(0);
      });

      const logos = screen.getAllByText("TIPSIO");
      const logo = logos[0];
      const header = logo.closest("header");

      // Old layout had gap-4, new centered layout doesn't need it
      expect(header?.className).not.toContain("gap-4");
    });
  });

  describe("Language switcher positioning", () => {
    it("language switcher is absolutely positioned", async () => {
      render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      await vi.waitFor(() => {
        const languageSwitcher = screen.getByTestId("language-switcher");
        expect(languageSwitcher).toBeInTheDocument();
      });

      const languageSwitcher = screen.getByTestId("language-switcher");
      const switcherContainer = languageSwitcher.parentElement;

      expect(switcherContainer).toBeTruthy();
      expect(switcherContainer?.className).toContain("absolute");
      expect(switcherContainer?.className).toContain("right-");
    });

    it("language switcher does not use ml-auto (old positioning)", async () => {
      render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      await vi.waitFor(() => {
        const languageSwitcher = screen.getByTestId("language-switcher");
        expect(languageSwitcher).toBeInTheDocument();
      });

      const languageSwitcher = screen.getByTestId("language-switcher");
      const switcherContainer = languageSwitcher.parentElement;

      expect(switcherContainer?.className).not.toContain("ml-auto");
    });
  });
});
