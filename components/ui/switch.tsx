"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type SwitchProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
  pressedWidth?: number;
  startIcon?: React.ReactElement;
  endIcon?: React.ReactElement;
  thumbIcon?: React.ReactElement;
};

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, pressedWidth = 19, startIcon, endIcon, thumbIcon, ...props }, ref) => {
  const [isPressed, setIsPressed] = React.useState(false);
  const [isChecked, setIsChecked] = React.useState(props.defaultChecked || false);
  
  // To handle controlled vs uncontrolled
  const handleCheckedChange = (checked: boolean) => {
    setIsChecked(checked);
    props.onCheckedChange?.(checked);
  };

  const currentChecked = props.checked !== undefined ? props.checked : isChecked;

  return (
    <SwitchPrimitives.Root
      ref={ref}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      onCheckedChange={handleCheckedChange}
      checked={currentChecked}
      className={cn(
        'relative peer focus-visible:border-ring focus-visible:ring-ring/50 flex h-5 w-8 px-px shrink-0 items-center justify-start rounded-full border border-transparent shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200',
        'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80 data-[state=checked]:justify-end',
        className,
      )}
      {...props}
    >
      <SwitchPrimitives.Thumb asChild>
        <motion.div
          layout
          initial={false}
          animate={{
            width: isPressed ? pressedWidth : 16,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
            mass: 1,
          }}
          className={cn(
            'pointer-events-none flex items-center justify-center h-4 rounded-full ring-0 shadow-sm transition-[color,background-color] bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground relative z-10',
          )}
        >
          {thumbIcon && (
            <span className="absolute [&_svg]:size-[9px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 dark:text-neutral-500 text-neutral-400">
              {thumbIcon}
            </span>
          )}
        </motion.div>
      </SwitchPrimitives.Thumb>

      {startIcon && (
        <span className="absolute [&_svg]:size-[9px] left-0.5 top-1/2 -translate-y-1/2 dark:text-neutral-500 text-neutral-400 pointer-events-none z-0">
          {startIcon}
        </span>
      )}
      {endIcon && (
        <span className="absolute [&_svg]:size-[9px] right-0.5 top-1/2 -translate-y-1/2 dark:text-neutral-400 text-neutral-500 pointer-events-none z-0">
          {endIcon}
        </span>
      )}
    </SwitchPrimitives.Root>
  )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch, type SwitchProps }
