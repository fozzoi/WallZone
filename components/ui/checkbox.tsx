// components/ui/checkbox.tsx
'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { motion, type HTMLMotionProps } from 'motion/react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<HTMLMotionProps<'button'>, 'onChange'> {
  variant?: 'default' | 'accent';
  size?: 'default' | 'sm' | 'lg';
  checked?: CheckboxPrimitive.CheckboxProps['checked'];
  onCheckedChange?: CheckboxPrimitive.CheckboxProps['onCheckedChange'];
  defaultChecked?: boolean;
}

const sizeMap = { sm: 'size-4', default: 'size-5', lg: 'size-6' };

function Checkbox({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: CheckboxProps) {
  const Root = CheckboxPrimitive.Root as React.ElementType;
  return (
    <Root asChild {...props}>
      {(<motion.button
        whileTap={{ scale: 0.9 }}
        className={cn(
          'flex items-center justify-center rounded border shrink-0',
          sizeMap[size],
          variant === 'accent'
            ? 'border-accent data-[state=checked]:bg-accent'
            : 'border-primary data-[state=checked]:bg-primary',
          className
        )}
      >
        <CheckboxPrimitive.Indicator asChild forceMount>
          {(<motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: props.checked || props.defaultChecked ? 1 : 0,
              scale: 1,
            }}
            className="text-primary-foreground"
          >
            <Check className="size-full p-0.5" strokeWidth={3} />
          </motion.span>) as any}
        </CheckboxPrimitive.Indicator>
      </motion.button>) as any}
    </Root>
  );
}

export { Checkbox };