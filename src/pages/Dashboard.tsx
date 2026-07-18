import { StampHeader } from "@/components/ui/StampHeader"
import { useDashboard } from "@/data/useDashboard"
import { GrainGauge } from "@/components/ui/GrainGauge"
import { Loader2 } from "lucide-react"
import { parseVarietyName } from "@/lib/utils"

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

  // Calculate total bags across all stock items
  const totalBags = stock.reduce((sum, item) => {
    const { bags } = parseVarietyName(item.varietyName, item.quantity)
    return sum + bags
  }, 0)

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

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-stone-light border border-brass/30 p-6 shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)]">
          <div className="text-xs font-sans text-ink/50 uppercase tracking-widest mb-1 font-semibold">Total Stock</div>
          <div className="font-mono text-2xl font-bold text-ink tabular-nums">
            {totalBags.toLocaleString()} <span className="text-sm font-sans text-ink/60 font-normal">bags</span>
          </div>
        </div>
        <div className="bg-stone-light border border-brass/30 p-6 shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)]">
          <div className="text-xs font-sans text-ink/50 uppercase tracking-widest mb-1 font-semibold">Total Purchases</div>
          <div className="font-mono text-2xl font-bold text-ink tabular-nums">
            ₹{(summary?.kpis?.totalPurchaseValue || 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-stone-light border border-brass/30 p-6 shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)]">
          <div className="text-xs font-sans text-ink/50 uppercase tracking-widest mb-1 font-semibold">Total Sales</div>
          <div className="font-mono text-2xl font-bold text-ink tabular-nums">
            ₹{(summary?.kpis?.totalSaleValue || 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-stone-light p-6 border border-brass/30 shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)]">
          <h3 className="font-display uppercase tracking-wider text-lg mb-6 border-b border-brass/20 pb-2">Variety Breakdown</h3>
          <div className="space-y-6">
            {stock.map(item => {
              const { brandName, kgPerBag, bags } = parseVarietyName(item.varietyName, item.quantity)
              return (
                <div key={item.id} className="flex flex-col gap-2">
                  <div className="flex justify-between items-baseline font-mono text-xs text-ink/80 border-b border-brass/5 pb-1">
                    <div>
                      <span className="font-sans font-semibold text-brass uppercase tracking-wider text-[10px]">Brand:</span>{" "}
                      <span className="text-ink font-sans font-semibold text-sm">{brandName}</span>
                    </div>
                    <div>
                      <span className="font-sans text-[10px] text-ink/50 uppercase tracking-wider">Kg/bag:</span>{" "}
                      <span className="text-ink font-semibold">{kgPerBag}kg</span>
                    </div>
                    <div>
                      <span className="font-sans text-[10px] text-ink/50 uppercase tracking-wider">Total stock:</span>{" "}
                      <span className="text-paddy font-bold text-sm">{bags}</span>
                    </div>
                  </div>
                  <GrainGauge
                    quantity={item.quantity}
                    max={item.max}
                    threshold={item.threshold}
                    varietyId={item.varietyId}
                  />
                </div>
              )
            })}
          </div>
        </div>
        
        <div className="bg-stone-light p-6 border border-brass/30 shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)]">
          <h3 className="font-display uppercase tracking-wider text-lg mb-6 border-b border-brass/20 pb-2">Today's Ledger</h3>
          <div className="space-y-4 font-mono text-sm">
            {todayLedger.length === 0 ? (
              <div className="text-ink/50 py-4 text-center">No ledger entries today.</div>
            ) : (
              todayLedger.map((entry, idx) => {
                const { bags } = parseVarietyName(entry.varietyName, entry.quantity)
                return (
                  <div key={`${entry.entryNo}-${idx}`} className="flex justify-between items-center py-2 border-b border-brass/10 last:border-0">
                    <span className={entry.type === 'PURCHASE' ? "text-paddy w-24" : "text-ledger-red w-24"}>
                      {entry.type === 'PURCHASE' ? '+ Purchase' : '- Sale'}
                    </span>
                    <span className="flex-1 truncate px-2">{entry.varietyName}</span>
                    <span className="text-right w-24">{bags.toLocaleString()} Bags</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
