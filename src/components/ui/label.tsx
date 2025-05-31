
import * as React from "react"
import { Label as Label21st } from "@21st-dev/components"
import { cn } from "@/lib/utils"

const Label = React.forwardRef<
  React.ElementRef<typeof Label21st>,
  React.ComponentPropsWithoutRef<typeof Label21st>
>(({ className, ...props }, ref) => (
  <Label21st
    ref={ref}
    className={cn("transition-colors duration-200", className)}
    {...props}
  />
))
Label.displayName = Label21st.displayName

export { Label }
