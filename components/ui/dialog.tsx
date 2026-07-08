// components/ui/dialog.tsx
'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, AnimatePresence, type HTMLMotionProps, type Transition } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

type Direction = 'top' | 'bottom' | 'left' | 'right';

const offsets: Record<Direction, { x?: number; y?: number }> = {
  top: { y: -24 },
  bottom: { y: 24 },
  left: { x: -24 },
  right: { x: 24 },
};

interface DialogContentProps
  extends Omit<HTMLMotionProps<'div'>, 'children'>,
    Pick<DialogPrimitive.DialogContentProps, 'children'> {
  showCloseButton?: boolean;
  from?: Direction;
  transition?: Transition;
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  from = 'top',
  transition = { type: 'spring', stiffness: 150, damping: 25 },
  ...props
}: DialogContentProps) {
  const [open, setOpen] = React.useState(false);
  // Radix mounts/unmounts via Portal + forceMount; simplest path is to always
  // render and let AnimatePresence handle the visual open/close.
  return (
    <DialogPrimitive.Portal forceMount>
      <AnimatePresence>
        <DialogPrimitive.Overlay asChild forceMount>
          {(<motion.div
            className="fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />) as any}
        </DialogPrimitive.Overlay>
        {(() => {
          const Content = DialogPrimitive.Content as React.ElementType;
          return (
            <Content asChild forceMount {...props}>
          {(<motion.div
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
              'rounded-lg border bg-popover p-6 shadow-lg',
              className
            )}
            initial={{ opacity: 0, scale: 0.96, ...offsets[from] }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, ...offsets[from] }}
            transition={transition}
          >
            {children}
            {showCloseButton && (
              <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100">
                <X className="size-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            )}
          </motion.div>) as any}
        </Content>
          );
        })()}
      </AnimatePresence>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mb-4 flex flex-col gap-1.5', className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mt-6 flex justify-end gap-2', className)} {...props} />;
}

const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};