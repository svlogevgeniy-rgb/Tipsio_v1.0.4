"use client";

import * as React from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative flex items-center justify-center rounded-full overflow-hidden bg-gradient-to-br from-cyan-500/20 to-blue-500/20 ring-2 ring-cyan-500/20",
  {
    variants: {
      size: {
        sm: "w-12 h-12",  // 48px - staff selection cards
        md: "w-16 h-16",  // 64px - payment page header
        lg: "w-24 h-24",  // 96px - success page
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const iconVariants = cva("text-cyan-400", {
  variants: {
    size: {
      sm: "w-6 h-6",
      md: "w-8 h-8",
      lg: "w-12 h-12",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const skeletonVariants = cva(
  "absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse",
  {
    variants: {
      size: {
        sm: "w-12 h-12",
        md: "w-16 h-16",
        lg: "w-24 h-24",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface StaffAvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src: string | null;
  alt: string;
}

const StaffAvatar = React.forwardRef<HTMLDivElement, StaffAvatarProps>(
  ({ className, size, src, alt, ...props }, ref) => {
    const [isLoading, setIsLoading] = React.useState(!!src);
    const [hasError, setHasError] = React.useState(false);
    const [imageSrc, setImageSrc] = React.useState(src);

    // Reset state when src changes
    React.useEffect(() => {
      setImageSrc(src);
      setIsLoading(!!src);
      setHasError(false);
    }, [src]);

    const handleImageLoad = () => {
      setIsLoading(false);
    };

    const handleImageError = () => {
      setIsLoading(false);
      setHasError(true);
      setImageSrc(null);
    };

    const showPlaceholder = !imageSrc || hasError;

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size, className }))}
        {...props}
      >
        {showPlaceholder ? (
          <User className={cn(iconVariants({ size }))} />
        ) : (
          <>
            <Image
              src={imageSrc}
              alt={alt || "Staff photo"}
              fill
              className="object-cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
              sizes={
                size === "sm"
                  ? "48px"
                  : size === "lg"
                    ? "96px"
                    : "64px"
              }
            />
            {isLoading && (
              <div className={cn(skeletonVariants({ size }))} />
            )}
          </>
        )}
      </div>
    );
  }
);

StaffAvatar.displayName = "StaffAvatar";

export { StaffAvatar, avatarVariants };
