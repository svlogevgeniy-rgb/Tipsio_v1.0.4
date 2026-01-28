/**
 * Unit Tests for StarRating Component
 * Feature: tip-payment-ui-v2
 * 
 * Tests specific examples and edge cases for the StarRating component
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StarRating } from "./StarRating";

describe("StarRating Unit Tests", () => {
  describe("All 5 rating levels", () => {
    it("renders all 5 stars", () => {
      const onChange = vi.fn();
      render(<StarRating value={0} onChange={onChange} />);

      const stars = screen.getAllByRole("radio");
      expect(stars).toHaveLength(5);
    });

    it("displays correct label for rating 1", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      const { rerender } = render(<StarRating value={0} onChange={onChange} />);
      
      const stars = screen.getAllByRole("radio");
      await user.click(stars[0]);
      
      rerender(<StarRating value={1} onChange={onChange} />);
      expect(screen.getByText("Очень плохо")).toBeInTheDocument();
    });

    it("displays correct label for rating 2", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      const { rerender } = render(<StarRating value={0} onChange={onChange} />);
      
      const stars = screen.getAllByRole("radio");
      await user.click(stars[1]);
      
      rerender(<StarRating value={2} onChange={onChange} />);
      expect(screen.getByText("Плохо")).toBeInTheDocument();
    });

    it("displays correct label for rating 3", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      const { rerender } = render(<StarRating value={0} onChange={onChange} />);
      
      const stars = screen.getAllByRole("radio");
      await user.click(stars[2]);
      
      rerender(<StarRating value={3} onChange={onChange} />);
      expect(screen.getByText("Удовлетворительно")).toBeInTheDocument();
    });

    it("displays correct label for rating 4", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      const { rerender } = render(<StarRating value={0} onChange={onChange} />);
      
      const stars = screen.getAllByRole("radio");
      await user.click(stars[3]);
      
      rerender(<StarRating value={4} onChange={onChange} />);
      expect(screen.getByText("Хорошо")).toBeInTheDocument();
    });

    it("displays correct label for rating 5", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      const { rerender } = render(<StarRating value={0} onChange={onChange} />);
      
      const stars = screen.getAllByRole("radio");
      await user.click(stars[4]);
      
      rerender(<StarRating value={5} onChange={onChange} />);
      expect(screen.getByText("Отлично")).toBeInTheDocument();
    });
  });

  describe("Keyboard navigation", () => {
    it("supports Tab key to focus stars", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(<StarRating value={0} onChange={onChange} />);
      
      const stars = screen.getAllByRole("radio");
      
      // Tab should focus first star
      await user.tab();
      expect(stars[0]).toHaveFocus();
    });

    it("supports Enter key to select star", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(<StarRating value={0} onChange={onChange} />);
      
      const stars = screen.getAllByRole("radio");
      stars[2].focus();
      
      await user.keyboard("{Enter}");
      expect(onChange).toHaveBeenCalledWith(3);
    });

    it("supports Space key to select star", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(<StarRating value={0} onChange={onChange} />);
      
      const stars = screen.getAllByRole("radio");
      stars[3].focus();
      
      await user.keyboard(" ");
      expect(onChange).toHaveBeenCalledWith(4);
    });

    it("supports ArrowRight to increase rating", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(<StarRating value={2} onChange={onChange} />);
      
      const stars = screen.getAllByRole("radio");
      stars[1].focus(); // Focus on star 2
      
      await user.keyboard("{ArrowRight}");
      expect(onChange).toHaveBeenCalledWith(3);
    });

    it("supports ArrowLeft to decrease rating", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(<StarRating value={3} onChange={onChange} />);
      
      const stars = screen.getAllByRole("radio");
      stars[2].focus(); // Focus on star 3
      
      await user.keyboard("{ArrowLeft}");
      expect(onChange).toHaveBeenCalledWith(2);
    });

    it("ArrowRight does not go beyond 5", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(<StarRating value={5} onChange={onChange} />);
      
      const stars = screen.getAllByRole("radio");
      stars[4].focus(); // Focus on star 5
      
      await user.keyboard("{ArrowRight}");
      expect(onChange).toHaveBeenCalledWith(5); // Should stay at 5
    });

    it("ArrowLeft does not go below 1", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(<StarRating value={1} onChange={onChange} />);
      
      const stars = screen.getAllByRole("radio");
      stars[0].focus(); // Focus on star 1
      
      await user.keyboard("{ArrowLeft}");
      expect(onChange).toHaveBeenCalledWith(1); // Should stay at 1
    });
  });

  describe("Hover states", () => {
    it("shows preview label on hover", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(<StarRating value={2} onChange={onChange} />);
      
      const stars = screen.getAllByRole("radio");
      
      // Hover over 4th star
      await user.hover(stars[3]);
      expect(screen.getByText("Хорошо")).toBeInTheDocument();
    });

    it("restores original label after unhover", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(<StarRating value={2} onChange={onChange} />);
      
      const stars = screen.getAllByRole("radio");
      
      // Hover over 4th star
      await user.hover(stars[3]);
      expect(screen.getByText("Хорошо")).toBeInTheDocument();
      
      // Unhover
      await user.unhover(stars[3]);
      expect(screen.getByText("Плохо")).toBeInTheDocument();
    });
  });

  describe("ARIA attributes", () => {
    it("has radiogroup role with label", () => {
      const onChange = vi.fn();
      render(<StarRating value={3} onChange={onChange} />);
      
      const radiogroup = screen.getByRole("radiogroup");
      expect(radiogroup).toHaveAttribute("aria-label", "Рейтинг");
    });

    it("each star has radio role", () => {
      const onChange = vi.fn();
      render(<StarRating value={3} onChange={onChange} />);
      
      const stars = screen.getAllByRole("radio");
      expect(stars).toHaveLength(5);
    });

    it("selected star has aria-checked=true", () => {
      const onChange = vi.fn();
      render(<StarRating value={3} onChange={onChange} />);
      
      const stars = screen.getAllByRole("radio");
      expect(stars[2]).toHaveAttribute("aria-checked", "true");
    });

    it("unselected stars have aria-checked=false", () => {
      const onChange = vi.fn();
      render(<StarRating value={3} onChange={onChange} />);
      
      const stars = screen.getAllByRole("radio");
      expect(stars[0]).toHaveAttribute("aria-checked", "false");
      expect(stars[4]).toHaveAttribute("aria-checked", "false");
    });

    it("each star has descriptive aria-label", () => {
      const onChange = vi.fn();
      render(<StarRating value={0} onChange={onChange} />);
      
      const stars = screen.getAllByRole("radio");
      expect(stars[0]).toHaveAttribute("aria-label", "1 звезда");
      expect(stars[1]).toHaveAttribute("aria-label", "2 звезды");
      expect(stars[4]).toHaveAttribute("aria-label", "5 звёзд");
    });

    it("label has aria-live for screen readers", () => {
      const onChange = vi.fn();
      render(<StarRating value={3} onChange={onChange} />);
      
      const label = screen.getByText("Удовлетворительно");
      expect(label).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("Touch target sizes on mobile", () => {
    it("each star button has minimum 44x44px touch target", () => {
      const onChange = vi.fn();
      render(<StarRating value={0} onChange={onChange} />);
      
      const stars = screen.getAllByRole("radio");
      
      stars.forEach((star) => {
        // Check for min-w-[44px] and min-h-[44px] classes
        expect(star.className).toContain("min-w-[44px]");
        expect(star.className).toContain("min-h-[44px]");
      });
    });
  });

  describe("Disabled state", () => {
    it("does not call onChange when disabled", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(<StarRating value={2} onChange={onChange} disabled />);
      
      const stars = screen.getAllByRole("radio");
      await user.click(stars[3]);
      
      expect(onChange).not.toHaveBeenCalled();
    });

    it("does not show hover preview when disabled", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(<StarRating value={2} onChange={onChange} disabled />);
      
      const stars = screen.getAllByRole("radio");
      await user.hover(stars[3]);
      
      // Should still show original label, not hover preview
      expect(screen.getByText("Плохо")).toBeInTheDocument();
    });

    it("does not respond to keyboard when disabled", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      render(<StarRating value={2} onChange={onChange} disabled />);
      
      const stars = screen.getAllByRole("radio");
      stars[1].focus();
      
      await user.keyboard("{Enter}");
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("Custom labels", () => {
    it("uses custom labels when provided", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const customLabels = {
        1: "Bad",
        2: "Poor",
        3: "OK",
        4: "Good",
        5: "Excellent",
      };
      
      const { rerender } = render(
        <StarRating value={0} onChange={onChange} labels={customLabels} />
      );
      
      const stars = screen.getAllByRole("radio");
      await user.click(stars[4]);
      
      rerender(<StarRating value={5} onChange={onChange} labels={customLabels} />);
      expect(screen.getByText("Excellent")).toBeInTheDocument();
    });
  });
});
