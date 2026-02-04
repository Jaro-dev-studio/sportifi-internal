"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Avatar size configurations
 */
const avatarSizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image source URL */
  src?: string;
  /** Alt text for the image */
  alt?: string;
  /** Fallback text (typically initials) when image is not available */
  fallback?: string;
  /** Size variant */
  size?: keyof typeof avatarSizes;
}

/**
 * Avatar component for user profile images with fallback support.
 *
 * @example
 * <Avatar src="/user.jpg" alt="John Doe" fallback="JD" />
 * <Avatar fallback="AB" size="lg" />
 */
export function Avatar({
  className,
  src,
  alt = "",
  fallback,
  size = "md",
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  const showFallback = !src || hasError;

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted",
        avatarSizes[size],
        className
      )}
      {...props}
    >
      {!showFallback ? (
        <img
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="font-medium text-muted-foreground">
          {fallback || alt?.charAt(0)?.toUpperCase() || "?"}
        </span>
      )}
    </div>
  );
}

/**
 * Avatar group component for displaying multiple avatars
 *
 * @example
 * <AvatarGroup>
 *   <Avatar fallback="JD" />
 *   <Avatar fallback="AB" />
 *   <Avatar fallback="+3" />
 * </AvatarGroup>
 */
export function AvatarGroup({
  className,
  children,
  max = 4,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { max?: number }) {
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = childrenArray.slice(0, max);
  const remainingCount = childrenArray.length - max;

  return (
    <div className={cn("flex -space-x-2", className)} {...props}>
      {visibleChildren.map((child, index) => (
        <div key={index} className="ring-2 ring-background rounded-full">
          {child}
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="ring-2 ring-background rounded-full">
          <Avatar fallback={`+${remainingCount}`} />
        </div>
      )}
    </div>
  );
}

