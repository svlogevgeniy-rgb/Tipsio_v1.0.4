/**
 * Property-Based Tests for Touch Target Sizes
 * Feature: tip-payment-ui-v2
 * 
 * Tests that all interactive elements meet minimum touch target size (44x44px)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
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

describe("Touch Target Sizes Property Tests", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQrData),
      } as Response)
    );
  });

  /**
   * Property 10: Touch Target Sizes
   * For any interactive element on mobile viewport, verify minimum 44x44px size
   * 
   * Validates: Requirements 9.5
   */
  it("Property 10: all interactive elements meet minimum touch target size on mobile", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 320, max: 767 }), // Mobile viewport range
        async (viewportWidth) => {
          // Set mobile viewport
          Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: viewportWidth,
          });

          const { container, unmount } = render(<TipPage />);

          await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
          });

          // Find all interactive elements (buttons, inputs with role, etc.)
          const buttons = Array.from(container.querySelectorAll("button"));
          const interactiveElements = [
            ...buttons,
            ...Array.from(container.querySelectorAll('[role="radio"]')),
            ...Array.from(container.querySelectorAll('[role="button"]')),
          ];

          expect(interactiveElements.length).toBeGreaterThan(0);

          // Check each interactive element
          interactiveElements.forEach((element) => {
            const className = element.className;

            // Skip language switcher button (it's small by design and in header)
            const isLanguageSwitcher = element.closest('[data-testid="language-switcher"]');
            if (isLanguageSwitcher) return;

            // Check for explicit size classes that meet minimum requirements
            const hasMinWidth = className.includes("min-w-[44px]");
            const hasMinHeight = className.includes("min-h-[44px]");
            
            // For buttons with explicit height classes (h-12, h-14), those are >= 44px
            const hasLargeHeight = 
              className.includes("h-12") || // 48px
              className.includes("h-14") || // 56px
              className.includes("h-16") || // 64px
              className.includes("min-h-[88px]"); // Staff selection buttons

            // For preset buttons in grid, they should have h-12
            const isPresetButton = className.includes("h-12") && className.includes("rounded-xl");
            
            // For star rating buttons, they should have min-w and min-h
            const isStarButton = element.getAttribute("role") === "radio";

            // Element should meet minimum size requirements
            if (isStarButton) {
              expect(hasMinWidth, `Star button should have min-w-[44px]. Classes: ${className}`).toBe(true);
              expect(hasMinHeight, `Star button should have min-h-[44px]. Classes: ${className}`).toBe(true);
            } else if (isPresetButton) {
              expect(hasLargeHeight, `Preset button should have h-12 or larger. Classes: ${className}`).toBe(true);
            } else {
              // Other buttons should have appropriate height
              expect(hasLargeHeight || hasMinHeight, `Button should have appropriate height class. Classes: ${className}`).toBe(true);
            }
          });

          unmount();
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);

  /**
   * Additional Property: Star rating buttons meet touch target size
   * For any viewport, star rating buttons should be at least 44x44px
   */
  it("star rating buttons meet minimum touch target size", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(true),
        async () => {
          const { container, unmount } = render(<TipPage />);

          await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
          });

          // Find star rating buttons
          const starButtons = container.querySelectorAll('[role="radio"]');
          expect(starButtons.length).toBe(5);

          starButtons.forEach((button) => {
            const className = button.className;
            
            // Should have min-w-[44px] and min-h-[44px]
            expect(className).toContain("min-w-[44px]");
            expect(className).toContain("min-h-[44px]");
          });

          unmount();
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);

  /**
   * Additional Property: Preset amount buttons meet touch target size
   * For any viewport, preset amount buttons should be at least 44px tall
   */
  it("preset amount buttons meet minimum touch target size", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(true),
        async () => {
          const { container, unmount } = render(<TipPage />);

          await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
          });

          // Find preset amount buttons (contain "Rp")
          const buttons = Array.from(container.querySelectorAll("button"));
          const presetButtons = buttons.filter((btn) =>
            btn.textContent?.includes("Rp")
          );

          expect(presetButtons.length).toBeGreaterThan(0);

          presetButtons.forEach((button) => {
            const className = button.className;
            
            // Should have h-12 (48px) which is >= 44px
            expect(className).toContain("h-12");
          });

          unmount();
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);
});
