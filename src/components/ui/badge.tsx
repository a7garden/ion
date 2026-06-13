import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-muted text-muted-foreground hover:bg-muted/80",
        success:
          "bg-[hsl(var(--state-success-bg)/0.15)] text-[hsl(var(--state-success))] hover:bg-[hsl(var(--state-success-bg)/0.25)]",
        warning:
          "bg-[hsl(var(--state-warning-bg)/0.15)] text-[hsl(var(--state-warning))] hover:bg-[hsl(var(--state-warning-bg)/0.25)]",
        error:
          "bg-[hsl(var(--state-error-bg)/0.15)] text-[hsl(var(--state-error))] hover:bg-[hsl(var(--state-error-bg)/0.25)]",
        info:
          "bg-[hsl(var(--state-info-bg)/0.15)] text-[hsl(var(--state-info))] hover:bg-[hsl(var(--state-info-bg)/0.25)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
