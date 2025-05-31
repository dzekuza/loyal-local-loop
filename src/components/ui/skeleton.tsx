
import * as React from "react"
import { Skeleton as Skeleton21st } from "@21st-dev/components"
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton21st
      className={cn("animate-pulse", className)}
      {...props}
    />
  )
}

export { Skeleton }
