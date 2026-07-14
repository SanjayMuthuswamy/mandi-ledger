import { useState } from "react"
import { StampHeader } from "@/components/ui/StampHeader"
import { useStock } from "@/data/useStock"
import { GrainGauge } from "@/components/ui/GrainGauge"
import { Button } from "@/components/ui/Button"
import { Drawer } from "@/components/ui/Drawer"
import { Input } from "@/components/ui/Input"
import { Plus } from "lucide-react"

export function Stock() {
  const { stock, updateQuantity, deleteStock } = useStock()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock implementation for adding stock
    setIsDrawerOpen(false)
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-start">
        <StampHeader title="Rice Stock" />
        <Button onClick={() => setIsDrawerOpen(true)} className="hidden md:flex">Add Stock</Button>
      </div>

      <div className="bg-stone-light md:border md:border-brass/30 md:shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)]">
        {/* Mobile Cards */}
        <div className="md:hidden flex flex-col gap-4">
          {stock.map(item => (
            <div key={item.id} className="bg-stone-light border border-brass/30 p-4 shadow-sm flex flex-col gap-4 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="font-sans font-medium text-ink flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-variety-${item.varietyId}`} />
                  {item.varietyName}
                </div>
                <div className="text-right text-sm">
                  <div className="font-mono">₹{item.price}/kg</div>
                  <div className="text-xs text-ink/50 mt-1 font-mono">{item.lastUpdated}</div>
                </div>
              </div>
              
              <GrainGauge
                quantity={item.quantity}
                max={item.max}
                threshold={item.threshold}
                varietyId={item.varietyId}
              />
              
              <div className="flex justify-between items-center border-t border-brass/10 pt-3 mt-1">
                <div className="flex gap-2">
                  <Button variant="ghost" className="h-8 px-2 text-xs border border-brass/20" onClick={() => updateQuantity(item.id, item.quantity + 100)}>+100</Button>
                  <Button variant="ghost" className="h-8 px-2 text-xs border border-brass/20" onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 100))}>-100</Button>
                </div>
                <Button variant="ghost" className="h-8 px-2 text-xs text-ledger-red" onClick={() => deleteStock(item.id)}>VOID</Button>
              </div>
            </div>
          ))}
          {stock.length === 0 && (
            <div className="p-8 text-center font-sans text-ink/70 border border-brass/30">
              No grain entries yet.
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <table className="hidden md:table w-full text-left text-sm">
          <thead className="border-b border-brass/30 font-display uppercase tracking-wider text-ink/70">
            <tr>
              <th className="p-4">Variety</th>
              <th className="p-4 w-1/3">Quantity</th>
              <th className="p-4">Unit Price</th>
              <th className="p-4">Last Updated</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brass/10 font-mono">
            {stock.map((item) => (
              <tr key={item.id} className="hover:bg-ink/5 transition-colors group">
                <td className="p-4 font-sans font-medium text-ink flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-variety-${item.varietyId}`} />
                  {item.varietyName}
                </td>
                <td className="p-4">
                  <GrainGauge
                    quantity={item.quantity}
                    max={item.max}
                    threshold={item.threshold}
                    varietyId={item.varietyId}
                  />
                  <div className="text-xs mt-1 text-ink/70">{item.quantity.toLocaleString()} kg</div>
                </td>
                <td className="p-4">₹{item.price}/kg</td>
                <td className="p-4 text-ink/70">{item.lastUpdated}</td>
                <td className="p-4 text-right">
                  <Button variant="ghost" className="h-8 px-2 text-xs" onClick={() => updateQuantity(item.id, item.quantity + 100)}>+100</Button>
                  <Button variant="ghost" className="h-8 px-2 text-xs" onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 100))}>-100</Button>
                  <Button variant="ghost" className="h-8 px-2 text-xs text-ledger-red hover:text-ledger-red hover:bg-ledger-red/10" onClick={() => deleteStock(item.id)}>VOID</Button>
                </td>
              </tr>
            ))}
            {stock.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center font-sans text-ink/70">
                  No grain entries yet. Record your first delivery to start the ledger.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile FAB */}
      <button 
        className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-turmeric text-ink rounded-full shadow-[2px_2px_0px_0px_rgba(20,32,26,1)] flex items-center justify-center z-30"
        onClick={() => setIsDrawerOpen(true)}
      >
        <Plus size={24} />
      </button>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Add Stock">
        <form onSubmit={handleAddStock} className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="font-medium text-sm">Rice Variety Name</label>
            <Input placeholder="e.g. Sona Masuri" required />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-sm">Variety Type</label>
            <select className="flex h-10 w-full border border-brass/50 bg-stone/50 px-3 py-2 text-sm text-ink ring-offset-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turmeric" required>
              <option value="ponni">Ponni</option>
              <option value="sona">Sona</option>
              <option value="basmati">Basmati</option>
              <option value="idli">Idli</option>
              <option value="black">Black</option>
              <option value="brown">Brown</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="font-medium text-sm">Initial Quantity (kg)</label>
            <Input type="number" placeholder="0" required />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-sm">Unit Price (₹/kg)</label>
            <Input type="number" placeholder="0" required />
          </div>
          <div className="pt-4 border-t border-brass/20">
            <Button type="submit" className="w-full">Add Stock</Button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
