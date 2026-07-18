import { useState, useMemo, useEffect } from "react"
import { StampHeader } from "@/components/ui/StampHeader"
import { Button } from "@/components/ui/Button"
import { Drawer } from "@/components/ui/Drawer"
import { DetailDrawer, DetailRow, StatusBadge, DrawerSection, DrawerActionBar } from "@/components/ui/DetailDrawer"
import { Input } from "@/components/ui/Input"
import { useVarieties } from "@/data/useVarieties"
import { usePurchases, usePurchaseDetails } from "@/data/usePurchases"
import { useSuppliers } from "@/data/useSuppliers"
import { useAuth } from "@/contexts/AuthContext"
import { Plus, Wheat, Loader2, Eye, Calendar, Trash2 } from "lucide-react"

function PurchaseDetailDrawer({ purchaseId, onClose, onEdit }: { purchaseId: string | null; onClose: () => void; onEdit: (purchase: any) => void }) {
  const { purchase, isLoading } = usePurchaseDetails(purchaseId)
  const { addPayment, deletePayment } = usePurchases()
  const { user } = useAuth()

  const [recordAmount, setRecordAmount] = useState('')
  const [recordMethod, setRecordMethod] = useState('CASH')
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0])
  const [recordNotes, setRecordNotes] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  const balance = purchase ? (purchase.totalAmount - (purchase.amountPaid ?? 0)) : 0

  useEffect(() => {
    if (purchase) {
      setRecordAmount(Math.max(0, purchase.totalAmount - (purchase.amountPaid ?? 0)).toFixed(2))
      setRecordDate(new Date().toISOString().split('T')[0])
    }
  }, [purchase])

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!purchase) return
    const amt = Number(recordAmount) || 0
    if (amt <= 0) {
      alert("Please enter a valid payment amount.")
      return
    }
    setIsRecording(true)
    try {
      await addPayment(purchase.id, {
        amount: amt,
        paymentMethod: recordMethod,
        paymentDate: recordDate,
        notes: recordNotes || null
      })
      alert("Payment installment recorded successfully.")
      setRecordNotes('')
    } catch (err: any) {
      alert(err.data?.error || "Failed to record payment.")
    } finally {
      setIsRecording(false)
    }
  }

  const handleDeletePayment = async (paymentId: string) => {
    if (!purchase) return
    if (!confirm("Are you sure you want to delete this payment installment? This will revert the paid balance.")) return
    try {
      await deletePayment(purchase.id, paymentId)
      alert("Payment installment deleted successfully.")
    } catch (err: any) {
      alert(err.data?.error || "Failed to delete payment.")
    }
  }

  return (
    <DetailDrawer
      isOpen={!!purchaseId}
      onClose={onClose}
      title={purchase?.entryNo || "Purchase Details"}
      subtitle={purchase ? `${purchase.purchaseDate?.split('T')[0]} \u00B7 ${purchase.supplier?.name}` : undefined}
      actions={
        <DrawerActionBar 
          onDownload={() => {
            if (!purchase) return
            window.open(`/invoice.html?purchaseId=${purchase.id}`, '_blank')
          }}
          onEdit={user?.role === 'ADMIN' ? () => onEdit(purchase) : undefined}
        />
      }
    >
      {isLoading ? (
        <div className="flex justify-center p-16">
          <Loader2 className="animate-spin text-turmeric w-8 h-8" />
        </div>
      ) : purchase ? (
        <div className="divide-y divide-brass/15">

          {/* Purchase Entry Details */}
          <DrawerSection title="Purchase Entry">
            <DetailRow label="Entry No." value={<span className="font-mono font-bold">{purchase.entryNo}</span>} />
            <DetailRow label="Purchase Date" value={purchase.purchaseDate?.split('T')[0]} />
            <DetailRow label="Payment Status" value={<StatusBadge status={purchase.paymentStatus} />} />
            <DetailRow label="Total Amount" value={<span className="font-mono font-bold text-paddy">{"\u20B9"}{purchase.totalAmount?.toLocaleString()}</span>} />
            <DetailRow label="Amount Paid" value={<span className="font-mono text-ink">{"\u20B9"}{(purchase.amountPaid ?? 0).toLocaleString()}</span>} />
            <DetailRow label="Balance" value={<span className="font-mono text-ledger-red font-medium">{"\u20B9"}{balance.toLocaleString()}</span>} />
            <DetailRow label="Payment Method" value={purchase.paymentMethod || '-'} />
            <DetailRow label="Payment Date" value={purchase.paymentDate ? purchase.paymentDate.split('T')[0] : '-'} />
          </DrawerSection>

          {/* Payment History */}
          <DrawerSection title="Payment History">
            {purchase.payments && purchase.payments.length > 0 ? (
              <div className="space-y-2">
                {purchase.payments.map((p: any) => (
                  <div key={p.id} className="flex justify-between items-center p-2 rounded-sm border border-brass/10 bg-stone/20 text-xs font-mono">
                    <div>
                      <div className="font-semibold text-ink flex items-center gap-2">
                        <span>{p.paymentDate?.split('T')[0]}</span>
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-brass/10 text-ink/75 uppercase tracking-wider">{p.paymentMethod}</span>
                      </div>
                      {p.notes && <div className="text-[10px] text-ink/50 mt-0.5 font-sans">{p.notes}</div>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-paddy">₹{p.amount.toLocaleString()}</span>
                      {user?.role === 'ADMIN' && (
                        <button
                          type="button"
                          onClick={() => handleDeletePayment(p.id)}
                          className="text-ledger-red hover:text-ledger-red/80 transition-colors p-1"
                          title="Delete Installment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-ink/50 italic py-1">No payment installments recorded yet.</div>
            )}
          </DrawerSection>

          {/* Record New Payment */}
          {balance > 0 && (
            <DrawerSection title="Record Payment Installment">
              <form onSubmit={handleRecordPayment} className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-ink/50 font-sans font-bold">Amount (₹)</label>
                    <input
                      type="number"
                      min="0.01"
                      max={balance}
                      step="0.01"
                      value={recordAmount}
                      onChange={(e) => setRecordAmount(e.target.value)}
                      className="w-full h-9 px-2 bg-stone border border-brass/35 rounded-sm text-xs font-mono text-ink focus:outline-none focus:ring-1 focus:ring-turmeric"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-ink/50 font-sans font-bold">Payment Method</label>
                    <select
                      value={recordMethod}
                      onChange={(e) => setRecordMethod(e.target.value)}
                      className="w-full h-9 px-2 bg-stone border border-brass/35 rounded-sm text-xs font-sans text-ink focus:outline-none focus:ring-1 focus:ring-turmeric"
                    >
                      <option value="CASH">Cash</option>
                      <option value="BANK_TRANSFER">Bank Transfer / UPI</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-ink/50 font-sans font-bold">Payment Date</label>
                    <input
                      type="date"
                      value={recordDate}
                      onChange={(e) => setRecordDate(e.target.value)}
                      className="w-full h-9 px-2 bg-stone border border-brass/35 rounded-sm text-xs font-sans text-ink focus:outline-none focus:ring-1 focus:ring-turmeric"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-ink/50 font-sans font-bold">Notes</label>
                    <input
                      type="text"
                      placeholder="Optional notes"
                      value={recordNotes}
                      onChange={(e) => setRecordNotes(e.target.value)}
                      className="w-full h-9 px-2 bg-stone border border-brass/35 rounded-sm text-xs font-sans text-ink focus:outline-none focus:ring-1 focus:ring-turmeric"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isRecording}
                  className="w-full text-xs py-2 uppercase tracking-wider font-semibold border border-brass/20"
                >
                  {isRecording ? "Recording..." : "Record Payment"}
                </Button>
              </form>
            </DrawerSection>
          )}

          {/* Supplier Details */}
          <DrawerSection title="Supplier Details">
            <DetailRow label="Supplier Name" value={purchase.supplier?.name} />
            <DetailRow label="Phone" value={purchase.supplier?.phone || '-'} />
            <DetailRow label="Address" value={purchase.supplier?.address || '-'} />
            <DetailRow label="GSTIN" value={<span className="font-mono text-xs">{purchase.supplier?.gstNumber || '-'}</span>} />
          </DrawerSection>

          {/* Items Purchased */}
          <DrawerSection title="Items Purchased">
            {purchase.items?.map((item: any, i: number) => (
              <div key={item.id || i} className="border border-brass/20 rounded-sm p-3 mb-2 last:mb-0 bg-stone/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full bg-variety-${item.variety?.code} shrink-0`} />
                  <span className="font-sans font-medium text-ink text-sm">{item.variety?.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <div className="text-ink/50 uppercase text-[10px]">Bags</div>
                    <div className="font-bold text-ink">{item.quantity}</div>
                  </div>
                  <div>
                    <div className="text-ink/50 uppercase text-[10px]">Kg/Bag</div>
                    <div className="font-bold text-ink">{item.kgPerBag ?? 26} kg</div>
                  </div>
                  <div>
                    <div className="text-ink/50 uppercase text-[10px]">Total Kg</div>
                    <div className="font-bold text-paddy">{((item.quantity ?? 0) * (item.kgPerBag ?? 26)).toLocaleString()} kg</div>
                  </div>
                  <div>
                    <div className="text-ink/50 uppercase text-[10px]">Rate / Bag</div>
                    <div className="font-bold text-ink">₹{item.rate?.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-ink/50 uppercase text-[10px]">Rate / Kg</div>
                    <div className="font-bold text-ink">₹{((item.rate ?? 0) / (item.kgPerBag ?? 26)).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-ink/50 uppercase text-[10px]">Item Total</div>
                    <div className="font-bold text-paddy">₹{((item.quantity ?? 0) * (item.rate ?? 0)).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </DrawerSection>

          {/* Transaction Summary */}
          <DrawerSection title="Transaction Summary">
            <DetailRow label="Total Bags" value={<span className="font-mono">{purchase.items?.reduce((s: number, i: any) => s + (i.quantity ?? 0), 0)} bags</span>} />
            <DetailRow label="Total Weight" value={<span className="font-mono">{purchase.items?.reduce((s: number, i: any) => s + (i.quantity ?? 0) * (i.kgPerBag ?? 26), 0).toLocaleString()} kg</span>} />
            <DetailRow label="Grand Total" value={<span className="font-mono font-bold text-paddy">₹{purchase.totalAmount?.toLocaleString()}</span>} />
            <DetailRow label="Payment Status" value={<StatusBadge status={purchase.paymentStatus} />} />
          </DrawerSection>

          {/* Metadata */}
          <DrawerSection title="Record Info">
            <DetailRow label="Record ID" value={<span className="font-mono text-xs text-ink/50">{purchase.id}</span>} />
            <DetailRow label="Created" value={purchase.createdAt ? new Date(purchase.createdAt).toLocaleString() : '-'} />
            <DetailRow label="Last Updated" value={purchase.updatedAt ? new Date(purchase.updatedAt).toLocaleString() : '-'} />
          </DrawerSection>

        </div>
      ) : (
        <div className="p-8 text-center text-ink/50 font-sans">Could not load purchase details.</div>
      )}
    </DetailDrawer>
  )
}

export function Purchases() {
  const { purchases, isLoading: isPurchasesLoading, addPurchase, deletePurchase, updatePurchase } = usePurchases(1, 100)
  const { varieties, isLoading: isVarietiesLoading } = useVarieties()
  const { suppliers, isLoading: isSuppliersLoading } = useSuppliers(1, 100)
  const { user } = useAuth()
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null)
  const [editingPurchase, setEditingPurchase] = useState<any | null>(null)
  const [transactionDate, setTransactionDate] = useState('')

  const [selectedVariety, setSelectedVariety] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [quantity, setQuantity] = useState('')
  const [kgPerBag, setKgPerBag] = useState('26')
  const [rate, setRate] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('PENDING')
  const [amtPaid, setAmtPaid] = useState('0')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [isRecording, setIsRecording] = useState(false)
 
  const [errorMsg, setErrorMsg] = useState('')
 
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('')
  const [filterSupplier, setFilterSupplier] = useState('')
  const [filterVariety, setFilterVariety] = useState('')

  const openCreateDrawer = () => {
    setEditingPurchase(null)
    setSelectedSupplier('')
    setSelectedVariety('')
    setQuantity('')
    setKgPerBag('26')
    setRate('')
    setPaymentStatus('PENDING')
    setAmtPaid('0')
    setPaymentMethod('')
    setTransactionDate(new Date().toISOString().split('T')[0])
    setErrorMsg('')
    setIsDrawerOpen(true)
  }

  const startEditPurchase = (purchase: any) => {
    setEditingPurchase(purchase)
    setSelectedSupplier(purchase.supplierId)
    setSelectedVariety(purchase.items[0]?.riceVarietyId || '')
    setQuantity(purchase.items[0]?.quantity.toString() || '')
    setKgPerBag((purchase.items[0]?.kgPerBag ?? 26).toString())
    setRate(purchase.items[0]?.rate.toString() || '')
    setPaymentStatus(purchase.paymentStatus)
    setAmtPaid(purchase.amountPaid?.toString() || '0')
    setPaymentMethod(purchase.paymentMethod || '')
    setTransactionDate(purchase.purchaseDate.split('T')[0])
    setErrorMsg('')
    setSelectedPurchaseId(null) // close details
    setIsDrawerOpen(true) // open form
  }

  const filteredPurchases = useMemo(() => {
    return purchases.filter(purchase => {
      const dateStr = purchase.purchaseDate.split('T')[0]
      if (filterStartDate && dateStr < filterStartDate) return false
      if (filterEndDate && dateStr > filterEndDate) return false

      if (filterPaymentStatus && purchase.paymentStatus !== filterPaymentStatus) return false

      if (filterSupplier && purchase.supplierId !== filterSupplier) return false

      if (filterVariety) {
        const hasVariety = purchase.items?.some(item => item.riceVarietyId === filterVariety)
        if (!hasVariety) return false
      }

      return true
    })
  }, [purchases, filterStartDate, filterEndDate, filterPaymentStatus, filterSupplier, filterVariety])

  const hasActiveFilters = !!(filterStartDate || filterEndDate || filterPaymentStatus || filterSupplier || filterVariety)

  const clearFilters = () => {
    setFilterStartDate('')
    setFilterEndDate('')
    setFilterPaymentStatus('')
    setFilterSupplier('')
    setFilterVariety('')
  }
 
  const handleRecordPurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    
    const qtyBags = Number(quantity)
    const kgWeight = Number(kgPerBag) || 26
 
    if (selectedVariety && selectedSupplier) {
      try {
        setIsRecording(true)
        const finalAmtPaid = paymentStatus === 'PAID' ? computedTotal : (paymentStatus === 'PARTIAL' ? Number(amtPaid) : 0)
        
        const purchaseData = {
          supplierId: selectedSupplier,
          purchaseDate: new Date(transactionDate).toISOString(),
          paymentStatus: paymentStatus,
          amountPaid: finalAmtPaid,
          paymentMethod: (paymentStatus === 'PARTIAL' || paymentStatus === 'PAID') ? paymentMethod : null,
          items: [{
            riceVarietyId: selectedVariety,
            quantity: qtyBags,
            kgPerBag: kgWeight,
            rate: Number(rate)
          }]
        }

        if (editingPurchase) {
          await updatePurchase(editingPurchase.id, purchaseData)
          alert("Purchase transaction updated successfully.")
        } else {
          await addPurchase(purchaseData)
        }
        
        setIsDrawerOpen(false)
        setEditingPurchase(null)
        setQuantity('')
        setRate('')
        setKgPerBag('26')
        setPaymentStatus('PENDING')
        setAmtPaid('0')
        setPaymentMethod('')
      } catch (err: any) {
        let msg = err.data?.error || "Failed to record purchase. Please try again."
        if (err.data?.issues) {
           const issuesStr = Object.entries(err.data.issues)
              .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
              .join(' | ')
           msg += ` (${issuesStr})`
        }
        setErrorMsg(msg)
      } finally {
        setIsRecording(false)
      }
    }
  }
 
  const handleDeletePurchase = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (user?.role !== 'ADMIN') {
      alert("Access Denied: Only Administrators can delete purchase records.")
      return
    }
    const confirmed = window.confirm("Are you sure you want to delete this purchase? Stock will be automatically reverted.")
    if (confirmed) {
      deletePurchase(id)
    }
  }
 
  const selectedVarietyDetails = useMemo(() => 
    varieties.find(v => v.id === selectedVariety), 
  [varieties, selectedVariety])
  
  const computedTotal = (Number(quantity) || 0) * (Number(rate) || 0)

  useEffect(() => {
    if (paymentStatus === 'PAID') {
      setAmtPaid(computedTotal.toString())
    }
  }, [computedTotal, paymentStatus])

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-start">
        <StampHeader title="Purchases" />
        <Button onClick={openCreateDrawer} className="hidden md:flex">Record Purchase</Button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-stone-light p-3 border border-brass/30 shadow-[2px_2px_0px_0px_rgba(140,111,62,0.2)] rounded-sm">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Date Range */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-stone border border-brass/30 rounded-sm font-mono text-xs text-ink/80 w-full md:w-auto">
            <Calendar size={14} className="text-ink/50 shrink-0" />
            <input 
              type="date" 
              value={filterStartDate} 
              onChange={(e) => setFilterStartDate(e.target.value)} 
              className="bg-transparent border-0 outline-none text-ink text-xs focus:ring-0 cursor-pointer p-0 w-full md:w-28 font-mono"
              placeholder="Start Date"
            />
            <span className="text-ink/40 text-xs">to</span>
            <input 
              type="date" 
              value={filterEndDate} 
              onChange={(e) => setFilterEndDate(e.target.value)} 
              className="bg-transparent border-0 outline-none text-ink text-xs focus:ring-0 cursor-pointer p-0 w-full md:w-28 font-mono"
              placeholder="End Date"
            />
          </div>

          {/* Payment Status Dropdown */}
          <select
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
            className="flex-1 md:flex-initial h-8 px-2 bg-stone border border-brass/30 rounded-sm text-xs font-sans text-ink focus:outline-none focus:ring-1 focus:ring-turmeric min-w-[130px]"
          >
            <option value="">All Payment Statuses</option>
            <option value="PAID">PAID</option>
            <option value="PENDING">UNPAID</option>
            <option value="PARTIAL">PARTIAL</option>
            <option value="OVERDUE">OVERDUE</option>
          </select>

          {/* Supplier Dropdown */}
          <select
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
            className="flex-1 md:flex-initial h-8 px-2 bg-stone border border-brass/30 rounded-sm text-xs font-sans text-ink focus:outline-none focus:ring-1 focus:ring-turmeric min-w-[140px]"
          >
            <option value="">All Suppliers</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Rice Variety Dropdown */}
          <select
            value={filterVariety}
            onChange={(e) => setFilterVariety(e.target.value)}
            className="flex-1 md:flex-initial h-8 px-2 bg-stone border border-brass/30 rounded-sm text-xs font-sans text-ink focus:outline-none focus:ring-1 focus:ring-turmeric min-w-[130px]"
          >
            <option value="">All Varieties</option>
            {varieties.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="w-full md:w-auto h-8 px-3 bg-ledger-red text-stone text-xs uppercase font-bold hover:bg-ledger-red/80 rounded-sm font-sans transition-colors md:ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {(isPurchasesLoading || isVarietiesLoading || isSuppliersLoading) ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-turmeric w-8 h-8" />
        </div>
      ) : (
        <div className="bg-stone-light md:border md:border-brass/30 md:shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)] overflow-hidden">
          <div className="md:hidden flex flex-col gap-4 bg-stone pb-4">
            {filteredPurchases.map(purchase => (
              <div
                key={purchase.id}
                className="bg-stone-light border border-brass/30 p-4 shadow-sm flex flex-col gap-3 cursor-pointer hover:border-brass transition-colors"
                onClick={() => setSelectedPurchaseId(purchase.id)}
              >
                <div className="flex justify-between items-start border-b border-brass/10 pb-2">
                  <div>
                    <div className="text-ink font-bold font-mono">{purchase.entryNo}</div>
                    <div className="text-xs text-ink/70 font-mono mt-0.5">{purchase.purchaseDate.split('T')[0]}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg font-bold text-ink">₹{purchase.totalAmount.toLocaleString()}</div>
                    <div className="text-xs text-ink/70 font-mono">₹{purchase.items[0]?.rate.toFixed(2)}/bag (₹{((purchase.items[0]?.rate ?? 0) / (purchase.items[0]?.kgPerBag ?? 26)).toFixed(2)}/kg)</div>
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
                      +{purchase.items[0]?.quantity.toLocaleString()} <span className="text-xs">Bags ({purchase.items[0]?.kgPerBag ?? 26}kg)</span>
                    </div>
                    <Button variant="ghost" className="h-6 px-2 text-xs text-ledger-red hover:bg-ledger-red/10" onClick={(e) => handleDeletePurchase(purchase.id, e)}>DELETE</Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredPurchases.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-stone border border-brass/20">
                <div className="w-16 h-16 rounded-full bg-ink/5 flex items-center justify-center">
                  <Wheat size={32} className="text-brass/40" />
                </div>
                <p className="font-sans text-ink/60 font-medium">
                  {purchases.length === 0 ? "No purchases logged yet." : "No purchases match the active filters."}
                </p>
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
                <th className="p-4 text-right">Quantity</th>
                <th className="p-4 text-right">Rate (₹/bag)</th>
                <th className="p-4 text-right">Total (₹)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((purchase) => (
                <tr
                  key={purchase.id}
                  className="border-b border-brass/20 border-dotted hover:bg-ink/5 transition-colors even:bg-stone/30 cursor-pointer"
                  onClick={() => setSelectedPurchaseId(purchase.id)}
                >
                  <td className="p-4 text-ink font-bold font-mono">{purchase.entryNo}</td>
                  <td className="p-4 text-ink/70 font-mono">{purchase.purchaseDate.split('T')[0]}</td>
                  <td className="p-4 font-sans text-ink hover:underline">{purchase.supplier?.name}</td>
                  <td className="p-4 font-sans font-medium text-ink flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-variety-${purchase.items[0]?.variety?.code}`} />
                    {purchase.items[0]?.variety?.name}
                  </td>
                  <td className="p-4 text-right text-paddy font-medium font-mono">
                    +{purchase.items[0]?.quantity.toLocaleString()} Bags ({purchase.items[0]?.kgPerBag ?? 26}kg)
                  </td>
                  <td className="p-4 text-right font-mono">
                    {purchase.items[0]?.rate.toFixed(2)}
                    <span className="block text-[10px] text-ink/65">(₹{((purchase.items[0]?.rate ?? 0) / (purchase.items[0]?.kgPerBag ?? 26)).toFixed(2)}/kg)</span>
                  </td>
                  <td className="p-4 text-right font-mono font-medium text-ink">{purchase.totalAmount.toLocaleString()}</td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" className="h-8 px-2 text-xs mr-1 text-ink/60 hover:bg-ink/10" onClick={() => setSelectedPurchaseId(purchase.id)}>
                      <Eye size={14} />
                    </Button>
                    <Button variant="ghost" className="h-8 px-2 text-xs text-ledger-red hover:bg-ledger-red/10" onClick={(e) => handleDeletePurchase(purchase.id, e)}>DELETE</Button>
                  </td>
                </tr>
              ))}
              {filteredPurchases.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="p-16 flex flex-col items-center justify-center gap-4 text-ink/50 bg-[#F8F9F3]">
                      <Wheat size={48} className="text-brass/20" />
                      <p className="font-sans">
                        {purchases.length === 0 ? "No purchases recorded today. Record today's first purchase." : "No purchases match the active filters."}
                      </p>
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
        onClick={openCreateDrawer}
      >
        <Plus size={24} />
      </button>

      {/* Record Purchase Form Drawer */}
      <Drawer isOpen={isDrawerOpen} onClose={() => {setIsDrawerOpen(false); setErrorMsg('');}} title={editingPurchase ? "Edit Purchase" : "Record Purchase"}>
        <form onSubmit={handleRecordPurchase} className="flex flex-col gap-6">
          {/* Purchase Date */}
          <div className="space-y-2">
            <label className="font-medium text-sm">Purchase Date</label>
            <Input 
              type="date" 
              value={transactionDate} 
              onChange={(e) => setTransactionDate(e.target.value)} 
              required 
              className="font-mono"
            />
          </div>

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
            <label className="font-medium text-sm">Quantity (Bags)</label>
            <Input 
              type="number" 
              min="1" 
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)} 
              placeholder="0" 
              required 
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm">Purchase Kg/Bag</label>
            <select
              className="flex h-10 w-full border border-brass/50 bg-stone/50 px-3 py-2 text-sm text-ink ring-offset-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turmeric"
              value={kgPerBag}
              onChange={(e) => setKgPerBag(e.target.value)}
              required
            >
              <option value="25">25 kg</option>
              <option value="26">26 kg</option>
              <option value="75">75 kg</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm">Purchase Rate ({"\u20B9"} per bag)</label>
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
            {rate && (
              <p className="text-xs font-mono text-ink/65 mt-1">
                Calculated Rate: {"\u20B9"}{((Number(rate) || 0) / (Number(kgPerBag) || 26)).toFixed(2)} / kg
              </p>
            )}
          </div>

          {/* Payment Details */}
          <div className="space-y-4 border-t border-brass/10 pt-4">
            <div className={paymentStatus === 'PARTIAL' ? "grid grid-cols-2 gap-3" : "w-full"}>
              <div className="space-y-2">
                <label className="font-medium text-sm">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => {
                    const newStatus = e.target.value
                    setPaymentStatus(newStatus)
                    if (newStatus === 'PAID') {
                      setAmtPaid(computedTotal.toString())
                    } else if (newStatus === 'PENDING' || newStatus === 'OVERDUE') {
                      setAmtPaid('0')
                      setPaymentMethod('')
                    }
                  }}
                  className="flex h-10 w-full border border-brass/50 bg-stone/50 px-3 py-2 text-sm text-ink ring-offset-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turmeric"
                >
                  <option value="PENDING">UNPAID</option>
                  <option value="PARTIAL">PARTIAL</option>
                  <option value="PAID">PAID</option>
                  <option value="OVERDUE">OVERDUE</option>
                </select>
              </div>

              {paymentStatus === 'PARTIAL' && (
                <div className="space-y-2">
                  <label className="font-medium text-sm">Payment Method</label>
                  <input
                    type="text"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="Cash, UPI, NEFT"
                    className="flex h-10 w-full border border-brass/50 bg-stone/50 px-3 py-2 text-sm text-ink ring-offset-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turmeric"
                  />
                </div>
              )}
            </div>

            {paymentStatus === 'PARTIAL' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="font-medium text-sm">Amount Paid ({"\u20B9"})</label>
                  <input
                    type="number"
                    min="0"
                    max={computedTotal}
                    step="0.01"
                    value={amtPaid}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0
                      setAmtPaid(e.target.value)
                      if (val >= computedTotal) {
                        setPaymentStatus('PAID')
                      } else if (val > 0 && val < computedTotal) {
                        setPaymentStatus('PARTIAL')
                      } else if (val === 0) {
                        setPaymentStatus('PENDING')
                      }
                    }}
                    className="flex h-10 w-full border border-brass/50 bg-stone/50 px-3 py-2 text-sm text-ink ring-offset-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turmeric font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <span className="font-medium text-sm block">Remaining Balance</span>
                  <div className="h-10 flex items-center px-1 font-mono text-sm font-bold">
                    {(() => {
                      const paid = Number(amtPaid) || 0
                      const remaining = computedTotal - paid
                      if (remaining <= 0) {
                        return <span className="text-paddy">{"\u20B9"}0 (Settle)</span>
                      }
                      return <span className="text-ledger-red">{"\u20B9"}{remaining.toLocaleString()}</span>
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="bg-ledger-red/10 border border-ledger-red/30 p-3 text-ledger-red text-sm flex items-start gap-2 rounded-sm font-medium">
              <span className="mt-0.5">⚠</span> {errorMsg}
            </div>
          )}

          <div className="bg-ink/5 p-4 border border-brass/20 flex justify-between items-center">
            <span className="text-sm font-medium uppercase tracking-wider text-ink/70">Total Amount</span>
            <span className="font-mono text-xl font-bold text-ink">{"\u20B9"}{computedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="pt-4 border-t border-brass/20">
            <Button type="submit" disabled={isRecording} className="w-full flex items-center justify-center gap-2">
              {isRecording ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>{editingPurchase ? 'Updating...' : 'Recording...'}</span>
                </>
              ) : (
                <span>{editingPurchase ? 'Save Changes' : 'Record Purchase'}</span>
              )}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Purchase Detail Drawer */}
      <PurchaseDetailDrawer purchaseId={selectedPurchaseId} onClose={() => setSelectedPurchaseId(null)} onEdit={startEditPurchase} />
    </div>
  )
}
