import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Button variants configuration
 * CUSTOMIZE: Adjust styles to match client brand guidelines
 */
const buttonVariants = {
  variant: {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary-hover shadow-sm",
    outline:
      "border border-border bg-background text-foreground hover:bg-muted hover:text-foreground",
    ghost: "text-foreground hover:bg-muted hover:text-foreground",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
    link: "text-primary underline-offset-4 hover:underline",
  },
  size: {
    sm: "h-9 px-3 text-sm rounded-md",
    md: "h-10 px-4 py-2 text-sm rounded-lg",
    lg: "h-11 px-8 text-base rounded-lg",
    icon: "h-10 w-10 rounded-lg",
  },
};

/**
 * Get button class names based on variant and size
 */
export function getButtonStyles(
  variant: keyof typeof buttonVariants.variant = "primary",
  size: keyof typeof buttonVariants.size = "md",
  className?: string
) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    buttonVariants.variant[variant],
    buttonVariants.size[size],
    className
  );
}

type ButtonBaseProps = {
  variant?: keyof typeof buttonVariants.variant;
  size?: keyof typeof buttonVariants.size;
  isLoading?: boolean;
};

export type ButtonProps = ButtonBaseProps &
  (
    | (React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: false })
    | (React.PropsWithChildren<{ asChild: true; className?: string }>)
  );

/**
 * Primary button component with multiple variants and sizes.
 * Supports rendering as a child element via asChild prop.
 *
 * @example
 * <Button variant="primary" size="lg">Get Started</Button>
 * <Button variant="outline">Learn More</Button>
 * <Button asChild><Link href="/dashboard">Dashboard</Link></Button>
 */
export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    isLoading = false,
    className,
    children,
  } = props;

  const buttonClassName = getButtonStyles(variant, size, className);

  // Handle asChild - render children with button styles
  if ("asChild" in props && props.asChild) {
    const child = React.Children.only(children) as React.ReactElement<{
      className?: string;
    }>;
    return React.cloneElement(child, {
      className: cn(buttonClassName, child.props.className),
    });
  }

  // Regular button rendering
  const { disabled, ...buttonProps } = props as React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonBaseProps;

  return (
    <button
      className={buttonClassName}
      disabled={disabled || isLoading}
      {...buttonProps}
    >
      {isLoading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
