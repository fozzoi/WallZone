// components/ui/alert-dialog.tsx
'use client';

import * as React from 'react';
import { AlertDialog as Base } from '@base-ui-components/react/alert-dialog';
import { motion, AnimatePresence, type HTMLMotionProps, type Transition } from 'motion/react';
import { cn } from '@/lib/utils';

const AlertDialog = Base.Root;
const AlertDialogTrigger = Base.Trigger;

type Direction = 'top' | 'bottom' | 'left' | 'right';
const offsets: Record<Direction, { x?: number; y?: number }> = {
  top: { y: -24 },
  bottom: { y: 24 },
  left: { x: -24 },
  right: { x: 24 },
};

interface AlertDialogPopupProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  from?: Direction;
  transition?: Transition;
}

function AlertDialogPopup({
  className,
  children,
  from = 'top',
  transition = { type: 'spring', stiffness: 150, damping: 25 },
  ...props
}: AlertDialogPopupProps) {
  return (
    <Base.Portal keepMounted>
      <AnimatePresence>
        <Base.Backdrop render={
          <motion.div
            className="fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        } />
        <Base.Popup render={
          <motion.div
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
              'rounded-lg border bg-popover p-6 shadow-lg',
              className
            )}
            initial={{ opacity: 0, scale: 0.96, ...offsets[from] }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, ...offsets[from] }}
            transition={transition}
          />
        } {...props}>
          {children}
        </Base.Popup>
      </AnimatePresence>
    </Base.Portal>
  );
}

const AlertDialogAction = Base.Close;
const AlertDialogCancel = Base.Close;

function AlertDialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mb-4 flex flex-col gap-1.5', className)} {...props} />;
}
function AlertDialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mt-6 flex justify-end gap-2', className)} {...props} />;
}
const AlertDialogTitle = Base.Title;
const AlertDialogDescription = Base.Description;

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPopup,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
};