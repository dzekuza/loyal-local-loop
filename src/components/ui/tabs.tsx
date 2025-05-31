
import * as React from "react"
import { 
  Tabs as Tabs21st, 
  TabsList as TabsList21st, 
  TabsTrigger as TabsTrigger21st, 
  TabsContent as TabsContent21st 
} from "@21st-dev/components"
import { cn } from "@/lib/utils"

const Tabs = Tabs21st

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsList21st>,
  React.ComponentPropsWithoutRef<typeof TabsList21st>
>(({ className, ...props }, ref) => (
  <TabsList21st
    ref={ref}
    className={cn("transition-colors duration-200", className)}
    {...props}
  />
))
TabsList.displayName = TabsList21st.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsTrigger21st>,
  React.ComponentPropsWithoutRef<typeof TabsTrigger21st>
>(({ className, ...props }, ref) => (
  <TabsTrigger21st
    ref={ref}
    className={cn(
      "transition-all duration-200 hover:scale-105",
      "data-[state=active]:scale-105",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsTrigger21st.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsContent21st>,
  React.ComponentPropsWithoutRef<typeof TabsContent21st>
>(({ className, ...props }, ref) => (
  <TabsContent21st
    ref={ref}
    className={cn("animate-fade-in", className)}
    {...props}
  />
))
TabsContent.displayName = TabsContent21st.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
