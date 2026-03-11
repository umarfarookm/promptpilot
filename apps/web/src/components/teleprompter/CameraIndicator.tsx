'use client';

import clsx from 'clsx';

interface CameraIndicatorProps {
  position: 'top' | 'bottom' | 'left' | 'right';
}

export function CameraIndicator({ position }: CameraIndicatorProps) {
  const positionClasses: Record<string, string> = {
    top: 'top-2 left-1/2 -translate-x-1/2',
    bottom: 'bottom-20 left-1/2 -translate-x-1/2',
    left: 'left-2 top-1/2 -translate-y-1/2',
    right: 'right-2 top-1/2 -translate-y-1/2',
  };

  const chevronRotation: Record<string, string> = {
    top: 'rotate-0',
    bottom: 'rotate-180',
    left: '-rotate-90',
    right: 'rotate-90',
  };

  return (
    <div
      className={clsx(
        'pointer-events-none fixed z-40 flex items-center gap-1',
        positionClasses[position],
      )}
    >
      <div className="flex flex-col items-center">
        <svg
          className={clsx('h-4 w-4 text-pp-primary-400/60', chevronRotation[position])}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 4l-8 8h16l-8-8z" />
        </svg>
        <span className="text-[10px] font-medium uppercase tracking-wider text-pp-primary-400/60">
          Camera
        </span>
      </div>
    </div>
  );
}
