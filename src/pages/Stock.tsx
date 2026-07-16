import { useState } from "react"
import { StampHeader } from "@/components/ui/StampHeader"
import { type VarietyId, useStock } from "@/data/useStock"
import { GrainGauge } from "@/components/ui/GrainGauge"
import { Button } from "@/components/ui/Button"
import { Drawer } from "@/components/ui/Drawer"
import { Input } from "@/components/ui/Input"
import { useAuth } from "@/contexts/AuthContext"
import { Plus } from "lucide-react"

export function Stock() {
  const { stock, isLoading, deleteStock, addStock } = useStock()
  const { user } = useAuth()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleAddStock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg('')
    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      await addStock({
        varietyName: String(formData.get("varietyName")),
        varietyId: formData.get("varietyId") as VarietyId,
        quantity: Number(formData.get("quantity")),
        price: Number(formData.get("price")),
        threshold: Number(formData.get("threshold") || 0),
        max: Number(formData.get("max") || 10000),
      })

      form.reset()
      setIsDrawerOpen(false)
    } catch (err: any) {
      let msg = err.data?.error || err.message || "Failed to add stock. Please try again."
      if (err.data?.issues) {
         const issuesStr = Object.entries(err.data.issues)
            .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
            .join(' | ')
         msg += ` (${issuesStr})`
      }
      setErrorMsg(msg)
    }
  }

  const handleDeleteStock = (id: string) => {
    if (user?.role !== 'ADMIN') {
      alert("Access Denied: Only Administrators can delete stock entries.")
      return
    }
    const confirmed = window.confirm("Are you sure you want to delete this stock entry? This cannot be undone.")
    if (confirmed) {
      deleteStock(id)
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-start">
        <StampHeader title="Rice Stock" />
        <Button onClick={() => setIsDrawerOpen(true)} className="hidden md:flex">Add Stock</Button>
      </div>

      {isLoading && (
        <div className="font-mono text-sm text-ink/60">Loading stock ledger...</div>
      )}

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
                </div>
                <Button variant="ghost" className="h-8 px-2 text-xs text-ledger-red" onClick={() => handleDeleteStock(item.id)}>DELETE</Button>
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
                  <Button variant="ghost" className="h-8 px-2 text-xs text-ledger-red hover:text-ledger-red hover:bg-ledger-red/10" onClick={() => handleDeleteStock(item.id)}>DELETE</Button>
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

      <Drawer isOpen={isDrawerOpen} onClose={() => {setIsDrawerOpen(false); setErrorMsg('');}} title="Add Stock">
        <form onSubmit={handleAddStock} className="flex flex-col gap-6">
          {errorMsg && (
            <div className="bg-ledger-red/10 border border-ledger-red/30 p-3 text-ledger-red text-sm flex items-start gap-2 rounded-sm font-medium">
              <span className="mt-0.5">⚠</span> {errorMsg}
            </div>
          )}
          <div className="space-y-2">
            <label className="font-medium text-sm">Rice Variety Name</label>
            <Input name="varietyName" placeholder="e.g. Sona Masuri" required />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-sm">Variety Type</label>
            <select name="varietyId" className="flex h-10 w-full border border-brass/50 bg-stone/50 px-3 py-2 text-sm text-ink ring-offset-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turmeric" required>
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
            <Input name="quantity" type="number" min="0" placeholder="0" required />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-sm">Unit Price (₹/kg)</label>
            <Input name="price" type="number" min="0" placeholder="0" required />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-sm">Alert Threshold (kg)</label>
            <Input name="threshold" type="number" min="0" placeholder="0" required />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-sm">Storage Capacity (kg)</label>
            <Input name="max" type="number" min="1" placeholder="10000" required />
          </div>
          <div className="pt-4 border-t border-brass/20">
            <Button type="submit" className="w-full">Add Stock</Button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
