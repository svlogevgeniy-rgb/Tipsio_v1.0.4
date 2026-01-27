/**
 * Property-Based Tests for StarRating Component
 * Feature: tip-payment-ui-v2
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as fc from "fast-check";
import { StarRating } from "./StarRating";

describe("StarRating Property-Based Tests", () => {
  /**
   * Property 5: Star Rating Interaction
   * For any star clicked (1-5), the rating component should update the form value
   * to that number, display the correct number of filled stars, and show the
   * appropriate label.
   * 
   * Validates: Requirements 5.2, 5.5, 5.7
   */
  it("Property 5: clicking any star updates value, fills correct stars, and shows label", async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 5 }), async (starToClick) => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        const labels = {
          1: "Очень плохо",
          2: "Плохо",
          3: "Удовлетворительно",
          4: "Хорошо",
          5: "Отлично",
        };

        const { rerender, unmount } = render(
          <StarRating value={0} onChange={onChange} labels={labels} />
        );

        // Click the star
        const starButtons = screen.getAllByRole("radio");
        await user.click(starButtons[starToClick - 1]);

        // Verify onChange was called with correct value
        expect(onChange).toHaveBeenCalledWith(starToClick);

        // Rerender with new value to check visual state
        rerender(
          <StarRating value={starToClick} onChange={onChange} labels={labels} />
        );

        // Verify correct number of filled stars
        const updatedStarButtons = screen.getAllByRole("radio");
        const filledStars = updatedStarButtons
          .slice(0, starToClick)
          .every((button) => {
            const star = button.querySelector("svg");
            return star?.classList.contains("fill-yellow-400");
          });
        expect(filledStars).toBe(true);

        // Verify correct label is shown
        expect(screen.getByText(labels[starToClick as keyof typeof labels])).toBeInTheDocument();
        
        // Clean up
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: Star Rating Keyboard Navigation
   * For any keyboard interaction (Tab, Enter, Arrow keys), the rating component
   * should be navigable and selectable via keyboard.
   * 
   * Validates: Requirements 5.4
   */
  it("Property 6: keyboard navigation works for any star", async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 5 }), async (initialStar) => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        const { unmount } = render(<StarRating value={initialStar} onChange={onChange} />);

        const starButtons = screen.getAllByRole("radio");
        const targetButton = starButtons[initialStar - 1];

        // Focus and press Enter to select
        targetButton.focus();
        await user.keyboard("{Enter}");
        expect(onChange).toHaveBeenCalledWith(initialStar);

        // Test arrow key navigation
        onChange.mockClear();
        
        // Arrow right should increase rating
        if (initialStar < 5) {
          await user.keyboard("{ArrowRight}");
          expect(onChange).toHaveBeenCalledWith(initialStar + 1);
        }

        // Arrow left should decrease rating
        onChange.mockClear();
        if (initialStar > 1) {
          await user.keyboard("{ArrowLeft}");
          expect(onChange).toHaveBeenCalledWith(initialStar - 1);
        }
        
        // Clean up
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: Star Rating Hover Preview
   * For any star hovered, the rating component should show a preview of what
   * rating would be selected.
   * 
   * Validates: Requirements 5.6
   */
  it("Property 7: hovering any star shows preview", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 1, max: 5 }),
        async (currentValue, hoverStar) => {
          const user = userEvent.setup();
          const onChange = vi.fn();
          const labels = {
            1: "Очень плохо",
            2: "Плохо",
            3: "Удовлетворительно",
            4: "Хорошо",
            5: "Отлично",
          };

          const { unmount } = render(
            <StarRating value={currentValue} onChange={onChange} labels={labels} />
          );

          const starButtons = screen.getAllByRole("radio");

          // Hover over the star
          await user.hover(starButtons[hoverStar - 1]);

          // Verify hover preview shows correct label
          const allLabels = screen.getAllByText(labels[hoverStar as keyof typeof labels]);
          expect(allLabels.length).toBeGreaterThan(0);

          // Verify correct number of stars appear filled during hover
          const filledStars = starButtons
            .slice(0, hoverStar)
            .every((button) => {
              const star = button.querySelector("svg");
              return star?.classList.contains("fill-yellow-400");
            });
          expect(filledStars).toBe(true);

          // Clean up
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional Property: All stars are accessible
   * For any rating value, all 5 stars should be present and have proper ARIA attributes
   */
  it("all stars have proper ARIA attributes for any value", async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 0, max: 5 }), async (value) => {
        const onChange = vi.fn();

        const { unmount } = render(<StarRating value={value} onChange={onChange} />);

        const starButtons = screen.getAllByRole("radio");
        
        // Verify exactly 5 stars
        expect(starButtons).toHaveLength(5);

        // Verify each star has proper ARIA attributes
        starButtons.forEach((button, index) => {
          const starNumber = index + 1;
          expect(button).toHaveAttribute("aria-checked", String(starNumber === value));
          expect(button).toHaveAttribute("aria-label");
        });

        // Verify radiogroup role
        const radiogroup = screen.getByRole("radiogroup");
        expect(radiogroup).toHaveAttribute("aria-label");
        
        // Clean up
        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
