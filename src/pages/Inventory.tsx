import { useState } from "react"
import { StampHeader } from "@/components/ui/StampHeader"
import { useStock } from "@/data/useStock"
import { GrainGauge } from "@/components/ui/GrainGauge"
import { Package } from "lucide-react"

export function Inventory() {
  const { stock } = useStock()
  const [view, setView] = useState<'grid' | 'table'>('grid')

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <StampHeader title="Inventory Matrix" className="mb-0 hidden md:block" />
          <h1 className="font-display text-ink uppercase tracking-tight text-3xl drop-shadow-stamp mb-0 md:hidden">Inventory</h1>
          <div className="bg-ink/5 border border-brass/20 px-2 py-1 text-xs font-mono text-paddy rounded-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-paddy animate-pulse" />
            Synced: {new Date().toLocaleTimeString()}
          </div>
        </div>
        <div className="flex bg-stone-light border border-brass/50 rounded-sm overflow-hidden p-0.5 shadow-[2px_2px_0px_0px_rgba(140,111,62,0.2)]">
          <button 
            className={`px-4 py-1 text-sm font-medium transition-colors ${view === 'grid' ? 'bg-ink text-stone' : 'hover:bg-ink/5 text-ink'}`}
            onClick={() => setView('grid')}
          >
            Gauge Grid
          </button>
          <button 
            className={`px-4 py-1 text-sm font-medium transition-colors ${view === 'table' ? 'bg-ink text-stone' : 'hover:bg-ink/5 text-ink'}`}
            onClick={() => setView('table')}
          >
            Table View
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stock.length === 0 ? (
            <div className="col-span-full p-16 flex flex-col items-center justify-center gap-4 text-ink/50 bg-[#F8F9F3] border border-dashed border-brass/30">
              <Package size={48} className="text-brass/20" />
              <p className="font-sans">Warehouse is empty. Add stock to begin tracking.</p>
            </div>
          ) : (
            stock.map(item => (
              <div key={item.id} className="bg-stone-light p-6 border border-brass/30 shadow-[4px_4px_0px_0px_rgba(20,32,26,0.05)] relative group overflow-hidden">
                <div className={`absolute top-0 right-0 w-16 h-16 opacity-5 bg-variety-${item.varietyId} rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500`} />
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="font-sans font-medium text-lg text-ink flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full bg-variety-${item.varietyId} border border-ink/10`} />
                      {item.varietyName}
                    </h3>
                    <div className="font-mono text-sm text-ink/60 mt-1">ID: {item.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xl text-ink">{item.quantity.toLocaleString()}</div>
                    <div className="font-mono text-xs text-ink/50">/ {item.max.toLocaleString()} kg</div>
                  </div>
                </div>
                
                <GrainGauge
                  quantity={item.quantity}
                  max={item.max}
                  threshold={item.threshold}
                  varietyId={item.varietyId}
                />
                
                <div className="mt-4 flex justify-between font-mono text-xs text-ink/60 border-t border-brass/10 pt-4">
                  <span>Threshold: {item.threshold.toLocaleString()} kg</span>
                  <span>₹{item.price}/kg</span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-stone-light md:border md:border-brass/30 md:shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)] overflow-hidden">
          {/* Mobile Cards for Table View */}
          <div className="md:hidden flex flex-col gap-4 bg-stone pb-4">
            {stock.map((item) => (
              <div key={item.id} className="bg-stone-light border border-brass/30 p-4 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-brass/10 pb-2">
                  <div className="font-sans font-medium text-ink flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-variety-${item.varietyId}`} />
                    {item.varietyName}
                  </div>
                  <div className="font-mono text-ink/60 text-xs">ID: {item.id}</div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-widest text-ink/50">Quantity</span>
                    <span className="font-mono text-lg font-medium text-ink">{item.quantity.toLocaleString()} kg</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs uppercase tracking-widest text-ink/50">Threshold</span>
                    <span className="font-mono text-sm text-ink/70">{item.threshold.toLocaleString()} kg</span>
                  </div>
                </div>
                <div className="mt-2 text-right">
                  {item.quantity < item.threshold ? (
                    <span className="text-ledger-red text-[10px] bg-ledger-red/10 px-2 py-1 rounded-sm border border-ledger-red/20 uppercase tracking-widest font-sans inline-block">Low Stock</span>
                  ) : (
                    <span className="text-paddy text-[10px] bg-paddy/10 px-2 py-1 rounded-sm border border-paddy/20 uppercase tracking-widest font-sans inline-block">In Stock</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <table className="hidden md:table w-full text-left text-sm border-collapse">
            <thead className="border-b-2 border-brass/30 font-display uppercase tracking-wider text-ink/70 bg-ink/5">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Variety</th>
                <th className="p-4 text-right">Quantity (kg)</th>
                <th className="p-4 text-right">Threshold</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {stock.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="p-16 flex flex-col items-center justify-center gap-4 text-ink/50 bg-[#F8F9F3]">
                      <Package size={48} className="text-brass/20" />
                      <p className="font-sans">Warehouse is empty. Add stock to begin tracking.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                stock.map((item) => (
                  <tr key={item.id} className="border-b border-brass/20 border-dotted hover:bg-ink/5 transition-colors even:bg-stone/30 font-mono group">
                    <td className="p-4 text-ink/60">{item.id}</td>
                    <td className="p-4 font-sans font-medium text-ink flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-variety-${item.varietyId}`} />
                      {item.varietyName}
                    </td>
                    <td className="p-4 text-right font-medium text-ink">{item.quantity.toLocaleString()}</td>
                    <td className="p-4 text-right text-ink/60">{item.threshold.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      {item.quantity < item.threshold ? (
                        <span className="text-ledger-red text-xs bg-ledger-red/10 px-2 py-1 rounded-sm border border-ledger-red/20 uppercase tracking-widest font-sans">Low Stock</span>
                      ) : (
                        <span className="text-paddy text-xs bg-paddy/10 px-2 py-1 rounded-sm border border-paddy/20 uppercase tracking-widest font-sans">In Stock</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
