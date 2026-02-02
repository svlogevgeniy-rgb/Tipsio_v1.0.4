/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Property-Based Tests for Logo Centering
 * Feature: tip-payment-ui-v2
 * 
 * Tests logo centering across different viewport sizes
 */

import * as fc from "fast-check";
import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
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

describe("Logo Centering Property Tests", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQrData),
      } as Response)
    );
  });

  /**
   * Property 4: Logo Centering Across Viewports
   * For any viewport width, the Tipsio logo should be horizontally centered
   * at the top of the page.
   * 
   * Validates: Requirements 4.1, 4.2
   */
  it("Property 4: logo is centered for any viewport width", async () => {
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

          // Wait for component to render and fetch to complete
          await vi.waitFor(
            () => {
              const headers = container.querySelectorAll("header");
              const hasHeader = headers.length > 0;
              const hasFetched = (global.fetch as any).mock.calls.length > 0;
              expect(hasHeader && hasFetched).toBe(true);
            },
            { timeout: 2000 }
          );

          // Find headers with justify-center (our new centered layout)
          const headers = container.querySelectorAll("header");
          let foundCenteredHeader = false;

          headers.forEach((header) => {
            const hasJustifyCenter = header.className.includes("justify-center");
            const hasLogo = header.textContent?.toLowerCase().includes("tipsio");
            
            if (hasJustifyCenter && hasLogo) {
              foundCenteredHeader = true;
              expect(header.className).toContain("flex");
              expect(header.className).toContain("justify-center");
            }
          });

          // Should find at least one centered header with logo
          expect(foundCenteredHeader).toBe(true);

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  }, 30000); // Increased test timeout to 30s

  /**
   * Additional Property: Logo maintains centering with language switcher
   * For any viewport, logo should remain centered even with language switcher present
   */
  it("logo remains centered with language switcher present", async () => {
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

          // Wait for component to render
          await vi.waitFor(
            () => {
              const headers = container.querySelectorAll("header");
              const hasHeader = headers.length > 0;
              const hasFetched = (global.fetch as any).mock.calls.length > 0;
              expect(hasHeader && hasFetched).toBe(true);
            },
            { timeout: 2000 }
          );

          // Find language switcher
          const languageSwitchers = screen.queryAllByTestId("language-switcher");
          
          if (languageSwitchers.length > 0) {
            // Check first language switcher
            const languageSwitcher = languageSwitchers[0];
            const switcherParent = languageSwitcher.parentElement;
            if (switcherParent) {
              expect(switcherParent.className).toContain("absolute");
              expect(switcherParent.className).toContain("right-");
            }
          }

          // Find headers with centered logo
          const headers = container.querySelectorAll("header");
          let foundCenteredHeader = false;

          headers.forEach((header) => {
            const hasJustifyCenter = header.className.includes("justify-center");
            const hasLogo = header.textContent?.toLowerCase().includes("tipsio");
            
            if (hasJustifyCenter && hasLogo) {
              foundCenteredHeader = true;
            }
          });

          expect(foundCenteredHeader).toBe(true);

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  }, 30000); // Increased test timeout to 30s
});
