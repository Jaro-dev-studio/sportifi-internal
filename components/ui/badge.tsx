import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Badge variants configuration
 * CUSTOMIZE: Adjust colors to match client brand
 */
const badgeVariants = {
  variant: {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    accent: "bg-accent text-accent-foreground",
    outline: "border border-border text-foreground bg-transparent",
    destructive: "bg-destructive text-destructive-foreground",
    muted: "bg-muted text-muted-foreground",
  },
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants.variant;
}

/**
 * Badge component for labels, tags, and status indicators.
 *
 * @example
 * <Badge>New</Badge>
 * <Badge variant="accent">Active</Badge>
 * <Badge variant="outline">Beta</Badge>
 */
export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        badgeVariants.variant[variant],
        className
      )}
      {...props}
    />
  );
}


