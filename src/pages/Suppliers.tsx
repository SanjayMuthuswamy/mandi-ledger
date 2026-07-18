import { useState } from "react"
import { StampHeader } from "@/components/ui/StampHeader"
import { Button } from "@/components/ui/Button"
import { Drawer } from "@/components/ui/Drawer"
import { Input } from "@/components/ui/Input"
import { useSuppliers, useSupplierDetails } from "@/data/useSuppliers"
import { useAuth } from "@/contexts/AuthContext"
import { Truck, Phone, MapPin, Plus, Loader2, Download } from "lucide-react"

export function Suppliers() {
  const { suppliers, isLoading, addSupplier, deleteSupplier, updateSupplier } = useSuppliers(1, 100)
  const { user } = useAuth()
  
  const [view, setView] = useState<'cards' | 'list'>('cards')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null)
  const [supplierToEdit, setSupplierToEdit] = useState<any>(null)

  const { supplier: supplierDetails, isLoading: isDetailsLoading } = useSupplierDetails(selectedSupplier)

  const [errorMsg, setErrorMsg] = useState('')

  const handleAddSupplier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg('')
    const formData = new FormData(e.currentTarget)
    
    try {
      const data = {
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        address: formData.get('location') as string,
        gstNumber: formData.get('gstin') as string,
      }
      
      if (supplierToEdit) {
        await updateSupplier(supplierToEdit.id, data)
      } else {
        await addSupplier(data)
      }
      
      setIsDrawerOpen(false)
      setSupplierToEdit(null)
    } catch (err: any) {
      let msg = err.data?.error || "Failed to add supplier."
      if (err.data?.issues) {
         const issuesStr = Object.entries(err.data.issues)
            .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
            .join(' | ')
         msg += ` (${issuesStr})`
      }
      setErrorMsg(msg)
    }
  }

  const handleDeleteSupplier = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (user?.role !== 'ADMIN') {
      alert("Access Denied: Only Administrators can delete suppliers.")
      return
    }
    const confirmed = window.confirm("Are you sure you want to delete this supplier? This action cannot be undone.")
    if (confirmed) {
      deleteSupplier(id).then(() => {
        if (selectedSupplier === id) setSelectedSupplier(null)
      })
    }
  }

  const handleDownloadPDF = () => {
    if (!supplierDetails) return
    window.open(`/invoice.html?supplierId=${supplierDetails.id}`, '_blank')
  }

  if (selectedSupplier) {
    return (
      <div className="flex flex-col gap-8 pb-12">
        <div>
          <Button variant="ghost" className="mb-4 text-ink/60 -ml-4" onClick={() => setSelectedSupplier(null)}>
            ← Back to Suppliers
          </Button>
          {isDetailsLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="animate-spin text-turmeric w-8 h-8" />
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 bg-[#F8F9F3] p-6 border border-brass/35 rounded-sm shadow-[2px_2px_0px_0px_rgba(20,32,26,0.02)]">
                <div className="space-y-3">
                  <StampHeader title={supplierDetails?.name || ''} className="mb-2" />
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 font-mono text-xs md:text-sm text-ink/70">
                    <span className="flex items-center gap-1"><Phone size={14} className="shrink-0" /> {supplierDetails?.phone || 'N/A'}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} className="shrink-0" /> {supplierDetails?.address || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end md:text-right gap-1 border-t md:border-t-0 border-brass/15 pt-4 md:pt-0">
                  <div className="text-[10px] uppercase tracking-wider text-ink/50 font-sans font-medium mb-2">Total Value Supplied</div>
                  <div className="font-mono text-2xl font-bold text-ink">₹{(supplierDetails?.purchases?.reduce((acc: number, p: any) => acc + p.totalAmount, 0) || 0).toLocaleString()}</div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="ghost" className="h-7 px-3 text-xs border border-brass/30 hover:bg-ink/5 flex items-center gap-1.5" onClick={handleDownloadPDF}>
                      <Download size={13} /> DOWNLOAD REPORT
                    </Button>
                    <Button variant="ghost" className="h-7 px-3 text-xs border border-brass/30 hover:bg-ink/5" onClick={() => { setSupplierToEdit(supplierDetails); setIsDrawerOpen(true); }}>EDIT</Button>
                    <Button variant="ghost" className="h-7 px-3 text-xs border border-ledger-red/30 text-ledger-red hover:bg-ledger-red/10" onClick={() => handleDeleteSupplier(supplierDetails.id)}>DELETE</Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {supplierDetails && !isDetailsLoading && (
          <div className="bg-stone-light border border-brass/30 shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)] overflow-hidden mt-4">
            <div className="bg-ink/5 p-4 border-b border-brass/20 font-display uppercase tracking-wider text-ink/80 text-sm">
              Purchase History
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead className="border-b border-brass/30 font-display uppercase tracking-wider text-ink/70 text-xs">
                  <tr>
                    <th className="p-4">Entry No.</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Variety</th>
                    <th className="p-4 text-right">Quantity (kg)</th>
                    <th className="p-4 text-right">Rate (₹)</th>
                    <th className="p-4 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brass/10 font-mono">
                  {supplierDetails.purchases?.map((p: any) => (
                    <tr key={p.id} className="hover:bg-ink/5 transition-colors">
                      <td className="p-4 text-ink/60">{p.entryNo}</td>
                      <td className="p-4">{p.purchaseDate.split('T')[0]}</td>
                      <td className="p-4 font-sans font-medium text-ink flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full bg-variety-${p.items[0]?.variety?.code}`} />
                        {p.items[0]?.variety?.name}
                      </td>
                      <td className="p-4 text-right">{p.items[0]?.quantity.toLocaleString()}</td>
                      <td className="p-4 text-right">₹{p.items[0]?.rate.toFixed(2)}</td>
                      <td className="p-4 text-right">₹{p.totalAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                  {!supplierDetails.purchases?.length && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-ink/50 font-sans">No purchases found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Drawer isOpen={isDrawerOpen} onClose={() => { setIsDrawerOpen(false); setSupplierToEdit(null); }} title={supplierToEdit ? "Edit Supplier" : "Add Supplier"}>
          <form onSubmit={handleAddSupplier} className="flex flex-col gap-6">
            {errorMsg && (
              <div className="bg-ledger-red/10 border border-ledger-red/30 p-3 text-ledger-red text-sm font-sans rounded-sm shadow-sm">
                {errorMsg}
              </div>
            )}
            <div className="space-y-2">
              <label className="font-medium text-sm">Supplier Name</label>
              <Input name="name" defaultValue={supplierToEdit?.name} placeholder="e.g. Rajesh Traders" required />
            </div>
            <div className="space-y-2">
              <label className="font-medium text-sm">Phone Number</label>
              <Input name="phone" type="tel" defaultValue={supplierToEdit?.phone} placeholder="+91 " required />
            </div>
            <div className="space-y-2">
              <label className="font-medium text-sm">Location / City</label>
              <Input name="location" defaultValue={supplierToEdit?.address} placeholder="e.g. Tiruppur" required />
            </div>
            <div className="space-y-2">
              <label className="font-medium text-sm">GSTIN (Optional)</label>
              <Input name="gstin" defaultValue={supplierToEdit?.gstNumber} placeholder="22AAAAA0000A1Z5" />
            </div>
            <div className="pt-4 border-t border-brass/20">
              <Button type="submit" className="w-full">{supplierToEdit ? "Update Supplier" : "Register Supplier"}</Button>
            </div>
          </form>
        </Drawer>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-start">
        <StampHeader title="Suppliers Ledger" />
        <div className="flex gap-4">
          <div className="flex bg-stone border border-brass/50 rounded-sm overflow-hidden p-0.5 shadow-[2px_2px_0px_0px_rgba(140,111,62,0.2)] mr-2">
            <button 
              className={`px-4 py-1 text-sm font-medium transition-colors ${view === 'cards' ? 'bg-ink text-stone' : 'hover:bg-ink/5 text-ink'}`}
              onClick={() => setView('cards')}
            >
              Cards
            </button>
            <button 
              className={`px-4 py-1 text-sm font-medium transition-colors ${view === 'list' ? 'bg-ink text-stone' : 'hover:bg-ink/5 text-ink'}`}
              onClick={() => setView('list')}
            >
              List
            </button>
          </div>
          <Button onClick={() => { setSupplierToEdit(null); setIsDrawerOpen(true); }} className="hidden md:flex">Add Supplier</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-turmeric w-8 h-8" />
        </div>
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map(supplier => (
            <div 
              key={supplier.id} 
              className="bg-stone-light p-6 border border-brass/30 shadow-[4px_4px_0px_0px_rgba(20,32,26,0.05)] cursor-pointer hover:border-brass hover:shadow-[4px_4px_0px_0px_rgba(140,111,62,0.3)] transition-all group"
              onClick={() => setSelectedSupplier(supplier.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-ink/5 rounded-full flex items-center justify-center text-ink/50 group-hover:bg-turmeric/20 group-hover:text-turmeric transition-colors">
                  <Truck size={20} />
                </div>
              </div>
              <h3 className="font-display text-lg text-ink tracking-tight mb-2">{supplier.name}</h3>
              <div className="space-y-1 mb-6 font-mono text-xs text-ink/70">
                <div className="flex items-center gap-2"><Phone size={12} /> {supplier.phone || 'N/A'}</div>
                <div className="flex items-center gap-2"><MapPin size={12} /> {supplier.address || 'N/A'}</div>
              </div>
              <div className="border-t border-brass/20 pt-4 flex justify-between items-center">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-ink/50 font-sans font-semibold">Total Purchases</div>
                  <div className="font-mono text-ink font-medium">{supplier._count?.purchases || 0}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-stone-light border border-brass/30 shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead className="border-b border-brass/30 font-display uppercase tracking-wider text-ink/70 bg-ink/5">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 text-right">Purchases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brass/10 font-mono">
                {suppliers.map((supplier) => (
                  <tr 
                    key={supplier.id} 
                    className="hover:bg-ink/5 transition-colors cursor-pointer group"
                    onClick={() => setSelectedSupplier(supplier.id)}
                  >
                    <td className="p-4 font-sans font-medium text-ink">{supplier.name}</td>
                    <td className="p-4 text-ink/80">{supplier.phone || '-'}</td>
                    <td className="p-4 text-ink/80">{supplier.address || '-'}</td>
                    <td className="p-4 text-right font-medium text-ink">{supplier._count?.purchases || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button 
        className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-turmeric text-ink rounded-full shadow-[2px_2px_0px_0px_rgba(20,32,26,1)] flex items-center justify-center z-30"
        onClick={() => { setSupplierToEdit(null); setIsDrawerOpen(true); }}
      >
        <Plus size={24} />
      </button>

      <Drawer isOpen={isDrawerOpen} onClose={() => { setIsDrawerOpen(false); setSupplierToEdit(null); }} title={supplierToEdit ? "Edit Supplier" : "Add Supplier"}>
        <form onSubmit={handleAddSupplier} className="flex flex-col gap-6">
          {errorMsg && (
            <div className="bg-ledger-red/10 border border-ledger-red/30 p-3 text-ledger-red text-sm font-sans rounded-sm shadow-sm">
              {errorMsg}
            </div>
          )}
          <div className="space-y-2">
            <label className="font-medium text-sm">Supplier Name</label>
            <Input name="name" defaultValue={supplierToEdit?.name} placeholder="e.g. Rajesh Traders" required />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-sm">Phone Number</label>
            <Input name="phone" type="tel" defaultValue={supplierToEdit?.phone} placeholder="+91 " required />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-sm">Location / City</label>
            <Input name="location" defaultValue={supplierToEdit?.address} placeholder="e.g. Tiruppur" required />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-sm">GSTIN (Optional)</label>
            <Input name="gstin" defaultValue={supplierToEdit?.gstNumber} placeholder="22AAAAA0000A1Z5" />
          </div>
          <div className="pt-4 border-t border-brass/20">
            <Button type="submit" className="w-full">{supplierToEdit ? "Update Supplier" : "Register Supplier"}</Button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
