/**
 * Property-Based Tests for Numeric Tip Amount Input
 * Feature: tip-payment-ui-v2
 * 
 * Tests numeric input validation and behavior
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

describe("Numeric Input Property Tests", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQrData),
      } as Response)
    );
  });

  /**
   * Property 3: Numeric Input Validation
   * For any numeric value entered, the input should:
   * - Accept positive numbers
   * - Reject negative numbers
   * - Have inputMode="numeric"
   * - Have min="0" attribute
   * 
   * Validates: Requirements 3.1, 3.3
   */
  it("Property 3: numeric input accepts positive values and rejects negative", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: -1000, max: 10000 }),
        async (value) => {
          const { container, unmount } = render(<TipPage />);

          // Wait for component to render
          await vi.waitFor(
            () => {
              const inputs = container.querySelectorAll('input[type="number"]');
              expect(inputs.length).toBeGreaterThan(0);
            },
            { timeout: 2000 }
          );

          // Find tip amount input
          const inputs = container.querySelectorAll('input[type="number"]');
          const tipInput = Array.from(inputs).find(
            (input) => input.getAttribute("placeholder") === "Amount"
          ) as HTMLInputElement;

          expect(tipInput).toBeDefined();

          // Check input attributes
          expect(tipInput.getAttribute("inputMode")).toBe("numeric");
          expect(tipInput.getAttribute("min")).toBe("0");

          // Try to set value
          fireEvent.change(tipInput, { target: { value: value.toString() } });

          // If value is negative, input should reject it (value should be empty or 0)
          if (value < 0) {
            expect(tipInput.value === "" || tipInput.value === "0").toBe(true);
          } else {
            // Positive values should be accepted
            expect(parseInt(tipInput.value) || 0).toBe(value);
          }

          unmount();
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);

  /**
   * Additional Property: No Spinner Controls
   * For any render, the numeric input should not have visible +/- spinner controls
   */
  it("numeric input has no visible spinner controls", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(true),
        async () => {
          const { container, unmount } = render(<TipPage />);

          await vi.waitFor(
            () => {
              const inputs = container.querySelectorAll('input[type="number"]');
              expect(inputs.length).toBeGreaterThan(0);
            },
            { timeout: 2000 }
          );

          // Find tip amount input
          const inputs = container.querySelectorAll('input[type="number"]');
          const tipInput = Array.from(inputs).find(
            (input) => input.getAttribute("placeholder") === "Amount"
          ) as HTMLInputElement;

          expect(tipInput).toBeDefined();

          // Check that input has classes to hide spinners
          const className = tipInput.className;
          const hasSpinnerHiding =
            className.includes("appearance-textfield") ||
            className.includes("[appearance:textfield]") ||
            className.includes("webkit-outer-spin-button") ||
            className.includes("webkit-inner-spin-button");

          expect(hasSpinnerHiding).toBe(true);

          unmount();
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);
});
