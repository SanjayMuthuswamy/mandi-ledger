import { useState } from "react"
import { StampHeader } from "@/components/ui/StampHeader"
import { Button } from "@/components/ui/Button"
import { Drawer } from "@/components/ui/Drawer"
import { Input } from "@/components/ui/Input"
import { User, Phone, MapPin, Plus } from "lucide-react"

export function Suppliers() {
  const [view, setView] = useState<'cards' | 'list'>('cards')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null)

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault()
    setIsDrawerOpen(false)
  }

  const suppliers = [
    { id: '1', name: 'Rajesh Traders', phone: '+91 98765 43210', location: 'Tiruppur', volume: 145000, varieties: ['ponni', 'idli'] },
    { id: '2', name: 'Sri Balaji Agro', phone: '+91 98765 43211', location: 'Kurnool', volume: 220000, varieties: ['sona'] },
    { id: '3', name: 'Punjab Rice Mills', phone: '+91 98765 43212', location: 'Karnal', volume: 310000, varieties: ['basmati', 'brown'] },
  ]

  if (selectedSupplier) {
    const supplier = suppliers.find(s => s.id === selectedSupplier)
    return (
      <div className="flex flex-col gap-8 pb-12">
        <div>
          <Button variant="ghost" className="mb-4 text-ink/60 -ml-4" onClick={() => setSelectedSupplier(null)}>
            ← Back to Suppliers
          </Button>
          <div className="flex justify-between items-end">
            <div>
              <StampHeader title={supplier?.name || ''} className="mb-2" />
              <div className="flex gap-4 font-mono text-sm text-ink/70">
                <span className="flex items-center gap-1"><Phone size={14} /> {supplier?.phone}</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> {supplier?.location}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-2xl text-ink">{supplier?.volume.toLocaleString()} <span className="text-sm text-ink/60">kg</span></div>
              <div className="text-xs uppercase tracking-wider text-ink/50 font-sans font-medium">Total Volume Supplied</div>
            </div>
          </div>
        </div>

        <div className="bg-stone-light border border-brass/30 shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)] overflow-hidden mt-4">
          <div className="bg-ink/5 p-4 border-b border-brass/20 font-display uppercase tracking-wider text-ink/80 text-sm">
            Purchase History
          </div>
          <table className="w-full text-left text-sm">
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
              <tr className="hover:bg-ink/5 transition-colors">
                <td className="p-4 text-ink/60">P-1042</td>
                <td className="p-4">2026-07-12</td>
                <td className="p-4 font-sans font-medium text-ink flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-variety-${supplier?.varieties[0]}`} />
                  Premium Delivery
                </td>
                <td className="p-4 text-right">4,500</td>
                <td className="p-4 text-right">42.50</td>
                <td className="p-4 text-right">{(4500 * 42.5).toLocaleString()}</td>
              </tr>
              <tr className="hover:bg-ink/5 transition-colors">
                <td className="p-4 text-ink/60">P-1028</td>
                <td className="p-4">2026-07-01</td>
                <td className="p-4 font-sans font-medium text-ink flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-variety-${supplier?.varieties[0]}`} />
                  Standard Delivery
                </td>
                <td className="p-4 text-right">10,000</td>
                <td className="p-4 text-right">41.00</td>
                <td className="p-4 text-right">{(10000 * 41).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
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
          <Button onClick={() => setIsDrawerOpen(true)} className="hidden md:flex">Add Supplier</Button>
        </div>
      </div>

      {view === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map(supplier => (
            <div 
              key={supplier.id} 
              className="bg-stone-light p-6 border border-brass/30 shadow-[4px_4px_0px_0px_rgba(20,32,26,0.05)] cursor-pointer hover:border-brass hover:shadow-[4px_4px_0px_0px_rgba(140,111,62,0.3)] transition-all group"
              onClick={() => setSelectedSupplier(supplier.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-ink/5 rounded-full flex items-center justify-center text-ink/50 group-hover:bg-turmeric/20 group-hover:text-turmeric transition-colors">
                  <User size={20} />
                </div>
                <div className="flex gap-1">
                  {supplier.varieties.map(v => (
                    <div key={v} className={`w-3 h-3 rounded-full bg-variety-${v} border border-ink/10`} title={v} />
                  ))}
                </div>
              </div>
              <h3 className="font-display text-lg text-ink tracking-tight mb-2">{supplier.name}</h3>
              <div className="space-y-1 mb-6 font-mono text-xs text-ink/70">
                <div className="flex items-center gap-2"><Phone size={12} /> {supplier.phone}</div>
                <div className="flex items-center gap-2"><MapPin size={12} /> {supplier.location}</div>
              </div>
              <div className="border-t border-brass/20 pt-4 flex justify-between items-end">
                <div className="text-[10px] uppercase tracking-widest text-ink/50 font-sans font-semibold">Total Volume</div>
                <div className="font-mono text-ink font-medium">{supplier.volume.toLocaleString()} kg</div>
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
                <th className="p-4">Varieties</th>
                <th className="p-4 text-right">Total Volume</th>
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
                  <td className="p-4 text-ink/80">{supplier.phone}</td>
                  <td className="p-4 text-ink/80">{supplier.location}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {supplier.varieties.map(v => (
                        <div key={v} className={`w-3 h-3 rounded-full bg-variety-${v} border border-ink/10`} title={v} />
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right font-medium text-ink">{supplier.volume.toLocaleString()} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile FAB */}
      <button 
        className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-turmeric text-ink rounded-full shadow-[2px_2px_0px_0px_rgba(20,32,26,1)] flex items-center justify-center z-30"
        onClick={() => setIsDrawerOpen(true)}
      >
        <Plus size={24} />
      </button>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Add Supplier">
        <form onSubmit={handleAddSupplier} className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="font-medium text-sm">Supplier Name</label>
            <Input placeholder="e.g. Rajesh Traders" required />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-sm">Phone Number</label>
            <Input type="tel" placeholder="+91 " required />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-sm">Location / City</label>
            <Input placeholder="e.g. Tiruppur" required />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-sm">GSTIN (Optional)</label>
            <Input placeholder="22AAAAA0000A1Z5" />
          </div>
          <div className="pt-4 border-t border-brass/20">
            <Button type="submit" className="w-full">Register Supplier</Button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
