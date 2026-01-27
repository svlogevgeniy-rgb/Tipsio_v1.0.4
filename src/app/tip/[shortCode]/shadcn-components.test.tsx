/**
 * Unit Tests for shadcn/ui Components Usage
 * Feature: tip-payment-ui-v2
 * 
 * Tests that shadcn/ui components are properly used
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
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

describe("shadcn/ui Components Usage Tests", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQrData),
      } as Response)
    );
  });

  it("Input component is used for tip amount", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Find input with shadcn/ui classes
    const inputs = container.querySelectorAll("input");
    const tipInput = Array.from(inputs).find(
      (input) => input.getAttribute("placeholder") === "Amount"
    );

    expect(tipInput).toBeDefined();
    // shadcn/ui Input has specific classes
    expect(tipInput?.className).toContain("flex");
    expect(tipInput?.className).toContain("rounded-md");
    expect(tipInput?.className).toContain("border");
  });

  it("Button component is used for submit", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Find submit button
    const buttons = Array.from(container.querySelectorAll("button"));
    const submitButton = buttons.find((btn) =>
      btn.textContent?.includes("Send")
    );

    expect(submitButton).toBeDefined();
    // shadcn/ui Button has specific classes
    expect(submitButton?.className).toMatch(/inline-flex|flex/);
  });

  it("consistent spacing values are used", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Check for consistent spacing classes
    const elementsWithSpacing = container.querySelectorAll(
      '[class*="gap-"], [class*="p-"], [class*="m-"]'
    );

    expect(elementsWithSpacing.length).toBeGreaterThan(0);

    // Common spacing values should be 2, 3, 4, 6
    const spacingPattern = /(?:gap|p|m)[xytblr]?-[2346]/;
    let hasConsistentSpacing = false;

    elementsWithSpacing.forEach((el) => {
      if (spacingPattern.test(el.className)) {
        hasConsistentSpacing = true;
      }
    });

    expect(hasConsistentSpacing).toBe(true);
  });

  it("consistent typography is used", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Check h2 headings have consistent typography
    const headings = Array.from(container.querySelectorAll("h2"));

    expect(headings.length).toBeGreaterThan(0);

    headings.forEach((heading) => {
      expect(heading.className).toContain("text-lg");
      expect(heading.className).toContain("font-medium");
    });
  });

  it("no unnecessary decorative elements", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Check that there are no excessive decorative divs
    // Main content should be clean and minimal
    const main = container.querySelector("main");
    expect(main).toBeDefined();

    // Should have sections for Tip Amount and Experience
    const sections = main?.querySelectorAll(".mb-6");
    expect(sections?.length).toBeGreaterThanOrEqual(2);
    expect(sections?.length).toBeLessThanOrEqual(4); // Not too many sections
  });

  it("proper visual hierarchy is maintained", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Check header hierarchy
    const header = container.querySelector("header");
    expect(header).toBeDefined();

    // Logo should be prominent with text-gradient class
    const logo = header?.querySelector(".text-gradient");
    expect(logo).toBeDefined();
    if (logo) {
      expect(logo.className).toContain("font-bold");
      expect(logo.className).toContain("text-xl");
    }

    // Check main content hierarchy
    const main = container.querySelector("main");
    const h2Headings = main?.querySelectorAll("h2");

    // Section headings should be consistent
    h2Headings?.forEach((heading) => {
      expect(heading.className).toContain("text-lg");
      expect(heading.className).toContain("font-medium");
    });
  });

  it("rounded corners are consistent", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Check for consistent border radius
    const roundedElements = container.querySelectorAll('[class*="rounded"]');

    expect(roundedElements.length).toBeGreaterThan(0);

    // Common values should be rounded-md, rounded-lg, rounded-xl, rounded-full
    const roundedPattern = /rounded-(md|lg|xl|2xl|full)/;
    let hasConsistentRounding = false;

    roundedElements.forEach((el) => {
      if (roundedPattern.test(el.className)) {
        hasConsistentRounding = true;
      }
    });

    expect(hasConsistentRounding).toBe(true);
  });

  it("color palette is consistent", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Check for consistent color usage
    // Should use: brand, gray-*, white
    const coloredElements = container.querySelectorAll(
      '[class*="text-"], [class*="bg-"], [class*="border-"]'
    );

    expect(coloredElements.length).toBeGreaterThan(0);

    // Should primarily use brand and gray colors
    const colorPattern = /(brand|gray-|white)/;
    let hasConsistentColors = false;

    coloredElements.forEach((el) => {
      if (colorPattern.test(el.className)) {
        hasConsistentColors = true;
      }
    });

    expect(hasConsistentColors).toBe(true);
  });
});
