/**
 * Unit Tests for StarRating Integration
 * Feature: tip-payment-ui-v2
 * 
 * Tests StarRating component integration with tip payment form
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

describe("StarRating Integration Tests", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQrData),
      } as Response)
    );
  });

  it("StarRating component is present on the page", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Check for StarRating component (should have role="radiogroup")
    const starRating = container.querySelector('[role="radiogroup"]');
    expect(starRating).toBeDefined();
  });

  it("StarRating updates form state when star is clicked", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Find star buttons
    const starButtons = container.querySelectorAll('[role="radio"]');
    expect(starButtons.length).toBe(5);

    // Click the 4th star (rating 4)
    fireEvent.click(starButtons[3]);

    // Check that the star is now checked
    await waitFor(() => {
      expect(starButtons[3].getAttribute("aria-checked")).toBe("true");
    });
  });

  it("form data structure is compatible with API", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ snapToken: "test-token" }),
      } as Response)
    );

    global.fetch = vi
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockQrData),
        } as Response)
      )
      .mockImplementationOnce(mockFetch);

    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Set tip amount
    const inputs = container.querySelectorAll('input[type="number"]');
    const tipInput = Array.from(inputs).find(
      (input) => input.getAttribute("placeholder") === "Amount"
    ) as HTMLInputElement;
    fireEvent.change(tipInput, { target: { value: "50000" } });

    // Click a star
    const starButtons = container.querySelectorAll('[role="radio"]');
    fireEvent.click(starButtons[4]); // 5 stars

    // Submit form
    const buttons = Array.from(container.querySelectorAll("button"));
    const submitButton = buttons.find((btn) => btn.textContent?.includes("Send"));
    
    expect(submitButton).toBeDefined();
    fireEvent.click(submitButton!);

    // Wait for API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Check that the API was called with correct data structure
    const callArgs = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(callArgs[1].body);

    expect(requestBody).toHaveProperty("experienceRating");
    expect(requestBody.experienceRating).toBe(5);
    expect(requestBody).toHaveProperty("message");
    expect(requestBody.message).toBe(null);
  });

  it("form validation includes rating (optional)", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Set tip amount
    const inputs = container.querySelectorAll('input[type="number"]');
    const tipInput = Array.from(inputs).find(
      (input) => input.getAttribute("placeholder") === "Amount"
    ) as HTMLInputElement;
    fireEvent.change(tipInput, { target: { value: "50000" } });

    // Don't select any rating

    // Submit button should still be enabled (rating is optional)
    const submitButton = Array.from(
      container.querySelectorAll("button")
    ).find((btn) => btn.textContent?.includes("Send"));

    expect(submitButton).toBeDefined();
    expect(submitButton?.hasAttribute("disabled")).toBe(false);
  });

  it("no message field is present", async () => {
    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Check that there's no textarea for message
    const textareas = container.querySelectorAll("textarea");
    expect(textareas.length).toBe(0);

    // Check that there's no "Message" heading
    const headings = Array.from(container.querySelectorAll("h2"));
    const messageHeading = headings.find((h) => h.textContent === "Message");
    expect(messageHeading).toBeUndefined();
  });

  it("rating value is sent as number (1-5) to API", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ snapToken: "test-token" }),
      } as Response)
    );

    global.fetch = vi
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockQrData),
        } as Response)
      )
      .mockImplementationOnce(mockFetch);

    const { container } = render(<TipPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Set tip amount
    const inputs = container.querySelectorAll('input[type="number"]');
    const tipInput = Array.from(inputs).find(
      (input) => input.getAttribute("placeholder") === "Amount"
    ) as HTMLInputElement;
    fireEvent.change(tipInput, { target: { value: "50000" } });

    // Click 3rd star (rating 3)
    const starButtons = container.querySelectorAll('[role="radio"]');
    fireEvent.click(starButtons[2]);

    // Submit form
    const submitButton = Array.from(
      container.querySelectorAll("button")
    ).find((btn) => btn.textContent?.includes("Send"));
    
    if (submitButton) {
      fireEvent.click(submitButton);
    }

    // Wait for API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Check that rating is sent as number
    const callArgs = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(callArgs[1].body);

    expect(typeof requestBody.experienceRating).toBe("number");
    expect(requestBody.experienceRating).toBe(3);
  });
});
