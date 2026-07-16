import { useState, useMemo } from "react"
import { StampHeader } from "@/components/ui/StampHeader"
import { Button } from "@/components/ui/Button"
import { Drawer } from "@/components/ui/Drawer"
import { Input } from "@/components/ui/Input"
import { useVarieties } from "@/data/useVarieties"
import { usePurchases } from "@/data/usePurchases"
import { useSuppliers } from "@/data/useSuppliers"
import { useAuth } from "@/contexts/AuthContext"
import { Plus, Wheat, Loader2 } from "lucide-react"

export function Purchases() {
  const { purchases, isLoading: isPurchasesLoading, addPurchase, deletePurchase } = usePurchases(1, 100)
  const { varieties, isLoading: isVarietiesLoading } = useVarieties()
  const { suppliers, isLoading: isSuppliersLoading } = useSuppliers(1, 100)
  const { user } = useAuth()
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedVariety, setSelectedVariety] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState<'kg' | 'quintal' | 'ton'>('kg')
  const [rate, setRate] = useState('')

  const [errorMsg, setErrorMsg] = useState('')

  const handleRecordPurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    
    let actualKg = Number(quantity)
    if (unit === 'quintal') actualKg *= 100
    if (unit === 'ton') actualKg *= 1000

    if (selectedVariety && selectedSupplier) {
      try {
        await addPurchase({
          supplierId: selectedSupplier,
          purchaseDate: new Date().toISOString(),
          paymentStatus: 'PENDING',
          items: [{
            riceVarietyId: selectedVariety,
            quantity: actualKg,
            rate: Number(rate)
          }]
        })
        
        setIsDrawerOpen(false)
        setQuantity('')
        setRate('')
      } catch (err: any) {
        let msg = err.data?.error || "Failed to record purchase. Please try again."
        if (err.data?.issues) {
           const issuesStr = Object.entries(err.data.issues)
              .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
              .join(' | ')
           msg += ` (${issuesStr})`
        }
        setErrorMsg(msg)
      }
    }
  }

  const handleDeletePurchase = (id: string) => {
    if (user?.role !== 'ADMIN') {
      alert("Access Denied: Only Administrators can delete purchase records.")
      return
    }
    const confirmed = window.confirm("Are you sure you want to delete this purchase? Stock will NOT be automatically reverted.")
    if (confirmed) {
      deletePurchase(id)
    }
  }

  const selectedVarietyDetails = useMemo(() => 
    varieties.find(v => v.id === selectedVariety), 
  [varieties, selectedVariety])
  
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

      {(isPurchasesLoading || isVarietiesLoading || isSuppliersLoading) ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-turmeric w-8 h-8" />
        </div>
      ) : (
        <div className="bg-stone-light md:border md:border-brass/30 md:shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)] overflow-hidden">
          <div className="md:hidden flex flex-col gap-4 bg-stone pb-4">
            {purchases.map(purchase => (
              <div key={purchase.id} className="bg-stone-light border border-brass/30 p-4 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start border-b border-brass/10 pb-2">
                  <div>
                    <div className="text-ink font-bold font-mono">{purchase.entryNo}</div>
                    <div className="text-xs text-ink/70 font-mono mt-0.5">{purchase.purchaseDate.split('T')[0]}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg font-bold text-ink">₹{purchase.totalAmount.toLocaleString()}</div>
                    <div className="text-xs text-ink/70 font-mono">₹{purchase.items[0]?.rate.toFixed(2)}/kg</div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <div className="flex flex-col gap-1">
                    <div className="font-sans font-medium text-ink flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full bg-variety-${purchase.items[0]?.variety?.code}`} />
                      {purchase.items[0]?.variety?.name}
                    </div>
                    <div className="text-sm text-ink/80">{purchase.supplier?.name}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-paddy font-mono font-medium text-lg">
                      +{purchase.items[0]?.quantity.toLocaleString()} <span className="text-xs">kg</span>
                    </div>
                    <Button variant="ghost" className="h-6 px-2 text-xs text-ledger-red hover:bg-ledger-red/10" onClick={() => handleDeletePurchase(purchase.id)}>DELETE</Button>
                  </div>
                </div>
              </div>
            ))}
            {purchases.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-stone border border-brass/20">
                <div className="w-16 h-16 rounded-full bg-ink/5 flex items-center justify-center">
                  <Wheat size={32} className="text-brass/40" />
                </div>
                <p className="font-sans text-ink/60 font-medium">No purchases logged yet.</p>
              </div>
            )}
          </div>

          <table className="hidden md:table w-full text-left text-sm border-collapse">
            <thead className="border-b-2 border-brass/30 font-display uppercase tracking-wider text-ink/70 bg-ink/5">
              <tr>
                <th className="p-4 w-24">Entry No.</th>
                <th className="p-4">Date</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Variety</th>
                <th className="p-4 text-right">Quantity (kg)</th>
                <th className="p-4 text-right">Rate (₹)</th>
                <th className="p-4 text-right">Total (₹)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="border-b border-brass/20 border-dotted hover:bg-ink/5 transition-colors even:bg-stone/30">
                  <td className="p-4 text-ink font-bold">{purchase.entryNo}</td>
                  <td className="p-4 text-ink/70">{purchase.purchaseDate.split('T')[0]}</td>
                  <td className="p-4 font-sans text-ink">{purchase.supplier?.name}</td>
                  <td className="p-4 font-sans font-medium text-ink flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-variety-${purchase.items[0]?.variety?.code}`} />
                    {purchase.items[0]?.variety?.name}
                  </td>
                  <td className="p-4 text-right text-paddy font-medium">+{purchase.items[0]?.quantity.toLocaleString()}</td>
                  <td className="p-4 text-right">{purchase.items[0]?.rate.toFixed(2)}</td>
                  <td className="p-4 text-right font-medium text-ink">{purchase.totalAmount.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" className="h-8 px-2 text-xs text-ledger-red hover:bg-ledger-red/10" onClick={() => handleDeletePurchase(purchase.id)}>DELETE</Button>
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="p-16 flex flex-col items-center justify-center gap-4 text-ink/50 bg-[#F8F9F3]">
                      <Wheat size={48} className="text-brass/20" />
                      <p className="font-sans">No purchases recorded today. Record today's first purchase.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

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
            <select 
              className="flex h-10 w-full border border-brass/50 bg-stone/50 px-3 py-2 text-sm text-ink ring-offset-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turmeric" 
              required
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
            >
              <option value="" disabled>Select Supplier</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="font-medium text-sm">Rice Variety</label>
            <div className="flex gap-2">
              {selectedVarietyDetails && (
                <div className={`w-10 h-10 shrink-0 border border-brass/30 bg-variety-${selectedVarietyDetails.code} rounded-sm shadow-[inset_0_1px_3px_rgba(20,32,26,0.1)] flex items-center justify-center`} />
              )}
              <select 
                className="flex h-10 w-full border border-brass/50 bg-stone/50 px-3 py-2 text-sm text-ink ring-offset-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turmeric"
                value={selectedVariety}
                onChange={(e) => setSelectedVariety(e.target.value)}
                required
              >
                <option value="" disabled>Select Variety</option>
                {varieties.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
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

          {errorMsg && (
            <div className="bg-ledger-red/10 border border-ledger-red/30 p-3 text-ledger-red text-sm flex items-start gap-2 rounded-sm font-medium">
              <span className="mt-0.5">⚠</span> {errorMsg}
            </div>
          )}

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
