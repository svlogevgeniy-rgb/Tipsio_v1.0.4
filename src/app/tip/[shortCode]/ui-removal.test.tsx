/**
 * Unit Tests for UI Element Removal
 * Feature: tip-payment-ui-v2
 * 
 * Tests that back arrow and message field have been removed
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

describe("UI Element Removal Tests", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQrData),
      } as Response)
    );
  });

  it("no back arrow is present", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Check that there's no ArrowLeft icon (back arrow)
    const svgs = container.querySelectorAll("svg");
    const backArrow = Array.from(svgs).find((svg) =>
      svg.classList.contains("lucide-arrow-left")
    );

    expect(backArrow).toBeUndefined();

    // Check that there's no button with back/return functionality in header
    const header = container.querySelector("header");
    expect(header).toBeDefined();

    const headerButtons = header?.querySelectorAll("button");
    // Should only have language switcher, no back button
    expect(headerButtons?.length || 0).toBeLessThanOrEqual(1);
  });

  it("no message field is present", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Check that there's no textarea
    const textareas = container.querySelectorAll("textarea");
    expect(textareas.length).toBe(0);

    // Check that there's no "Message" heading
    const headings = Array.from(container.querySelectorAll("h2"));
    const messageHeading = headings.find((h) => h.textContent === "Message");
    expect(messageHeading).toBeUndefined();
  });

  it("header layout is correct after back arrow removal", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const header = container.querySelector("header");
    expect(header).toBeDefined();

    // Header should have left-aligned logo with justify-between
    expect(header?.className).toContain("justify-between");

    // Logo should be present with text-gradient class
    const logo = header?.querySelector(".text-gradient");
    expect(logo).toBeDefined();
    expect(logo?.textContent).toBe("TIPSIO");

    // Language switcher should be absolutely positioned on the right
    const languageSwitcher = header?.querySelector('[data-testid="language-switcher"]');
    expect(languageSwitcher).toBeDefined();
    
    const switcherParent = languageSwitcher?.parentElement;
    expect(switcherParent?.className).toContain("absolute");
    expect(switcherParent?.className).toContain("right-");
  });

  it("form layout is correct after message field removal", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const main = container.querySelector("main");
    expect(main).toBeDefined();

    // Should have Tip Amount section
    const tipAmountHeading = Array.from(
      main?.querySelectorAll("h2") || []
    ).find((h) => h.textContent === "Tip Amount");
    expect(tipAmountHeading).toBeDefined();

    // Should have Your Experience section
    const experienceHeading = Array.from(
      main?.querySelectorAll("h2") || []
    ).find((h) => h.textContent === "Your Experience");
    expect(experienceHeading).toBeDefined();

    // Should NOT have Message section
    const messageHeading = Array.from(
      main?.querySelectorAll("h2") || []
    ).find((h) => h.textContent === "Message");
    expect(messageHeading).toBeUndefined();

    // Check proper spacing (mb-6 on sections)
    const sections = main?.querySelectorAll(".mb-6");
    expect(sections?.length).toBeGreaterThan(0);
  });

  it("proper spacing and alignment maintained", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Check header spacing
    const header = container.querySelector("header");
    expect(header?.className).toContain("py-6");
    expect(header?.className).toContain("px-4");

    // Check main content spacing
    const main = container.querySelector("main");
    expect(main?.className).toContain("px-4");
    expect(main?.className).toContain("py-6");

    // Check that sections have consistent spacing
    const sections = main?.querySelectorAll(".mb-6");
    expect(sections?.length).toBeGreaterThanOrEqual(2); // At least Tip Amount and Experience
  });
});
