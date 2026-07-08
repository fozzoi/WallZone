// components/ui/ripple-button.tsx
'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps, type Transition } from 'motion/react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'accent' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type Size = 'default' | 'sm' | 'lg' | 'icon';

const variantClasses: Record<Variant, string> = {
  default: 'bg-primary text-primary-foreground',
  accent: 'bg-accent text-accent-foreground',
  destructive: 'bg-destructive text-white',
  outline: 'border border-input bg-transparent',
  secondary: 'bg-secondary text-secondary-foreground',
  ghost: 'bg-transparent hover:bg-accent',
  link: 'bg-transparent underline-offset-4 hover:underline',
};

const sizeClasses: Record<Size, string> = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 px-3 text-sm',
  lg: 'h-10 px-6',
  icon: 'size-9 p-0',
};

interface RippleButtonProps extends HTMLMotionProps<'button'> {
  variant?: Variant;
  size?: Size;
  hoverScale?: number;
  tapScale?: number;
}

const RippleContext = React.createContext<{
  ripples: { id: number; x: number; y: number }[];
  addRipple: (e: React.MouseEvent<HTMLButtonElement>) => void;
}>({ ripples: [], addRipple: () => {} });

function RippleButton({
  className,
  variant = 'default',
  size = 'default',
  hoverScale = 1.05,
  tapScale = 0.95,
  children,
  onClick,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = React.useState<{ id: number; x: number; y: number }[]>([]);
  const idRef = React.useRef(0);

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = idRef.current++;
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 700);
  };

  return (
    <RippleContext.Provider value={{ ripples, addRipple }}>
      <motion.button
        whileHover={{ scale: hoverScale }}
        whileTap={{ scale: tapScale }}
        onClick={(e) => {
          addRipple(e);
          onClick?.(e);
        }}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md text-sm font-medium',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    </RippleContext.Provider>
  );
}

interface RippleButtonRipplesProps extends HTMLMotionProps<'span'> {
  color?: string;
  scale?: number;
  transition?: Transition;
}

function RippleButtonRipples({
  color = 'var(--ripple-button-ripple-color, rgba(255,255,255,0.5))',
  scale = 10,
  transition = { duration: 0.6, ease: 'easeOut' },
  className,
  ...props
}: RippleButtonRipplesProps) {
  const { ripples } = React.useContext(RippleContext);
  return (
    <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-md">
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          className={cn('absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full', className)}
          style={{ left: r.x, top: r.y, backgroundColor: color }}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale, opacity: 0 }}
          transition={transition}
          {...props}
        />
      ))}
    </span>
  );
}

export { RippleButton, RippleButtonRipples };