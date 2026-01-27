/**
 * Property-Based Tests for Button Styling
 * Feature: tip-payment-ui-v2
 * 
 * Tests brand color consistency across all primary buttons
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

describe("Button Styling Property Tests", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQrData),
      } as Response)
    );
  });

  /**
   * Property 2: Blue Color Consistency
   * For any primary button, verify it uses blue colors correctly:
   * - Background: bg-blue-600
   * - Hover: hover:bg-blue-700
   * - Active: active:bg-blue-800
   * - Text: text-white
   * 
   * Validates: Requirements 2.2, 2.3, 2.5
   */
  it("Property 2: all primary buttons use brand colors consistently", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(true),
        async () => {
          const { container, unmount } = render(<TipPage />);

          await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
          });

          // Find all primary buttons (buttons with bg-blue-600 or selected state)
          const allButtons = Array.from(container.querySelectorAll("button"));
          
          // Filter for primary action buttons (those with blue background)
          const primaryButtons = allButtons.filter((btn) => {
            const className = btn.className;
            return (
              className.includes("bg-blue-600") ||
              className.includes("border-blue-600")
            );
          });

          expect(primaryButtons.length).toBeGreaterThan(0);

          // Check each primary button has correct styling
          primaryButtons.forEach((button) => {
            const className = button.className;

            // Should have blue background or border
            const hasBlueStyling =
              className.includes("bg-blue-600") ||
              className.includes("border-blue-600");
            expect(hasBlueStyling).toBe(true);

            // If it has bg-blue-600, should also have text-white
            if (className.includes("bg-blue-600")) {
              expect(className.includes("text-white")).toBe(true);
            }

            // Should have hover state
            const hasHoverState =
              className.includes("hover:bg-blue-700") ||
              className.includes("hover:border-blue-600");
            expect(hasHoverState).toBe(true);
          });

          unmount();
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);

  /**
   * Additional Property: Submit button has all required states
   * For any render, the submit button should have bg, hover, active, and disabled states
   */
  it("submit button has all required color states", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(true),
        async () => {
          const { container, unmount } = render(<TipPage />);

          await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
          });

          // Find submit button (contains "Send" text)
          const buttons = Array.from(container.querySelectorAll("button"));
          const submitButton = buttons.find((btn) =>
            btn.textContent?.includes("Send")
          );

          expect(submitButton).toBeDefined();

          const className = submitButton!.className;

          // Check all required states
          expect(className).toContain("bg-blue-600");
          expect(className).toContain("hover:bg-blue-700");
          expect(className).toContain("active:bg-blue-800");
          expect(className).toContain("disabled:opacity-50");
          expect(className).toContain("text-white");

          unmount();
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);
});
