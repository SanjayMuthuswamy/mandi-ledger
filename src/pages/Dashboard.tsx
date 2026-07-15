import { StampHeader } from "@/components/ui/StampHeader"
import { useDashboard } from "@/data/useDashboard"
import { GrainGauge } from "@/components/ui/GrainGauge"
import { Loader2 } from "lucide-react"

export function Dashboard() {
  const { summary, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-turmeric w-12 h-12" />
      </div>
    )
  }

  const stock = summary?.stock || []
  const todayLedger = summary?.todayLedger || []
  const lowStockCount = summary?.kpis?.lowStockCount || 0

  return (
    <div className="flex flex-col gap-8 pb-12">
      <StampHeader title="Dashboard" />

      {lowStockCount > 0 && (
        <div className="bg-ledger-red text-stone p-4 border-2 border-ink flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display uppercase tracking-wider">Alert:</span>
            <span>{lowStockCount} varieties are running low on stock.</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-stone-light p-6 border border-brass/30 shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)]">
          <h3 className="font-display uppercase tracking-wider text-lg mb-6 border-b border-brass/20 pb-2">Variety Breakdown</h3>
          <div className="space-y-6">
            {stock.map(item => (
              <GrainGauge
                key={item.id}
                quantity={item.quantity}
                max={item.max}
                threshold={item.threshold}
                varietyId={item.varietyId}
                showLabel
                label={item.varietyName}
              />
            ))}
          </div>
        </div>
        
        <div className="bg-stone-light p-6 border border-brass/30 shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)]">
          <h3 className="font-display uppercase tracking-wider text-lg mb-6 border-b border-brass/20 pb-2">Today's Ledger</h3>
          <div className="space-y-4 font-mono text-sm">
            {todayLedger.length === 0 ? (
              <div className="text-ink/50 py-4 text-center">No ledger entries today.</div>
            ) : (
              todayLedger.map((entry, idx) => (
                <div key={`${entry.entryNo}-${idx}`} className="flex justify-between items-center py-2 border-b border-brass/10 last:border-0">
                  <span className={entry.type === 'PURCHASE' ? "text-paddy w-24" : "text-ledger-red w-24"}>
                    {entry.type === 'PURCHASE' ? '+ Purchase' : '- Sale'}
                  </span>
                  <span className="flex-1 truncate px-2">{entry.varietyName}</span>
                  <span className="text-right w-24">{entry.quantity.toLocaleString()} kg</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
