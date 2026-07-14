import { StampHeader } from "@/components/ui/StampHeader"
import { useStock } from "@/data/useStock"
import { GrainGauge } from "@/components/ui/GrainGauge"

export function Dashboard() {
  const { stock } = useStock()

  const lowStockItems = stock.filter(item => item.quantity < item.threshold)

  return (
    <div className="flex flex-col gap-8 pb-12">
      <StampHeader title="Dashboard" />

      {lowStockItems.length > 0 && (
        <div className="bg-ledger-red text-stone p-4 border-2 border-ink flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display uppercase tracking-wider">Alert:</span>
            <span>{lowStockItems.length} varieties are running low on stock.</span>
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
            <div className="flex justify-between items-center py-2 border-b border-brass/10">
              <span className="text-paddy">+ Purchase</span>
              <span>Basmati Premium</span>
              <span>5,000 kg</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-brass/10">
              <span className="text-ledger-red">- Sale</span>
              <span>Ponni Boiled</span>
              <span>1,200 kg</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-brass/10">
              <span className="text-paddy">+ Purchase</span>
              <span>Sona Masuri</span>
              <span>800 kg</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-ledger-red">- Sale</span>
              <span>Idli Rice</span>
              <span>450 kg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
