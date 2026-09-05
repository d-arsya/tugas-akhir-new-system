import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@roja/utils"

const alertVariants = cva(
  "relative w-full rounded-2xl border-0 p-3.5 px-4 font-semibold text-xs [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-2px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-3.5 shadow-none transition-all",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border border-border",
        destructive: "roja_alert-danger",
        warning: "roja_alert-warning",
        primary: "roja_alert-primary",
        secondary: "roja_alert-secondary",
        danger: "roja_alert-danger",
        success: "roja_alert-success",
        info: "roja_alert-info",
        tertiary: "roja_alert-tertiary",
        "muted-warning": "roja_alert-muted-warning",
        "muted-primary": "roja_alert-muted-primary",
        "muted-secondary": "roja_alert-muted-secondary",
        "muted-danger": "roja_alert-muted-danger",
        "muted-success": "roja_alert-muted-success",
        "muted-info": "roja_alert-muted-info",
        "muted-tertiary": "roja_alert-muted-tertiary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
