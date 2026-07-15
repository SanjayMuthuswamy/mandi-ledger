import { useState, useMemo } from "react"
import { StampHeader } from "@/components/ui/StampHeader"
import { Button } from "@/components/ui/Button"
import { Drawer } from "@/components/ui/Drawer"
import { Input } from "@/components/ui/Input"
import { useSales } from "@/data/useSales"
import { useVarieties } from "@/data/useVarieties"
import { useCustomers } from "@/data/useCustomers"
import { Plus, ShoppingCart, Loader2 } from "lucide-react"

export function Sales() {
  const { sales, isLoading: isSalesLoading, addSale, deleteSale } = useSales(1, 100)
  const { varieties, isLoading: isVarietiesLoading } = useVarieties()
  const { customers, isLoading: isCustomersLoading } = useCustomers(1, 100)
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedVariety, setSelectedVariety] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState<'kg' | 'quintal' | 'ton'>('kg')
  const [rate, setRate] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    
    let actualKg = Number(quantity)
    if (unit === 'quintal') actualKg *= 100
    if (unit === 'ton') actualKg *= 1000

    const variety = varieties.find(v => v.id === selectedVariety)
    
    if (variety) {
      // Basic client-side validation using the variety's aggregated stock quantity
      // A more robust check might involve the specific warehouse stock
      const totalStock = variety.stocks?.reduce((sum, s) => sum + s.quantity, 0) || 0
      if (actualKg > totalStock) {
        setErrorMsg(`Insufficient stock. Current stock for ${variety.name} is only ${totalStock.toLocaleString()} kg.`)
        return
      }

      try {
        await addSale({
          customerId: selectedCustomer,
          saleDate: new Date().toISOString(),
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
        let msg = err.data?.error || "Failed to record sale. Please try again."
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

  const handleVoidSale = (id: string) => {
    const pwd = window.prompt("Admin action required. Please enter password to void this sale:")
    if (pwd === "Admin@1234") {
      deleteSale(id)
    } else if (pwd !== null) {
      alert("Incorrect password. Action denied.")
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
        <StampHeader title="Sales Ledger" />
        <Button onClick={() => setIsDrawerOpen(true)} className="hidden md:flex">Record Sale</Button>
      </div>

      {(isSalesLoading || isVarietiesLoading || isCustomersLoading) ? (
         <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-turmeric w-8 h-8" />
        </div>
      ) : (
        <div className="bg-stone-light md:border md:border-brass/30 md:shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)] overflow-hidden">
          <div className="md:hidden flex flex-col gap-4 bg-stone pb-4">
            {sales.map(sale => (
              <div key={sale.id} className="bg-stone-light border border-brass/30 p-4 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start border-b border-brass/10 pb-2">
                  <div>
                    <div className="text-ink font-bold font-mono">{sale.invoiceNo}</div>
                    <div className="text-xs text-ink/70 font-mono mt-0.5">{sale.saleDate.split('T')[0]}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg font-bold text-ink">₹{sale.totalAmount.toLocaleString()}</div>
                    <div className="text-xs text-ink/70 font-mono">₹{sale.items[0]?.rate.toFixed(2)}/kg</div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <div className="flex flex-col gap-1">
                    <div className="font-sans font-medium text-ink flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full bg-variety-${sale.items[0]?.variety?.code}`} />
                      {sale.items[0]?.variety?.name}
                    </div>
                    <div className="text-sm text-ink/80">{sale.customer?.name}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-ledger-red font-mono font-medium text-lg">
                      -{sale.items[0]?.quantity.toLocaleString()} <span className="text-xs">kg</span>
                    </div>
                    <Button variant="ghost" className="h-6 px-2 text-xs text-ledger-red hover:bg-ledger-red/10" onClick={() => handleVoidSale(sale.id)}>VOID</Button>
                  </div>
                </div>
              </div>
            ))}
            {sales.length === 0 && (
              <div className="p-8 text-center font-sans text-ink/70 border border-brass/30 bg-stone-light">
                No sales logged yet.
              </div>
            )}
          </div>

          <table className="hidden md:table w-full text-left text-sm border-collapse">
            <thead className="border-b-2 border-brass/30 font-display uppercase tracking-wider text-ink/70 bg-ink/5">
              <tr>
                <th className="p-4 w-24">Entry No.</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Variety</th>
                <th className="p-4 text-right">Quantity (kg)</th>
                <th className="p-4 text-right">Rate (₹)</th>
                <th className="p-4 text-right">Total (₹)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-brass/20 border-dotted hover:bg-ink/5 transition-colors even:bg-stone/30 font-mono">
                  <td className="p-4 text-ink font-bold">{sale.invoiceNo}</td>
                  <td className="p-4 text-ink/70">{sale.saleDate.split('T')[0]}</td>
                  <td className="p-4 font-sans text-ink">{sale.customer?.name}</td>
                  <td className="p-4 font-sans font-medium text-ink flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-variety-${sale.items[0]?.variety?.code}`} />
                    {sale.items[0]?.variety?.name}
                  </td>
                  <td className="p-4 text-right text-ledger-red font-medium">-{sale.items[0]?.quantity.toLocaleString()}</td>
                  <td className="p-4 text-right">{sale.items[0]?.rate.toFixed(2)}</td>
                  <td className="p-4 text-right font-medium text-ink">{sale.totalAmount.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" className="h-8 px-2 text-xs text-ledger-red hover:bg-ledger-red/10" onClick={() => handleVoidSale(sale.id)}>VOID</Button>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="p-16 flex flex-col items-center justify-center gap-4 text-ink/50 bg-[#F8F9F3]">
                      <ShoppingCart size={48} className="text-brass/20" />
                      <p className="font-sans">No sales recorded today. Create your first invoice.</p>
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

      <Drawer isOpen={isDrawerOpen} onClose={() => {setIsDrawerOpen(false); setErrorMsg('');}} title="Record Sale">
        <form onSubmit={handleRecordSale} className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="font-medium text-sm">Customer</label>
            <select 
              className="flex h-10 w-full border border-brass/50 bg-stone/50 px-3 py-2 text-sm text-ink ring-offset-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turmeric"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              required
            >
              <option value="" disabled>Select Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="font-medium text-sm flex justify-between">
              Rice Variety
              {selectedVarietyDetails && (
                <span className="text-xs font-mono text-ink/60">Stock: {(selectedVarietyDetails.stocks?.reduce((s, x) => s + x.quantity, 0) || 0).toLocaleString()} kg</span>
              )}
            </label>
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
                onChange={(e) => {setQuantity(e.target.value); setErrorMsg('');}} 
                placeholder="0" 
                required 
                className="font-mono pr-12"
              />
              <span className="absolute right-3 top-2.5 text-ink/50 text-sm font-mono">{unit}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm">Selling Rate (₹ per kg)</label>
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

          <div className="bg-ink/5 p-4 border border-brass/20 flex justify-between items-center mt-auto">
            <span className="text-sm font-medium uppercase tracking-wider text-ink/70">Total Amount</span>
            <span className="font-mono text-xl font-bold text-ink">₹{computedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="pt-4 border-t border-brass/20">
            <Button type="submit" className="w-full">Record Sale</Button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
