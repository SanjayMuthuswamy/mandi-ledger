import { cn } from "@/lib/utils"

interface GrainGaugeProps {
  quantity: number
  max: number
  threshold: number
  varietyId: 'ponni' | 'sona' | 'basmati' | 'idli' | 'black' | 'brown'
  className?: string
  showLabel?: boolean
  label?: string
}

const varietyColors = {
  ponni: 'bg-variety-ponni',
  sona: 'bg-variety-sona',
  basmati: 'bg-variety-basmati',
  idli: 'bg-variety-idli',
  black: 'bg-variety-black',
  brown: 'bg-variety-brown',
}

export function GrainGauge({
  quantity,
  max,
  threshold,
  varietyId,
  className,
  showLabel,
  label
}: GrainGaugeProps) {
  const percentage = Math.min(100, Math.max(0, (quantity / max) * 100))
  const thresholdPercentage = Math.min(100, Math.max(0, (threshold / max) * 100))
  const isLowStock = quantity < threshold

  return (
    <div className={cn("flex flex-col md:flex-col justify-center min-h-[48px] md:min-h-0 gap-1 w-full", className)}>
      <div className="flex items-center gap-3 w-full">
        {(showLabel || label) && (
          <div className="font-sans md:font-mono text-sm font-medium w-1/3 shrink-0 md:w-auto md:shrink">
            <span className="text-ink truncate block">{label}</span>
          </div>
        )}
        <div className="relative h-4 flex-1 bg-stone shadow-[inset_0_1px_3px_rgba(20,32,26,0.1)] overflow-hidden border border-brass/20">
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out",
              varietyColors[varietyId]
            )}
            style={{ 
              width: `${percentage}%`,
              backgroundImage: 'radial-gradient(circle, rgba(20,32,26,0.1) 1px, transparent 1px)',
              backgroundSize: '4px 4px'
            }}
          />
          {/* Reorder Threshold Tick */}
          <div
            className={cn(
              "absolute top-0 bottom-0 w-0.5 bg-brass",
              isLowStock && "animate-pulse bg-ledger-red"
            )}
            style={{ left: `${thresholdPercentage}%` }}
          />
        </div>
        {(showLabel || label) && (
          <div className="font-mono text-sm text-right w-[80px] shrink-0 md:w-auto md:hidden lg:block">
            <span className={cn(isLowStock ? "text-ledger-red" : "text-ink")}>
              {quantity.toLocaleString()} kg
            </span>
          </div>
        )}
      </div>
      {(showLabel || label) && (
        <div className="hidden md:flex justify-between items-baseline font-mono text-sm lg:hidden w-full px-1">
           <span className="text-transparent">{label}</span>
           <span className={cn(isLowStock ? "text-ledger-red" : "text-ink")}>
             {quantity.toLocaleString()} kg
           </span>
        </div>
      )}
    </div>
  )
}
