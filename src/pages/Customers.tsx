import { useState } from "react"
import { StampHeader } from "@/components/ui/StampHeader"
import { Button } from "@/components/ui/Button"
import { Drawer } from "@/components/ui/Drawer"
import { DetailDrawer, DetailRow, DrawerSection, DrawerActionBar } from "@/components/ui/DetailDrawer"
import { Input } from "@/components/ui/Input"
import { useCustomers, useCustomerDetails } from "@/data/useCustomers"
import { useAuth } from "@/contexts/AuthContext"
import { User, Phone, MapPin, Plus, Loader2 } from "lucide-react"

function CustomerDetailDrawer({ customerId, onClose, onEdit, onDelete }: {
  customerId: string | null
  onClose: () => void
  onEdit: (c: any) => void
  onDelete: (id: string) => void
}) {
  const { customer, isLoading } = useCustomerDetails(customerId)

  const totalRevenue = customer?.sales?.reduce((acc: number, s: any) => acc + s.totalAmount, 0) || 0
  const totalOrders = customer?.sales?.length || 0

  return (
    <DetailDrawer
      isOpen={!!customerId}
      onClose={onClose}
      title={customer?.name || "Customer Profile"}
      subtitle={customer?.phone || customer?.address || undefined}
      actions={<DrawerActionBar onPrint={() => window.print()} />}
    >
      {isLoading ? (
        <div className="flex justify-center p-16">
          <Loader2 className="animate-spin text-turmeric w-8 h-8" />
        </div>
      ) : customer ? (
        <div className="divide-y divide-brass/15">

          {/* Profile */}
          <DrawerSection title="Customer Profile">
            <DetailRow label="Full Name" value={customer.name} />
            <DetailRow label="Phone" value={customer.phone || '—'} />
            <DetailRow label="Address" value={customer.address || '—'} />
            <DetailRow label="Email" value={customer.email || '—'} />
            <DetailRow label="GSTIN" value={<span className="font-mono text-xs">{customer.gstNumber || '—'}</span>} />
          </DrawerSection>

          {/* Summary Stats */}
          <DrawerSection title="Account Summary">
            <div className="grid grid-cols-2 gap-3 mb-1">
              <div className="bg-ink/5 border border-brass/20 p-3 rounded-sm">
                <div className="text-[10px] uppercase tracking-widest text-ink/50 font-sans font-semibold">Total Orders</div>
                <div className="font-mono text-xl font-bold text-ink mt-1">{totalOrders}</div>
              </div>
              <div className="bg-ink/5 border border-brass/20 p-3 rounded-sm">
                <div className="text-[10px] uppercase tracking-widest text-ink/50 font-sans font-semibold">Total Value</div>
                <div className="font-mono text-xl font-bold text-paddy mt-1">₹{totalRevenue.toLocaleString()}</div>
              </div>
            </div>
          </DrawerSection>

          {/* Purchase History */}
          <DrawerSection title="Sales History">
            {customer.sales?.length > 0 ? (
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full text-xs font-mono border-collapse min-w-[420px]">
                  <thead>
                    <tr className="border-b border-brass/20 text-ink/50 uppercase text-[10px] tracking-wider">
                      <th className="py-2 text-left font-sans">Invoice</th>
                      <th className="py-2 text-left font-sans">Date</th>
                      <th className="py-2 text-left font-sans">Variety</th>
                      <th className="py-2 text-right font-sans">Qty</th>
                      <th className="py-2 text-right font-sans">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brass/10">
                    {customer.sales.map((s: any) => (
                      <tr key={s.id} className="hover:bg-ink/5">
                        <td className="py-2 text-ink/60">{s.invoiceNo}</td>
                        <td className="py-2">{s.saleDate?.split('T')[0]}</td>
                        <td className="py-2 font-sans text-ink">{s.items?.[0]?.variety?.name}</td>
                        <td className="py-2 text-right">{s.items?.[0]?.quantity} bags</td>
                        <td className="py-2 text-right font-bold text-paddy">₹{s.totalAmount?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-ink/40 font-sans">No sales found for this customer.</p>
            )}
          </DrawerSection>

          {/* Actions */}
          <DrawerSection title="Actions">
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1 border border-brass/30 text-xs" onClick={() => onEdit(customer)}>
                Edit Customer
              </Button>
              <Button variant="ghost" className="flex-1 border border-ledger-red/30 text-xs text-ledger-red hover:bg-ledger-red/10" onClick={() => { onDelete(customer.id); onClose(); }}>
                Delete Customer
              </Button>
            </div>
          </DrawerSection>

        </div>
      ) : (
        <div className="p-8 text-center text-ink/50 font-sans">Customer not found.</div>
      )}
    </DetailDrawer>
  )
}

export function Customers() {
  const { customers, isLoading, addCustomer, deleteCustomer, updateCustomer } = useCustomers(1, 100)
  const { user } = useAuth()
  const [view, setView] = useState<'cards' | 'list'>('cards')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [customerToEdit, setCustomerToEdit] = useState<any>(null)
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
        if (selectedCustomerId === id) setSelectedCustomerId(null)
      })
    }
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
              onClick={() => setSelectedCustomerId(customer.id)}
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
                  onClick={() => setSelectedCustomerId(customer.id)}
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

      {/* Add/Edit Drawer */}
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

      {/* Customer Detail Drawer */}
      <CustomerDetailDrawer
        customerId={selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
        onEdit={(c) => { setCustomerToEdit(c); setSelectedCustomerId(null); setIsDrawerOpen(true); }}
        onDelete={handleDeleteCustomer}
      />
    </div>
  )
}
