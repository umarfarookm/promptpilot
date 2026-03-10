import React from "react";
import clsx from "clsx";

export interface SliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function Slider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  className,
}: SliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const id = React.useId();

  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <span className="text-sm tabular-nums text-gray-500">{value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-promptpilot-primary-600"
      />
    </div>
  );
}
