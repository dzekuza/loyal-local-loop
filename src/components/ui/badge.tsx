
import * as React from "react"
import { Badge as Badge21st } from "@21st-dev/components"
import { cn } from "@/lib/utils"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <Badge21st
      className={cn("transition-colors duration-200", className)}
      variant={variant}
      {...props}
    />
  )
}

export { Badge }
