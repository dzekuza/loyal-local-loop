
import * as React from "react"
import {
  Dialog as Dialog21st,
  DialogContent as DialogContent21st,
  DialogHeader as DialogHeader21st,
  DialogTitle as DialogTitle21st,
  DialogTrigger as DialogTrigger21st,
  DialogDescription as DialogDescription21st
} from "@21st-dev/components"
import { cn } from "@/lib/utils"

const Dialog = Dialog21st

const DialogTrigger = DialogTrigger21st

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogContent21st>,
  React.ComponentPropsWithoutRef<typeof DialogContent21st>
>(({ className, children, ...props }, ref) => (
  <DialogContent21st
    ref={ref}
    className={cn(
      "animate-scale-in data-[state=closed]:animate-scale-out",
      className
    )}
    {...props}
  >
    {children}
  </DialogContent21st>
))
DialogContent.displayName = DialogContent21st.displayName

const DialogHeader = React.forwardRef<
  React.ElementRef<typeof DialogHeader21st>,
  React.ComponentPropsWithoutRef<typeof DialogHeader21st>
>(({ className, ...props }, ref) => (
  <DialogHeader21st
    ref={ref}
    className={className}
    {...props}
  />
))
DialogHeader.displayName = DialogHeader21st.displayName

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogTitle21st>,
  React.ComponentPropsWithoutRef<typeof DialogTitle21st>
>(({ className, ...props }, ref) => (
  <DialogTitle21st
    ref={ref}
    className={className}
    {...props}
  />
))
DialogTitle.displayName = DialogTitle21st.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogDescription21st>,
  React.ComponentPropsWithoutRef<typeof DialogDescription21st>
>(({ className, ...props }, ref) => (
  <DialogDescription21st
    ref={ref}
    className={className}
    {...props}
  />
))
DialogDescription.displayName = DialogDescription21st.displayName

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
}
