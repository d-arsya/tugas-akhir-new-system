import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@roja/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "roja_btn roja_btn-primary font-semibold",
        destructive: "roja_btn roja_btn-danger font-semibold",
        outline: "roja_btn roja_btn-secondary font-semibold",
        secondary: "roja_btn roja_btn-secondary font-semibold",
        ghost:"hover:bg-slate-100 hover:text-slate-900",
        link: "text-[var(--primary)] underline-offset-4 hover:underline",
        "roja-primary": "roja_btn roja_btn-primary font-semibold",
        "roja-secondary": "roja_btn roja_btn-secondary font-semibold",
        "roja-warning": "roja_btn roja_btn-warning font-semibold",
        "roja-danger": "roja_btn roja_btn-danger font-semibold",
        "roja-light-primary": "roja_btn roja_btn-light-primary font-semibold",
        "roja-light-secondary": "roja_btn roja_btn-light-secondary font-semibold",
        "roja-back": "roja_btn roja_btn-back font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
