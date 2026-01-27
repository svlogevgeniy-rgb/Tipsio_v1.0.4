/**
 * Property-Based Tests for Responsive Container Width
 * Feature: tip-payment-ui-v2
 * 
 * Tests responsive container behavior across different viewport sizes
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import * as fc from "fast-check";
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

describe("Responsive Container Width Property Tests", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQrData),
      } as Response)
    );
  });

  /**
   * Property 1: Responsive Container Width
   * For any viewport width, the payment container should be full-width on screens < 768px
   * and exactly 672px centered on screens >= 768px, without causing horizontal scroll.
   * 
   * Validates: Requirements 1.1, 1.2, 1.3, 1.4
   */
  it("Property 1: container width adapts correctly for any viewport size", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 320, max: 1920 }),
        async (viewportWidth) => {
          // Set viewport width
          Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: viewportWidth,
          });

          const { container, unmount } = render(<TipPage />);

          // Wait for data to load
          await vi.waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
          });

          // Find the main container
          const mainContainer = container.querySelector(
            'div[class*="min-h-screen"]'
          )?.firstChild as HTMLElement;

          if (mainContainer) {
            const classes = mainContainer.className;

            // All viewports should have w-full as base
            expect(classes).toContain("w-full");
            
            // Desktop-specific classes should be present (they're responsive, only apply >= 768px)
            expect(classes).toContain("md:min-w-[672px]");
            expect(classes).toContain("md:w-[672px]");
            expect(classes).toContain("md:mx-auto");
          }

          // Verify no horizontal scroll
          expect(document.body.scrollWidth).toBeLessThanOrEqual(
            viewportWidth + 1
          ); // +1 for rounding

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional Property: Container maintains proper padding
   * For any viewport size, the container should have appropriate padding
   */
  it("container has proper padding on all viewport sizes", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 320, max: 1920 }),
        async (viewportWidth) => {
          Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: viewportWidth,
          });

          const { container, unmount } = render(<TipPage />);

          await vi.waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
          });

          // Find elements with padding
          const paddedElements = container.querySelectorAll(
            '[class*="px-4"], [class*="px-6"]'
          );

          // Should have at least some padded elements
          expect(paddedElements.length).toBeGreaterThan(0);

          // Check that padding classes are appropriate
          paddedElements.forEach((element) => {
            const classes = element.className;
            
            // Should have base padding
            expect(
              classes.includes("px-4") || classes.includes("px-6")
            ).toBe(true);

            // Desktop should have md:px-6 where applicable
            if (viewportWidth >= 768 && classes.includes("md:px-6")) {
              expect(classes).toContain("px-4");
            }
          });

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional Property: No horizontal scroll at any viewport
   * For any viewport width, the page should not cause horizontal scrolling
   */
  it("no horizontal scroll at any viewport width", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 320, max: 1920 }),
        async (viewportWidth) => {
          Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: viewportWidth,
          });

          const { unmount } = render(<TipPage />);

          await vi.waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
          });

          // Check that document width doesn't exceed viewport
          const scrollWidth = document.documentElement.scrollWidth;
          const clientWidth = document.documentElement.clientWidth;

          expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for rounding

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
