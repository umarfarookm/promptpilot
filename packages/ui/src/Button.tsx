import React from "react";
import clsx from "clsx";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-promptpilot-primary-600 text-white hover:bg-promptpilot-primary-700 active:bg-promptpilot-primary-800 focus-visible:ring-promptpilot-primary-500",
  secondary:
    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-promptpilot-primary-500",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-promptpilot-primary-500",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-xs rounded",
  md: "px-4 py-2 text-sm rounded-md",
  lg: "px-6 py-3 text-base rounded-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", className, children, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
