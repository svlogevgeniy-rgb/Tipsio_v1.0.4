/**
 * Unit Tests for Button Styling
 * Feature: tip-payment-ui-v2
 * 
 * Tests specific button styling requirements
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor, fireEvent } from "@testing-library/react";
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

describe("Button Styling Unit Tests", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQrData),
      } as Response)
    );
  });

  it("primary button background is blue color", async () => {
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
    expect(submitButton?.className).toContain("bg-blue-600");
  });

  it("button text is white", async () => {
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
    expect(submitButton?.className).toContain("text-white");
  });

  it("hover state changes color to blue-700", async () => {
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
    expect(submitButton?.className).toContain("hover:bg-blue-700");
  });

  it("active state uses brand-active color", async () => {
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
    expect(submitButton?.className).toContain("active:bg-blue-800");
  });

  it("all primary buttons use consistent styling", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Find all buttons with blue styling
    const allButtons = Array.from(container.querySelectorAll("button"));
    const blueButtons = allButtons.filter((btn) => {
      const className = btn.className;
      return (
        className.includes("bg-blue-600") || className.includes("border-blue-600")
      );
    });

    expect(blueButtons.length).toBeGreaterThan(0);

    // All should have consistent hover states
    blueButtons.forEach((button) => {
      const className = button.className;
      const hasHoverState =
        className.includes("hover:bg-blue-700") ||
        className.includes("hover:border-blue-600");
      expect(hasHoverState).toBe(true);
    });
  });

  it("preset amount buttons use blue color when selected", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Find preset buttons (contain "Rp")
    const buttons = Array.from(container.querySelectorAll("button"));
    const presetButtons = buttons.filter((btn) =>
      btn.textContent?.includes("Rp")
    );

    expect(presetButtons.length).toBeGreaterThan(0);

    // Click first preset button
    fireEvent.click(presetButtons[0]);

    // Wait for state update
    await waitFor(() => {
      const className = presetButtons[0].className;
      expect(className).toContain("bg-blue-600");
      expect(className).toContain("border-blue-600");
      expect(className).toContain("text-white");
    });
  });

  it("inactive staff popup button uses blue colors", async () => {
    // Mock QR data with inactive staff to trigger popup
    const inactiveStaffData = {
      ...mockQrData,
      staff: {
        ...mockQrData.staff,
        status: "INACTIVE",
      },
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(inactiveStaffData),
      } as Response)
    );

    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Wait for popup to appear
    await waitFor(() => {
      const popup = container.querySelector(".fixed.inset-0");
      expect(popup).toBeDefined();
    });

    // Find button in popup
    const buttons = Array.from(container.querySelectorAll("button"));
    const popupButton = buttons.find(
      (btn) =>
        btn.textContent?.includes("Select Another") ||
        btn.textContent?.includes("selectAnother")
    );

    expect(popupButton).toBeDefined();
    expect(popupButton?.className).toContain("bg-blue-600");
    expect(popupButton?.className).toContain("hover:bg-blue-700");
    expect(popupButton?.className).toContain("text-white");
  });
});
