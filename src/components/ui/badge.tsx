import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-muted text-muted-foreground",
        success:
          "bg-[oklch(var(--state-success-bg)/0.15)] text-[oklch(var(--state-success))]",
        warning:
          "bg-[oklch(var(--state-warning-bg)/0.15)] text-[oklch(var(--state-warning))]",
        error:
          "bg-[oklch(var(--state-error-bg)/0.15)] text-[oklch(var(--state-error))]",
        info:
          "bg-[oklch(var(--state-info-bg)/0.15)] text-[oklch(var(--state-info))]",
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

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { badgeVariants }
