/**
 * Unit Tests for Numeric Tip Amount Input
 * Feature: tip-payment-ui-v2
 * 
 * Tests specific examples and edge cases for numeric input
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
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

describe("Numeric Input Unit Tests", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQrData),
      } as Response)
    );
  });

  it("accepts positive numbers", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const inputs = container.querySelectorAll('input[type="number"]');
    const tipInput = Array.from(inputs).find(
      (input) => input.getAttribute("placeholder") === "Amount"
    ) as HTMLInputElement;

    expect(tipInput).toBeDefined();

    fireEvent.change(tipInput, { target: { value: "50000" } });
    expect(tipInput.value).toBe("50000");

    fireEvent.change(tipInput, { target: { value: "100000" } });
    expect(tipInput.value).toBe("100000");
  });

  it("rejects negative numbers", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const inputs = container.querySelectorAll('input[type="number"]');
    const tipInput = Array.from(inputs).find(
      (input) => input.getAttribute("placeholder") === "Amount"
    ) as HTMLInputElement;

    expect(tipInput).toBeDefined();

    // Try to enter negative value
    fireEvent.change(tipInput, { target: { value: "-100" } });
    
    // Input should be empty or 0 (rejected)
    expect(tipInput.value === "" || tipInput.value === "0").toBe(true);
  });

  it("handles empty input", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const inputs = container.querySelectorAll('input[type="number"]');
    const tipInput = Array.from(inputs).find(
      (input) => input.getAttribute("placeholder") === "Amount"
    ) as HTMLInputElement;

    expect(tipInput).toBeDefined();

    // Set a value first
    fireEvent.change(tipInput, { target: { value: "50000" } });
    expect(tipInput.value).toBe("50000");

    // Clear the input
    fireEvent.change(tipInput, { target: { value: "" } });
    expect(tipInput.value).toBe("");
  });

  it("has inputMode='numeric'", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const inputs = container.querySelectorAll('input[type="number"]');
    const tipInput = Array.from(inputs).find(
      (input) => input.getAttribute("placeholder") === "Amount"
    ) as HTMLInputElement;

    expect(tipInput).toBeDefined();
    expect(tipInput.getAttribute("inputMode")).toBe("numeric");
  });

  it("has min='0' attribute", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const inputs = container.querySelectorAll('input[type="number"]');
    const tipInput = Array.from(inputs).find(
      (input) => input.getAttribute("placeholder") === "Amount"
    ) as HTMLInputElement;

    expect(tipInput).toBeDefined();
    expect(tipInput.getAttribute("min")).toBe("0");
  });

  it("has no visible +/- spinner controls", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const inputs = container.querySelectorAll('input[type="number"]');
    const tipInput = Array.from(inputs).find(
      (input) => input.getAttribute("placeholder") === "Amount"
    ) as HTMLInputElement;

    expect(tipInput).toBeDefined();

    // Check that input has classes to hide spinners
    const className = tipInput.className;
    expect(
      className.includes("appearance-textfield") ||
        className.includes("[appearance:textfield]")
    ).toBe(true);
  });

  it("preserves currency formatting in preset buttons", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Find preset buttons
    const buttons = container.querySelectorAll("button");
    const presetButtons = Array.from(buttons).filter((btn) =>
      btn.textContent?.includes("Rp")
    );

    expect(presetButtons.length).toBeGreaterThan(0);

    // Check that buttons show currency format
    presetButtons.forEach((btn) => {
      expect(btn.textContent).toMatch(/Rp \d+/);
    });
  });

  it("clears custom amount when preset is selected", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const inputs = container.querySelectorAll('input[type="number"]');
    const tipInput = Array.from(inputs).find(
      (input) => input.getAttribute("placeholder") === "Amount"
    ) as HTMLInputElement;

    expect(tipInput).toBeDefined();

    // Enter custom amount
    fireEvent.change(tipInput, { target: { value: "75000" } });
    expect(tipInput.value).toBe("75000");

    // Click preset button
    const buttons = container.querySelectorAll("button");
    const presetButton = Array.from(buttons).find((btn) =>
      btn.textContent?.includes("Rp 50")
    );

    expect(presetButton).toBeDefined();
    fireEvent.click(presetButton!);

    // Custom amount should be cleared
    expect(tipInput.value).toBe("");
  });
});
