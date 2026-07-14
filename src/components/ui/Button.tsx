import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turmeric disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2",
          variant === 'primary' && "bg-turmeric text-ink hover:bg-turmeric/90 shadow-[2px_2px_0px_0px_rgba(20,32,26,1)] active:shadow-[0px_0px_0px_0px_rgba(20,32,26,1)] active:translate-y-[2px] active:translate-x-[2px]",
          variant === 'secondary' && "bg-stone border-2 border-ink text-ink hover:bg-stone/90",
          variant === 'danger' && "bg-ledger-red text-stone hover:bg-ledger-red/90 shadow-[2px_2px_0px_0px_rgba(20,32,26,1)] active:shadow-[0px_0px_0px_0px_rgba(20,32,26,1)] active:translate-y-[2px] active:translate-x-[2px]",
          variant === 'ghost' && "hover:bg-ink/5 text-ink",
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
