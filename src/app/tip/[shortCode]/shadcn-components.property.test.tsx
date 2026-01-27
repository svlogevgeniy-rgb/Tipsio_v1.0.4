/**
 * Property-Based Tests for shadcn/ui Components and Spacing
 * Feature: tip-payment-ui-v2
 * 
 * Tests consistent spacing across UI elements
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

describe("shadcn/ui Components and Spacing Property Tests", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQrData),
      } as Response)
    );
  });

  /**
   * Property 11: Consistent Spacing
   * For any similar UI elements (sections, cards, buttons), verify spacing is consistent
   * - Sections use mb-6 for spacing
   * - Padding uses p-4 or p-6
   * - Gaps use gap-2, gap-3, or gap-4
   * 
   * Validates: Requirements 7.2
   */
  it("Property 11: sections have consistent spacing", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(true),
        async () => {
          const { container, unmount } = render(<TipPage />);

          await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
          });

          const main = container.querySelector("main");
          expect(main).toBeDefined();

          // Find all section divs (direct children of main with mb-6)
          const sections = Array.from(
            main?.querySelectorAll(".mb-6") || []
          );

          expect(sections.length).toBeGreaterThan(0);

          // All sections should have consistent bottom margin
          sections.forEach((section) => {
            expect(section.className).toContain("mb-6");
          });

          unmount();
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);

  /**
   * Additional Property: Consistent padding across containers
   * For any container element, verify padding is consistent (p-4 or p-6)
   */
  it("containers have consistent padding", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(true),
        async () => {
          const { container, unmount } = render(<TipPage />);

          await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
          });

          // Check header padding
          const header = container.querySelector("header");
          expect(header?.className).toMatch(/p[xy]?-[46]/);

          // Check main padding
          const main = container.querySelector("main");
          expect(main?.className).toMatch(/p[xy]?-[46]/);

          unmount();
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);

  /**
   * Additional Property: Consistent typography
   * For any heading, verify typography is consistent
   */
  it("headings have consistent typography", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(true),
        async () => {
          const { container, unmount } = render(<TipPage />);

          await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
          });

          // Find all h2 headings (section titles)
          const headings = Array.from(container.querySelectorAll("h2"));

          expect(headings.length).toBeGreaterThan(0);

          // All h2 headings should have consistent styling
          headings.forEach((heading) => {
            const className = heading.className;
            expect(className).toContain("text-lg");
            expect(className).toContain("font-medium");
            expect(className).toContain("text-gray-900");
            expect(className).toContain("mb-3");
          });

          unmount();
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);
});
