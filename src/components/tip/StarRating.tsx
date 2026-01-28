"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface StarRatingProps {
  value: number; // 0-5
  onChange: (value: number) => void;
  labels?: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
  };
  className?: string;
  disabled?: boolean;
}

const DEFAULT_LABELS = {
  1: "Очень плохо",
  2: "Плохо",
  3: "Удовлетворительно",
  4: "Хорошо",
  5: "Отлично",
};

export function StarRating({
  value,
  onChange,
  labels = DEFAULT_LABELS,
  className,
  disabled = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue ?? value;
  const currentLabel = displayValue > 0 ? labels[displayValue as keyof typeof labels] : "";

  const handleClick = (rating: number) => {
    if (!disabled) {
      onChange(rating);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, rating: number) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange(rating);
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const nextRating = Math.min(5, rating + 1);
      onChange(nextRating);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const prevRating = Math.max(1, rating - 1);
      onChange(prevRating);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        role="radiogroup"
        aria-label="Рейтинг"
        className="flex gap-1"
        onMouseLeave={() => setHoverValue(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayValue;
          const isSelected = star === value;

          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${star} ${star === 1 ? "звезда" : star <= 4 ? "звезды" : "звёзд"}`}
              disabled={disabled}
              onClick={() => handleClick(star)}
              onKeyDown={(e) => handleKeyDown(e, star)}
              onMouseEnter={() => !disabled && setHoverValue(star)}
              onFocus={() => !disabled && setHoverValue(star)}
              onBlur={() => setHoverValue(null)}
              className={cn(
                "relative transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 rounded",
                "min-w-[44px] min-h-[44px] flex items-center justify-center", // Touch target size
                disabled && "cursor-not-allowed opacity-50",
                !disabled && "cursor-pointer hover:scale-110"
              )}
            >
              <Star
                className={cn(
                  "w-8 h-8 transition-colors duration-200",
                  isFilled
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-none text-gray-300"
                )}
              />
            </button>
          );
        })}
      </div>

      {currentLabel && (
        <p
          className="text-sm text-center text-muted-foreground min-h-[20px]"
          aria-live="polite"
        >
          {currentLabel}
        </p>
      )}
    </div>
  );
}
