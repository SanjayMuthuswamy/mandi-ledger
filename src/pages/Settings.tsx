import { useState } from "react"
import { StampHeader } from "@/components/ui/StampHeader"
import { Button } from "@/components/ui/Button"
import { Drawer } from "@/components/ui/Drawer"
import { Input } from "@/components/ui/Input"
import { useUsers } from "@/data/useUsers"
import { useWarehouses } from "@/data/useWarehouses"
import { useVarieties } from "@/data/useVarieties"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2, ShieldAlert, Package, Wheat } from "lucide-react"

export function Settings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'users' | 'warehouses' | 'varieties'>('varieties')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const { users, isLoading: usersLoading, addUser, deleteUser } = useUsers()
  const { warehouses, isLoading: warehousesLoading, addWarehouse, deleteWarehouse } = useWarehouses()
  const { varieties, isLoading: varietiesLoading, addVariety, deleteVariety } = useVarieties()

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg('')
    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      if (activeTab === 'users') {
        await addUser({
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          email: formData.get('email'),
          password: formData.get('password'),
          roleName: formData.get('roleName') || 'Accountant',
        })
      } else if (activeTab === 'warehouses') {
        await addWarehouse({
          name: formData.get('name'),
          location: formData.get('location'),
          capacity: Number(formData.get('capacity') || 0),
        })
      } else if (activeTab === 'varieties') {
        await addVariety({
          name: formData.get('name'),
          code: formData.get('code'),
          description: formData.get('description'),
          basePrice: Number(formData.get('basePrice') || 0),
        })
      }
      form.reset()
      setIsDrawerOpen(false)
    } catch (err: any) {
      let msg = err.data?.error || `Failed to add ${activeTab.slice(0, -1)}.`
      if (err.data?.issues) {
         const issuesStr = Object.entries(err.data.issues)
            .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
            .join(' | ')
         msg += ` (${issuesStr})`
      }
      setErrorMsg(msg)
    }
  }

  const handleDelete = (id: string) => {
    if (user?.role !== 'ADMIN') {
      alert(`Access Denied: Only Administrators can delete ${activeTab}.`)
      return
    }
    const confirmed = window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)
    if (confirmed) {
      if (activeTab === 'users') deleteUser(id)
      else if (activeTab === 'warehouses') deleteWarehouse(id)
      else if (activeTab === 'varieties') deleteVariety(id)
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-start">
        <StampHeader title="System Settings" />
        <Button className="hidden md:flex" onClick={() => setIsDrawerOpen(true)}>
          Add {activeTab === 'users' ? 'User' : activeTab === 'warehouses' ? 'Warehouse' : 'Variety'}
        </Button>
      </div>

      <div className="flex bg-stone border border-brass/50 rounded-sm overflow-x-auto hide-scrollbar p-0.5 shadow-[2px_2px_0px_0px_rgba(140,111,62,0.2)] max-w-full md:max-w-fit">
        <button 
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'varieties' ? 'bg-ink text-stone' : 'hover:bg-ink/5 text-ink'}`}
          onClick={() => setActiveTab('varieties')}
        >
          <Wheat size={16} /> Rice Varieties
        </button>
        <button 
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'users' ? 'bg-ink text-stone' : 'hover:bg-ink/5 text-ink'}`}
          onClick={() => setActiveTab('users')}
        >
          <ShieldAlert size={16} /> User Roles
        </button>
        <button 
          className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'warehouses' ? 'bg-ink text-stone' : 'hover:bg-ink/5 text-ink'}`}
          onClick={() => setActiveTab('warehouses')}
        >
          <Package size={16} /> Warehouses
        </button>
      </div>

      {activeTab === 'varieties' && (
        <div className="bg-stone-light border border-brass/30 shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)] overflow-x-auto">
          {varietiesLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="animate-spin text-turmeric w-8 h-8" /></div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-brass/30 font-display uppercase tracking-wider text-ink/70 bg-ink/5">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Code</th>
                  <th className="p-4 text-right">Base Price (₹)</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brass/10 font-mono">
                {varieties.map(v => (
                  <tr key={v.id} className="hover:bg-ink/5 transition-colors">
                    <td className="p-4 font-sans font-medium text-ink flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-variety-${v.code}`} />
                      {v.name}
                    </td>
                    <td className="p-4 text-ink/70">{v.code}</td>
                    <td className="p-4 text-right font-medium">{v.basePrice.toFixed(2)}</td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" className="h-8 px-2 text-xs text-ledger-red hover:bg-ledger-red/10" onClick={() => handleDelete(v.id)}>DELETE</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-stone-light border border-brass/30 shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)] overflow-x-auto">
          {usersLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="animate-spin text-turmeric w-8 h-8" /></div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-brass/30 font-display uppercase tracking-wider text-ink/70 bg-ink/5">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brass/10 font-mono">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-ink/5 transition-colors">
                    <td className="p-4 font-sans font-medium text-ink">{u.firstName} {u.lastName}</td>
                    <td className="p-4 text-ink/70">{u.email}</td>
                    <td className="p-4 font-sans text-ink/80">{u.role?.name || '-'}</td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" className="h-8 px-2 text-xs text-ledger-red hover:bg-ledger-red/10" onClick={() => handleDelete(u.id)}>DELETE</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'warehouses' && (
        <div className="bg-stone-light border border-brass/30 shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)] overflow-x-auto">
          {warehousesLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="animate-spin text-turmeric w-8 h-8" /></div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-brass/30 font-display uppercase tracking-wider text-ink/70 bg-ink/5">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 text-right">Capacity (kg)</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brass/10 font-mono">
                {warehouses.map(w => (
                  <tr key={w.id} className="hover:bg-ink/5 transition-colors">
                    <td className="p-4 font-sans font-medium text-ink">{w.name}</td>
                    <td className="p-4 text-ink/70">{w.location || '-'}</td>
                    <td className="p-4 text-right font-medium">{w.capacity?.toLocaleString() || '-'}</td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" className="h-8 px-2 text-xs text-ledger-red hover:bg-ledger-red/10" onClick={() => handleDelete(w.id)}>DELETE</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <button 
        className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-turmeric text-ink rounded-full shadow-[2px_2px_0px_0px_rgba(20,32,26,1)] flex items-center justify-center z-30"
        onClick={() => setIsDrawerOpen(true)}
      >
        <span className="text-2xl leading-none font-medium mb-1">+</span>
      </button>

      <Drawer isOpen={isDrawerOpen} onClose={() => {setIsDrawerOpen(false); setErrorMsg('')}} title={`Add ${activeTab === 'users' ? 'User' : activeTab === 'warehouses' ? 'Warehouse' : 'Variety'}`}>
        <form onSubmit={handleAddSubmit} className="flex flex-col gap-6">
          {errorMsg && (
            <div className="bg-ledger-red/10 border border-ledger-red/30 p-3 text-ledger-red text-sm font-sans rounded-sm shadow-sm">
              {errorMsg}
            </div>
          )}

          {activeTab === 'users' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-medium text-sm">First Name</label>
                  <Input name="firstName" required />
                </div>
                <div className="space-y-2">
                  <label className="font-medium text-sm">Last Name</label>
                  <Input name="lastName" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-medium text-sm">Email</label>
                <Input name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <label className="font-medium text-sm">Password</label>
                <Input name="password" type="password" required />
              </div>
              <div className="space-y-2">
                <label className="font-medium text-sm">Role</label>
                <select name="roleName" className="flex h-10 w-full border border-brass/50 bg-stone/50 px-3 py-2 text-sm text-ink ring-offset-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turmeric">
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Accountant">Accountant</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'warehouses' && (
            <>
              <div className="space-y-2">
                <label className="font-medium text-sm">Warehouse Name</label>
                <Input name="name" placeholder="e.g. South Godown" required />
              </div>
              <div className="space-y-2">
                <label className="font-medium text-sm">Location</label>
                <Input name="location" placeholder="e.g. Coimbatore" required />
              </div>
              <div className="space-y-2">
                <label className="font-medium text-sm">Max Capacity (kg)</label>
                <Input name="capacity" type="number" min="0" placeholder="100000" />
              </div>
            </>
          )}

          {activeTab === 'varieties' && (
            <>
              <div className="space-y-2">
                <label className="font-medium text-sm">Variety Name</label>
                <Input name="name" placeholder="e.g. Sona Masuri" required />
              </div>
              <div className="space-y-2">
                <label className="font-medium text-sm">Variety Code (Short, no spaces)</label>
                <Input name="code" placeholder="e.g. sona" required />
              </div>
              <div className="space-y-2">
                <label className="font-medium text-sm">Base Price (₹/kg)</label>
                <Input name="basePrice" type="number" step="0.01" min="0" placeholder="50.00" required />
              </div>
              <div className="space-y-2">
                <label className="font-medium text-sm">Description (Optional)</label>
                <Input name="description" placeholder="Short description" />
              </div>
            </>
          )}

          <div className="pt-4 border-t border-brass/20 mt-auto">
            <Button type="submit" className="w-full">Save Details</Button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
