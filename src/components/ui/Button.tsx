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
          "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turmeric disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2",
          variant === 'primary' && "bg-turmeric text-ink hover:bg-turmeric/90 shadow-[4px_4px_0px_0px_rgba(20,32,26,1)] hover:shadow-[6px_6px_0px_0px_rgba(20,32,26,1)] hover:-translate-y-[2px] hover:-translate-x-[2px] active:shadow-[0px_0px_0px_0px_rgba(20,32,26,1)] active:translate-y-[4px] active:translate-x-[4px]",
          variant === 'secondary' && "bg-[#F8F9F3] border-2 border-brass text-ink hover:bg-stone/90 shadow-[4px_4px_0px_0px_rgba(20,32,26,1)] hover:shadow-[6px_6px_0px_0px_rgba(20,32,26,1)] hover:-translate-y-[2px] hover:-translate-x-[2px] active:shadow-[0px_0px_0px_0px_rgba(20,32,26,1)] active:translate-y-[4px] active:translate-x-[4px]",
          variant === 'danger' && "bg-ledger-red text-[#F8F9F3] hover:bg-ledger-red/90 shadow-[4px_4px_0px_0px_rgba(20,32,26,1)] hover:shadow-[6px_6px_0px_0px_rgba(20,32,26,1)] hover:-translate-y-[2px] hover:-translate-x-[2px] active:shadow-[0px_0px_0px_0px_rgba(20,32,26,1)] active:translate-y-[4px] active:translate-x-[4px]",
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
