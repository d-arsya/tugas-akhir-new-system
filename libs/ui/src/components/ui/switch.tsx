import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@roja/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitives.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors outline-none roja_switch_root disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitives.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out roja_switch_thumb",
          className
        )}
      />
    </SwitchPrimitives.Root>
  )
}

export { Switch }
