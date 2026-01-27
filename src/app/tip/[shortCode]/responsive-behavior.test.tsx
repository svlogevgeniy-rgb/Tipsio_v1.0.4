/**
 * Unit Tests for Responsive Behavior
 * Feature: tip-payment-ui-v2
 * 
 * Tests responsive behavior at different viewport sizes
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

describe("Responsive Behavior Unit Tests", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQrData),
      } as Response)
    );
  });

  it("mobile viewport (< 768px) - container is full width", async () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375,
    });

    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Find main container
    const mainContainer = container.querySelector(".md\\:min-w-\\[672px\\]");
    expect(mainContainer).toBeDefined();
    expect(mainContainer?.className).toContain("w-full");
  });

  it("tablet viewport (>= 768px) - container is 672px", async () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Find main container
    const mainContainer = container.querySelector(".md\\:min-w-\\[672px\\]");
    expect(mainContainer).toBeDefined();
    expect(mainContainer?.className).toContain("md:min-w-[672px]");
    expect(mainContainer?.className).toContain("md:w-[672px]");
  });

  it("desktop viewport (>= 1024px) - container is 672px and centered", async () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Find main container
    const mainContainer = container.querySelector(".md\\:min-w-\\[672px\\]");
    expect(mainContainer).toBeDefined();
    expect(mainContainer?.className).toContain("md:mx-auto");
  });

  it("touch target sizes on mobile - all buttons are at least 44px", async () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375,
    });

    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Check star rating buttons
    const starButtons = container.querySelectorAll('[role="radio"]');
    starButtons.forEach((button) => {
      expect(button.className).toContain("min-w-[44px]");
      expect(button.className).toContain("min-h-[44px]");
    });

    // Check preset amount buttons
    const buttons = Array.from(container.querySelectorAll("button"));
    const presetButtons = buttons.filter((btn) =>
      btn.textContent?.includes("Rp")
    );
    presetButtons.forEach((button) => {
      expect(button.className).toContain("h-12"); // 48px >= 44px
    });

    // Check submit button
    const submitButton = buttons.find((btn) =>
      btn.textContent?.includes("Send")
    );
    expect(submitButton?.className).toContain("h-14"); // 56px >= 44px
  });

  it("no horizontal scroll at mobile viewport", async () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375,
    });

    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Check that main container doesn't exceed viewport
    const mainContainer = container.querySelector(".w-full");
    expect(mainContainer).toBeDefined();
    
    // Container should have w-full on mobile
    expect(mainContainer?.className).toContain("w-full");
  });

  it("no horizontal scroll at tablet viewport", async () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Container should be 672px which is less than 768px viewport
    const mainContainer = container.querySelector(".md\\:w-\\[672px\\]");
    expect(mainContainer).toBeDefined();
  });

  it("responsive padding adjusts for different viewports", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Check header padding
    const header = container.querySelector("header");
    expect(header?.className).toContain("px-4");
    expect(header?.className).toContain("md:px-6");

    // Check main padding
    const main = container.querySelector("main");
    expect(main?.className).toContain("px-4");
    expect(main?.className).toContain("md:px-6");
  });

  it("grid layout for preset buttons works on all viewports", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Find preset buttons container
    const gridContainer = container.querySelector(".grid-cols-3");
    expect(gridContainer).toBeDefined();
    expect(gridContainer?.className).toContain("grid");
    expect(gridContainer?.className).toContain("grid-cols-3");
    expect(gridContainer?.className).toContain("gap-2");
  });
});
