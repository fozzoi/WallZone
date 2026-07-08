"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 z-10 text-muted-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:text-foreground",
      },
      size: {
        default: "h-8 px-5 py-1 min-w-[60px]",
        sm: "h-7 px-3 text-xs",
        lg: "h-10 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    selectedValue: string | string[] | undefined
    layoutId: string
  }
>({
  size: "default",
  variant: "default",
  selectedValue: undefined,
  layoutId: "",
})

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, children, ...props }, ref) => {
  const [value, setValue] = React.useState<string | string[] | undefined>(props.defaultValue || props.value);
  const uniqueId = React.useId();

  const handleValueChange = (val: string | string[]) => {
    setValue(val);
    if (props.onValueChange) {
      props.onValueChange(val as any);
    }
  }

  const currentValue = props.value !== undefined ? props.value : value;

  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      className={cn("inline-flex items-center justify-center gap-1 p-1 rounded-lg bg-muted/60 border border-border/50", className)}
      onValueChange={handleValueChange}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, selectedValue: currentValue, layoutId: uniqueId }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
})
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, value, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)
  
  const isSelected = 
    Array.isArray(context.selectedValue) 
      ? context.selectedValue.includes(value)
      : context.selectedValue === value;

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      value={value}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "relative bg-transparent data-[state=on]:bg-transparent transition-all",
        className
      )}
      {...props}
    >
      {isSelected && (
        <motion.div
          layoutId={`toggleGroupHighlight-${context.layoutId}`}
          className="absolute inset-0 bg-background shadow-sm rounded-md z-[-1]"
          initial={false}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      )}
      <span className={cn("relative z-10 font-medium", isSelected ? "text-foreground" : "")}>
        {children}
      </span>
    </ToggleGroupPrimitive.Item>
  )
})
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem, toggleVariants }
