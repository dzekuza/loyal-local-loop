
import * as React from "react"
import {
  Select as Select21st,
  SelectContent as SelectContent21st,
  SelectItem as SelectItem21st,
  SelectTrigger as SelectTrigger21st,
  SelectValue as SelectValue21st
} from "@21st-dev/components"
import { cn } from "@/lib/utils"

const Select = Select21st

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectTrigger21st>,
  React.ComponentPropsWithoutRef<typeof SelectTrigger21st>
>(({ className, ...props }, ref) => (
  <SelectTrigger21st
    ref={ref}
    className={cn(
      "transition-all duration-200 focus:ring-2 focus:ring-offset-1",
      className
    )}
    {...props}
  />
))
SelectTrigger.displayName = SelectTrigger21st.displayName

const SelectValue = SelectValue21st

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectContent21st>,
  React.ComponentPropsWithoutRef<typeof SelectContent21st>
>(({ className, ...props }, ref) => (
  <SelectContent21st
    ref={ref}
    className={cn("animate-fade-in", className)}
    {...props}
  />
))
SelectContent.displayName = SelectContent21st.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectItem21st>,
  React.ComponentPropsWithoutRef<typeof SelectItem21st>
>(({ className, ...props }, ref) => (
  <SelectItem21st
    ref={ref}
    className={cn(
      "transition-colors duration-200 hover:bg-accent cursor-pointer",
      className
    )}
    {...props}
  />
))
SelectItem.displayName = SelectItem21st.displayName

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
}
