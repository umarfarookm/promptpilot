import React from "react";
import clsx from "clsx";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label shown on hover */
  title: string;
  /** Whether the button is in an active/toggled state */
  active?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { title, active = false, className, children, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        title={title}
        aria-label={title}
        aria-pressed={active}
        className={clsx(
          "inline-flex items-center justify-center rounded-md p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-promptpilot-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          active
            ? "bg-promptpilot-primary-100 text-promptpilot-primary-700"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
