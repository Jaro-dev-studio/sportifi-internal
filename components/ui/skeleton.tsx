import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Skeleton component for loading states.
 * Shows a pulsing placeholder while content is loading.
 *
 * @example
 * // Text skeleton
 * <Skeleton className="h-4 w-[200px]" />
 *
 * // Avatar skeleton
 * <Skeleton className="h-12 w-12 rounded-full" />
 *
 * // Card skeleton
 * <Skeleton className="h-[200px] w-full rounded-xl" />
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

/**
 * Skeleton text block for paragraph placeholders
 */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-4/5" : "w-full" // Last line is shorter
          )}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton card for card-like content placeholders
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 space-y-4",
        className
      )}
    >
      <Skeleton className="h-6 w-1/2" />
      <SkeletonText lines={2} />
      <Skeleton className="h-10 w-24" />
    </div>
  );
}


