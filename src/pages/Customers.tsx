import { useState } from "react"
import { StampHeader } from "@/components/ui/StampHeader"
import { Button } from "@/components/ui/Button"
import { Drawer } from "@/components/ui/Drawer"
import { Input } from "@/components/ui/Input"
import { useCustomers, useCustomerDetails } from "@/data/useCustomers"
import { useAuth } from "@/contexts/AuthContext"
import { User, Phone, MapPin, Plus, Loader2 } from "lucide-react"

export function Customers() {
  const { customers, isLoading, addCustomer, deleteCustomer, updateCustomer } = useCustomers(1, 100)
  const { user } = useAuth()
  const [view, setView] = useState<'cards' | 'list'>('cards')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [customerToEdit, setCustomerToEdit] = useState<any>(null)

  const { customer: customerDetails, isLoading: isDetailsLoading } = useCustomerDetails(selectedCustomer)

  const [errorMsg, setErrorMsg] = useState('')

  const handleAddCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
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
      
      if (customerToEdit) {
        await updateCustomer(customerToEdit.id, data)
      } else {
        await addCustomer(data)
      }
      
      setIsDrawerOpen(false)
      setCustomerToEdit(null)
    } catch (err: any) {
      let msg = err.data?.error || "Failed to add customer."
      if (err.data?.issues) {
         const issuesStr = Object.entries(err.data.issues)
            .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
            .join(' | ')
         msg += ` (${issuesStr})`
      }
      setErrorMsg(msg)
    }
  }

  const handleDeleteCustomer = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (user?.role !== 'ADMIN') {
      alert("Access Denied: Only Administrators can delete customers.")
      return
    }
    const confirmed = window.confirm("Are you sure you want to delete this customer? This action cannot be undone.")
    if (confirmed) {
      deleteCustomer(id).then(() => {
        if (selectedCustomer === id) setSelectedCustomer(null)
      })
    }
  }

  if (selectedCustomer) {
    return (
      <div className="flex flex-col gap-8 pb-12">
        <div>
          <Button variant="ghost" className="mb-4 text-ink/60 -ml-4" onClick={() => setSelectedCustomer(null)}>
            ← Back to Customers
          </Button>
          {isDetailsLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="animate-spin text-turmeric w-8 h-8" />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-end">
                <div>
                  <StampHeader title={customerDetails?.name || ''} className="mb-2" />
                  <div className="flex gap-4 font-mono text-sm text-ink/70">
                    <span className="flex items-center gap-1"><Phone size={14} /> {customerDetails?.phone || 'N/A'}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {customerDetails?.address || 'N/A'}</span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="font-mono text-2xl text-ink">{(customerDetails?.sales?.reduce((acc: number, s: any) => acc + s.totalAmount, 0) || 0).toLocaleString()} <span className="text-sm text-ink/60">₹</span></div>
                  <div className="text-xs uppercase tracking-wider text-ink/50 font-sans font-medium mb-2">Total Value Purchased</div>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="h-6 px-2 text-xs text-ink hover:bg-ink/10" onClick={() => { setCustomerToEdit(customerDetails); setIsDrawerOpen(true); }}>EDIT</Button>
                    <Button variant="ghost" className="h-6 px-2 text-xs text-ledger-red hover:bg-ledger-red/10" onClick={() => handleDeleteCustomer(customerDetails.id)}>DELETE</Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {customerDetails && !isDetailsLoading && (
          <div className="bg-stone-light border border-brass/30 shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)] overflow-hidden mt-4">
            <div className="bg-ink/5 p-4 border-b border-brass/20 font-display uppercase tracking-wider text-ink/80 text-sm">
              Sales History
            </div>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-brass/30 font-display uppercase tracking-wider text-ink/70 text-xs">
                <tr>
                  <th className="p-4">Invoice No.</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Variety</th>
                  <th className="p-4 text-right">Quantity (kg)</th>
                  <th className="p-4 text-right">Rate (₹)</th>
                  <th className="p-4 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brass/10 font-mono">
                {customerDetails.sales?.map((s: any) => (
                  <tr key={s.id} className="hover:bg-ink/5 transition-colors">
                    <td className="p-4 text-ink/60">{s.invoiceNo}</td>
                    <td className="p-4">{s.saleDate.split('T')[0]}</td>
                    <td className="p-4 font-sans font-medium text-ink flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-variety-${s.items[0]?.variety?.code}`} />
                      {s.items[0]?.variety?.name}
                    </td>
                    <td className="p-4 text-right">{s.items[0]?.quantity.toLocaleString()}</td>
                    <td className="p-4 text-right">{s.items[0]?.rate.toFixed(2)}</td>
                    <td className="p-4 text-right">{s.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
                {!customerDetails.sales?.length && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-ink/50">No sales found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-start">
        <StampHeader title="Customers Ledger" />
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
          <Button onClick={() => { setCustomerToEdit(null); setIsDrawerOpen(true); }} className="hidden md:flex">Add Customer</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-turmeric w-8 h-8" />
        </div>
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map(customer => (
            <div 
              key={customer.id} 
              className="bg-stone-light p-6 border border-brass/30 shadow-[4px_4px_0px_0px_rgba(20,32,26,0.05)] cursor-pointer hover:border-brass hover:shadow-[4px_4px_0px_0px_rgba(140,111,62,0.3)] transition-all group"
              onClick={() => setSelectedCustomer(customer.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-ink/5 rounded-full flex items-center justify-center text-ink/50 group-hover:bg-turmeric/20 group-hover:text-turmeric transition-colors">
                  <User size={20} />
                </div>
              </div>
              <h3 className="font-display text-lg text-ink tracking-tight mb-2">{customer.name}</h3>
              <div className="space-y-1 mb-6 font-mono text-xs text-ink/70">
                <div className="flex items-center gap-2"><Phone size={12} /> {customer.phone || 'N/A'}</div>
                <div className="flex items-center gap-2"><MapPin size={12} /> {customer.address || 'N/A'}</div>
              </div>
              <div className="border-t border-brass/20 pt-4 flex justify-between items-center">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-ink/50 font-sans font-semibold">Total Sales</div>
                  <div className="font-mono text-ink font-medium">{customer._count?.sales || 0}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-stone-light border border-brass/30 shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)] overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-brass/30 font-display uppercase tracking-wider text-ink/70 bg-ink/5">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Location</th>
                <th className="p-4 text-right">Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brass/10 font-mono">
              {customers.map((customer) => (
                <tr 
                  key={customer.id} 
                  className="hover:bg-ink/5 transition-colors cursor-pointer group"
                  onClick={() => setSelectedCustomer(customer.id)}
                >
                  <td className="p-4 font-sans font-medium text-ink">{customer.name}</td>
                  <td className="p-4 text-ink/80">{customer.phone || '-'}</td>
                  <td className="p-4 text-ink/80">{customer.address || '-'}</td>
                  <td className="p-4 text-right font-medium text-ink">{customer._count?.sales || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button 
        className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-turmeric text-ink rounded-full shadow-[2px_2px_0px_0px_rgba(20,32,26,1)] flex items-center justify-center z-30"
        onClick={() => { setCustomerToEdit(null); setIsDrawerOpen(true); }}
      >
        <Plus size={24} />
      </button>

      <Drawer isOpen={isDrawerOpen} onClose={() => { setIsDrawerOpen(false); setCustomerToEdit(null); }} title={customerToEdit ? "Edit Customer" : "Add Customer"}>
        <form onSubmit={handleAddCustomer} className="flex flex-col gap-6">
          {errorMsg && (
            <div className="bg-ledger-red/10 border border-ledger-red/30 p-3 text-ledger-red text-sm font-sans rounded-sm shadow-sm">
              {errorMsg}
            </div>
          )}
          <div className="space-y-2">
            <label className="font-medium text-sm">Customer Name</label>
            <Input name="name" defaultValue={customerToEdit?.name} placeholder="e.g. Ramesh Kumar" required />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-sm">Phone Number</label>
            <Input name="phone" type="tel" defaultValue={customerToEdit?.phone} placeholder="+91 " required />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-sm">Location / City</label>
            <Input name="location" defaultValue={customerToEdit?.address} placeholder="e.g. Chennai" required />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-sm">GSTIN (Optional)</label>
            <Input name="gstin" defaultValue={customerToEdit?.gstNumber} placeholder="22AAAAA0000A1Z5" />
          </div>
          <div className="pt-4 border-t border-brass/20">
            <Button type="submit" className="w-full">{customerToEdit ? "Update Customer" : "Register Customer"}</Button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
