
import * as React from "react"
import { Button as Button21st } from "@21st-dev/components"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    return (
      <Button21st
        ref={ref}
        className={cn(
          "transition-all duration-200 hover:scale-105 active:scale-95",
          "transform hover:shadow-lg",
          className
        )}
        variant={variant}
        size={size}
        {...props}
      >
        {children}
      </Button21st>
    )
  }
)
Button.displayName = "Button"

export { Button }
