import { cn } from "@/lib/utils"

export function StampHeader({ title, className }: { title: string, className?: string }) {
  return (
    <h1 className={cn(
      "font-display text-ink uppercase tracking-tight text-3xl drop-shadow-stamp origin-left inline-block mb-8",
      className
    )}>
      {title}
    </h1>
  )
}
