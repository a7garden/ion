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
          "bg-[hsl(var(--state-success-bg)/0.15)] text-[hsl(var(--state-success))]",
        warning:
          "bg-[hsl(var(--state-warning-bg)/0.15)] text-[hsl(var(--state-warning))]",
        error:
          "bg-[hsl(var(--state-error-bg)/0.15)] text-[hsl(var(--state-error))]",
        info:
          "bg-[hsl(var(--state-info-bg)/0.15)] text-[hsl(var(--state-info))]",
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
