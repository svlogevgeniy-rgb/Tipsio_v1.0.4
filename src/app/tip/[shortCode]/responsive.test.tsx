/**
 * Unit Tests for Responsive Container Width
 * Feature: tip-payment-ui-v2
 * 
 * Tests specific viewport sizes and container behavior
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
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

describe("Responsive Container Width Unit Tests", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQrData),
      } as Response)
    );
  });

  describe("Container is 672px on desktop (>= 768px)", () => {
    it("container has correct classes at 768px viewport", async () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { container } = render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const mainContainer = container.querySelector(
        'div[class*="min-h-screen"]'
      )?.firstChild as HTMLElement;

      expect(mainContainer).toBeTruthy();
      expect(mainContainer.className).toContain("md:min-w-[672px]");
      expect(mainContainer.className).toContain("md:w-[672px]");
    });

    it("container has correct classes at 1024px viewport", async () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { container } = render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const mainContainer = container.querySelector(
        'div[class*="min-h-screen"]'
      )?.firstChild as HTMLElement;

      expect(mainContainer).toBeTruthy();
      expect(mainContainer.className).toContain("md:min-w-[672px]");
      expect(mainContainer.className).toContain("md:w-[672px]");
    });

    it("container has correct classes at 1440px viewport", async () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1440,
      });

      const { container } = render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const mainContainer = container.querySelector(
        'div[class*="min-h-screen"]'
      )?.firstChild as HTMLElement;

      expect(mainContainer).toBeTruthy();
      expect(mainContainer.className).toContain("md:min-w-[672px]");
      expect(mainContainer.className).toContain("md:w-[672px]");
    });
  });

  describe("Container is full-width on mobile (< 768px)", () => {
    it("container has w-full at 375px viewport", async () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const mainContainer = container.querySelector(
        'div[class*="min-h-screen"]'
      )?.firstChild as HTMLElement;

      expect(mainContainer).toBeTruthy();
      expect(mainContainer.className).toContain("w-full");
    });

    it("container has w-full at 640px viewport", async () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 640,
      });

      const { container } = render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const mainContainer = container.querySelector(
        'div[class*="min-h-screen"]'
      )?.firstChild as HTMLElement;

      expect(mainContainer).toBeTruthy();
      expect(mainContainer.className).toContain("w-full");
    });

    it("container has w-full at 767px viewport (just below breakpoint)", async () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 767,
      });

      const { container } = render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const mainContainer = container.querySelector(
        'div[class*="min-h-screen"]'
      )?.firstChild as HTMLElement;

      expect(mainContainer).toBeTruthy();
      expect(mainContainer.className).toContain("w-full");
    });
  });

  describe("Container is centered on desktop", () => {
    it("container has mx-auto class on desktop", async () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { container } = render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Find the main content container (the one with md:min-w-[672px])
      const mainContainer = container.querySelector(
        'div[class*="md:min-w-[672px]"]'
      ) as HTMLElement;

      expect(mainContainer).toBeTruthy();
      expect(mainContainer.className).toContain("md:mx-auto");
    });
  });

  describe("No horizontal scroll at any size", () => {
    it("no horizontal scroll at 375px", async () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });

    it("no horizontal scroll at 768px", async () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });

    it("no horizontal scroll at 1440px", async () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1440,
      });

      render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  });

  describe("Proper padding on mobile devices", () => {
    it("has px-4 padding on mobile", async () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const paddedElements = container.querySelectorAll('[class*="px-4"]');
      expect(paddedElements.length).toBeGreaterThan(0);
    });

    it("maintains padding on desktop", async () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { container } = render(<TipPage />);

      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Check that elements have padding classes
      const paddedElements = container.querySelectorAll('[class*="px-"]');
      expect(paddedElements.length).toBeGreaterThan(0);
    });
  });
});
