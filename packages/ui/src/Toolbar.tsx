import React from "react";
import clsx from "clsx";

export interface ToolbarProps {
  children: React.ReactNode;
  /** Insert visual dividers between children */
  dividers?: boolean;
  className?: string;
}

export function Toolbar({ children, dividers = false, className }: ToolbarProps) {
  const items = React.Children.toArray(children).filter(Boolean);

  return (
    <div
      className={clsx(
        "flex items-center gap-1",
        className,
      )}
      role="toolbar"
    >
      {dividers
        ? items.map((child, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <div
                  className="mx-1 h-5 w-px bg-gray-300"
                  aria-hidden="true"
                />
              )}
              {child}
            </React.Fragment>
          ))
        : children}
    </div>
  );
}
