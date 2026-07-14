import { useState } from "react"
import { StampHeader } from "@/components/ui/StampHeader"
import { Button } from "@/components/ui/Button"
import { Drawer } from "@/components/ui/Drawer"
import { Input } from "@/components/ui/Input"
import { useStock } from "@/data/useStock"
import { Plus } from "lucide-react"

export function Purchases() {
  const { stock, updateQuantity } = useStock()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedVariety, setSelectedVariety] = useState(stock[0]?.id || '')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState<'kg' | 'quintal' | 'ton'>('kg')
  const [rate, setRate] = useState('')
  const [purchases, setPurchases] = useState([
    { id: '1', entryNo: 'P-1042', date: '2026-07-14', supplier: 'Rajesh Traders', varietyName: 'Ponni Boiled', varietyId: 'ponni', quantity: 4500, rate: 42, total: 189000 },
    { id: '2', entryNo: 'P-1041', date: '2026-07-13', supplier: 'Sri Balaji Agro', varietyName: 'Sona Masuri', varietyId: 'sona', quantity: 1200, rate: 54, total: 64800 },
  ])

  const handleRecordPurchase = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Calculate actual kg based on unit
    let actualKg = Number(quantity)
    if (unit === 'quintal') actualKg *= 100
    if (unit === 'ton') actualKg *= 1000

    const variety = stock.find(v => v.id === selectedVariety)
    if (variety) {
      updateQuantity(variety.id, variety.quantity + actualKg)
      
      const newPurchase = {
        id: Math.random().toString(),
        entryNo: `P-${1043 + purchases.length}`,
        date: new Date().toISOString().split('T')[0],
        supplier: 'New Supplier', // Hardcoded for demo
        varietyName: variety.varietyName,
        varietyId: variety.varietyId,
        quantity: actualKg,
        rate: Number(rate),
        total: actualKg * Number(rate)
      }
      
      setPurchases([newPurchase, ...purchases])
      setIsDrawerOpen(false)
      setQuantity('')
      setRate('')
    }
  }

  const selectedVarietyDetails = stock.find(v => v.id === selectedVariety)
  
  // Auto-computed total
  let computedTotal = 0
  let displayQuantity = Number(quantity) || 0
  if (unit === 'quintal') displayQuantity *= 100
  if (unit === 'ton') displayQuantity *= 1000
  computedTotal = displayQuantity * (Number(rate) || 0)

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-start">
        <StampHeader title="Purchases" />
        <Button onClick={() => setIsDrawerOpen(true)} className="hidden md:flex">Record Purchase</Button>
      </div>

      <div className="bg-stone-light md:border md:border-brass/30 md:shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)] overflow-hidden">
        {/* Mobile Cards */}
        <div className="md:hidden flex flex-col gap-4 bg-stone pb-4">
          {purchases.map(purchase => (
            <div key={purchase.id} className="bg-stone-light border border-brass/30 p-4 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start border-b border-brass/10 pb-2">
                <div>
                  <div className="text-ink font-bold font-mono">{purchase.entryNo}</div>
                  <div className="text-xs text-ink/70 font-mono mt-0.5">{purchase.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg font-bold text-ink">₹{purchase.total.toLocaleString()}</div>
                  <div className="text-xs text-ink/70 font-mono">₹{purchase.rate.toFixed(2)}/kg</div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-1">
                <div className="flex flex-col gap-1">
                  <div className="font-sans font-medium text-ink flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full bg-variety-${purchase.varietyId}`} />
                    {purchase.varietyName}
                  </div>
                  <div className="text-sm text-ink/80">{purchase.supplier}</div>
                </div>
                <div className="text-paddy font-mono font-medium text-lg">
                  +{purchase.quantity.toLocaleString()} <span className="text-xs">kg</span>
                </div>
              </div>
            </div>
          ))}
          {purchases.length === 0 && (
            <div className="p-8 text-center font-sans text-ink/70 border border-brass/30 bg-stone-light">
              No purchases logged yet.
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <table className="hidden md:table w-full text-left text-sm">
          <thead className="border-b border-brass/30 font-display uppercase tracking-wider text-ink/70 bg-ink/5">
            <tr>
              <th className="p-4 w-24">Entry No.</th>
              <th className="p-4">Date</th>
              <th className="p-4">Supplier</th>
              <th className="p-4">Variety</th>
              <th className="p-4 text-right">Quantity (kg)</th>
              <th className="p-4 text-right">Rate (₹)</th>
              <th className="p-4 text-right">Total (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brass/10 font-mono">
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="hover:bg-ink/5 transition-colors">
                <td className="p-4 text-ink font-bold">{purchase.entryNo}</td>
                <td className="p-4 text-ink/70">{purchase.date}</td>
                <td className="p-4 font-sans text-ink">{purchase.supplier}</td>
                <td className="p-4 font-sans font-medium text-ink flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-variety-${purchase.varietyId}`} />
                  {purchase.varietyName}
                </td>
                <td className="p-4 text-right text-paddy font-medium">+{purchase.quantity.toLocaleString()}</td>
                <td className="p-4 text-right">{purchase.rate.toFixed(2)}</td>
                <td className="p-4 text-right font-medium text-ink">{purchase.total.toLocaleString()}</td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center font-sans text-ink/70">
                  No purchases logged yet — record your first delivery to start the ledger.
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

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Record Purchase">
        <form onSubmit={handleRecordPurchase} className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="font-medium text-sm">Supplier</label>
            <select className="flex h-10 w-full border border-brass/50 bg-stone/50 px-3 py-2 text-sm text-ink ring-offset-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turmeric" required>
              <option value="1">Rajesh Traders</option>
              <option value="2">Sri Balaji Agro</option>
              <option value="3">Punjab Rice Mills</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="font-medium text-sm">Rice Variety</label>
            <div className="flex gap-2">
              {selectedVarietyDetails && (
                <div className={`w-10 h-10 shrink-0 border border-brass/30 bg-variety-${selectedVarietyDetails.varietyId} rounded-sm shadow-[inset_0_1px_3px_rgba(20,32,26,0.1)] flex items-center justify-center`} />
              )}
              <select 
                className="flex h-10 w-full border border-brass/50 bg-stone/50 px-3 py-2 text-sm text-ink ring-offset-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turmeric"
                value={selectedVariety}
                onChange={(e) => setSelectedVariety(e.target.value)}
                required
              >
                {stock.map(v => (
                  <option key={v.id} value={v.id}>{v.varietyName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm flex justify-between">
              Quantity
              <div className="flex gap-2 text-xs font-mono">
                <button type="button" onClick={() => setUnit('kg')} className={unit === 'kg' ? 'text-ink font-bold' : 'text-ink/40'}>KG</button>
                <button type="button" onClick={() => setUnit('quintal')} className={unit === 'quintal' ? 'text-ink font-bold' : 'text-ink/40'}>QTL</button>
                <button type="button" onClick={() => setUnit('ton')} className={unit === 'ton' ? 'text-ink font-bold' : 'text-ink/40'}>TON</button>
              </div>
            </label>
            <div className="relative">
              <Input 
                type="number" 
                min="1" 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} 
                placeholder="0" 
                required 
                className="font-mono pr-12"
              />
              <span className="absolute right-3 top-2.5 text-ink/50 text-sm font-mono">{unit}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm">Rate (₹ per kg)</label>
            <Input 
              type="number" 
              min="0.1" 
              step="0.01" 
              value={rate} 
              onChange={(e) => setRate(e.target.value)} 
              placeholder="0.00" 
              required 
              className="font-mono"
            />
          </div>

          <div className="bg-ink/5 p-4 border border-brass/20 flex justify-between items-center">
            <span className="text-sm font-medium uppercase tracking-wider text-ink/70">Total Amount</span>
            <span className="font-mono text-xl font-bold text-ink">₹{computedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="pt-4 border-t border-brass/20">
            <Button type="submit" className="w-full">Record Purchase</Button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
