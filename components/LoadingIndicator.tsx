/**
 * LoadingIndicator wrapper for Windows/Next.js project
 * Uses the dotm-square-1 component with Tailwind styling
 */

'use client';

import { DotmSquare1 } from '@/components/ui/dotm-square-1';

interface LoadingIndicatorProps {
  size?: number;
  dotSize?: number;
  speed?: number;
  bloom?: boolean;
  fullScreen?: boolean;
  label?: string;
}

export function LoadingIndicator({
  size = 32,
  dotSize = 4,
  speed = 1.2,
  bloom = true,
  fullScreen = false,
  label = 'Loading...',
}: LoadingIndicatorProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <DotmSquare1 size={size} dotSize={dotSize} speed={speed} bloom={bloom} />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm dark:bg-black/50 z-50">
        {content}
      </div>
    );
  }

  return content;
}
