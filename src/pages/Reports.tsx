import { useState } from "react"
import { StampHeader } from "@/components/ui/StampHeader"
import { StatusBadge } from "@/components/ui/DetailDrawer"
import { useStock } from "@/data/useStock"
import { useSales } from "@/data/useSales"
import { usePurchases } from "@/data/usePurchases"
import { useDashboard } from "@/data/useDashboard"
import { Package, ShoppingCart, Wheat, Loader2, Download, Printer, Calendar } from "lucide-react"

export function Reports() {
  const { stock, isLoading: isStockLoading } = useStock()
  const { sales, isLoading: isSalesLoading } = useSales(1, 100)
  const { purchases, isLoading: isPurchasesLoading } = usePurchases(1, 100)
  const { summary, isLoading: isDashboardLoading } = useDashboard()
  
  const [activeReport, setActiveReport] = useState<'inventory' | 'sales' | 'purchases'>('inventory')

  const isLoading = isStockLoading || isSalesLoading || isPurchasesLoading || isDashboardLoading



  const stockValue = stock.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const totalRevenue = summary?.kpis?.totalSaleValue || 0
  const totalPurchases = summary?.kpis?.totalPurchaseValue || 0
  const netProfit = totalRevenue - totalPurchases

  const handleExportPDF = () => {
    window.open(`/invoice.html?reportType=${activeReport}`, '_blank')
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <StampHeader title="Ledger Reports" />
        
        <div className="flex flex-wrap items-center gap-2 md:gap-3 bg-stone-light p-1.5 border border-brass/30 shadow-[2px_2px_0px_0px_rgba(140,111,62,0.2)] rounded-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 font-mono text-xs md:text-sm text-ink/80 border-r border-brass/20">
            <Calendar size={14} className="text-ink/50" />
            <span>Today</span>
          </div>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-sans font-medium text-ink/70 hover:text-ink hover:bg-ink/5 transition-colors rounded-sm pl-4"
          >
            <Download size={14} /> Export PDF
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-sans font-medium text-ink/70 hover:text-ink hover:bg-ink/5 transition-colors rounded-sm border-l border-brass/20 pl-4"
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-stone-light border border-brass/30 p-4 shadow-[2px_2px_0px_0px_rgba(140,111,62,0.2)]">
          <div className="text-xs font-sans text-ink/50 uppercase tracking-widest mb-1">Inventory Value</div>
          <div className="font-mono text-xl font-bold text-ink tabular-nums">₹{stockValue.toLocaleString()}</div>
        </div>
        <div className="bg-stone-light border border-brass/30 p-4 shadow-[2px_2px_0px_0px_rgba(140,111,62,0.2)]">
          <div className="text-xs font-sans text-ink/50 uppercase tracking-widest mb-1">Total Revenue</div>
          <div className="font-mono text-xl font-bold text-ink tabular-nums">₹{totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-stone-light border border-brass/30 p-4 shadow-[2px_2px_0px_0px_rgba(140,111,62,0.2)]">
          <div className="text-xs font-sans text-ink/50 uppercase tracking-widest mb-1">Total Purchases</div>
          <div className="font-mono text-xl font-bold text-ink tabular-nums">₹{totalPurchases.toLocaleString()}</div>
        </div>
        <div className="bg-stone-light border border-brass/30 p-4 shadow-[2px_2px_0px_0px_rgba(140,111,62,0.2)]">
          <div className="text-xs font-sans text-ink/50 uppercase tracking-widest mb-1">Net Profit</div>
          <div className={`font-mono text-xl font-bold tabular-nums ${netProfit >= 0 ? 'text-paddy' : 'text-ledger-red'}`}>
            {netProfit >= 0 ? '+' : ''}₹{netProfit.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex flex-wrap bg-stone-light border border-brass/50 rounded-sm p-0.5 shadow-[2px_2px_0px_0px_rgba(140,111,62,0.2)] w-full md:w-max">
        <button 
          className={`flex-1 md:flex-none flex justify-center items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${activeReport === 'inventory' ? 'bg-ink text-stone shadow-sm rounded-[1px]' : 'hover:bg-ink/5 text-ink'}`}
          onClick={() => setActiveReport('inventory')}
        >
          <Package size={16} /> Inventory
        </button>
        <button 
          className={`flex-1 md:flex-none flex justify-center items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${activeReport === 'sales' ? 'bg-ink text-stone shadow-sm rounded-[1px]' : 'hover:bg-ink/5 text-ink'}`}
          onClick={() => setActiveReport('sales')}
        >
          <ShoppingCart size={16} /> Sales
        </button>
        <button 
          className={`flex-1 md:flex-none flex justify-center items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${activeReport === 'purchases' ? 'bg-ink text-stone shadow-sm rounded-[1px]' : 'hover:bg-ink/5 text-ink'}`}
          onClick={() => setActiveReport('purchases')}
        >
          <Wheat size={16} /> Purchases
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-turmeric w-8 h-8" />
        </div>
      ) : (
        <div className="bg-stone-light md:border md:border-brass/30 md:shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)] overflow-hidden">
          
          {/* Mobile View */}
          <div className="md:hidden flex flex-col gap-4 bg-stone pb-4">
            {activeReport === 'inventory' && stock.map((item) => (
              <div key={item.id} className="bg-stone-light border border-brass/30 p-4 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-brass/10 pb-2">
                  <div className="font-sans font-medium text-ink flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full bg-variety-${item.varietyId}`} />
                    {item.varietyName}
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg font-bold text-ink">{item.quantity.toLocaleString()} kg</div>
                    <div className="text-xs text-ink/70 font-mono">Value: ₹{(item.quantity * item.price).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
            
            {activeReport === 'sales' && sales.map((item) => (
              <div key={item.id} className="bg-stone-light border border-brass/30 p-4 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start border-b border-brass/10 pb-2">
                  <div>
                    <div className="text-ink font-bold font-mono">{item.invoiceNo}</div>
                    <div className="text-xs text-ink/70 font-mono mt-0.5">{item.saleDate.split('T')[0]}</div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <div className="font-mono text-lg font-bold text-ink">₹{item.totalAmount.toLocaleString()}</div>
                    <StatusBadge status={item.paymentStatus} />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <div className="text-sm font-medium text-ink">{item.customer?.name}</div>
                  <div className="text-sm text-ink/80">{item.items[0]?.quantity} Bags ({item.items[0]?.kgPerBag ?? 26}kg)</div>
                </div>
              </div>
            ))}

            {activeReport === 'purchases' && purchases.map((item) => (
              <div key={item.id} className="bg-stone-light border border-brass/30 p-4 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start border-b border-brass/10 pb-2">
                  <div>
                    <div className="text-ink font-bold font-mono">{item.entryNo}</div>
                    <div className="text-xs text-ink/70 font-mono mt-0.5">{item.purchaseDate.split('T')[0]}</div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <div className="font-mono text-lg font-bold text-ink">₹{item.totalAmount.toLocaleString()}</div>
                    <StatusBadge status={item.paymentStatus} />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <div className="text-sm font-medium text-ink">{item.supplier?.name}</div>
                  <div className="text-sm text-ink/80">{item.items[0]?.quantity} Bags ({item.items[0]?.kgPerBag ?? 26}kg)</div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <table className="hidden md:table w-full text-left text-sm border-collapse">
            <thead className="border-b-2 border-brass/30 font-display uppercase tracking-wider text-ink/70 bg-ink/5">
              {activeReport === 'inventory' && (
                <tr>
                  <th className="p-4">Variety</th>
                  <th className="p-4 text-right">Available Stock</th>
                  <th className="p-4 text-right">Min Level</th>
                  <th className="p-4 text-right">Stock Value</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              )}
              {activeReport === 'sales' && (
                <tr>
                  <th className="p-4">Invoice No</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Variety</th>
                  <th className="p-4 text-right">Qty</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              )}
              {activeReport === 'purchases' && (
                <tr>
                  <th className="p-4">Entry No</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Supplier</th>
                  <th className="p-4">Variety</th>
                  <th className="p-4 text-right">Qty</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              )}
            </thead>
            <tbody>
              {activeReport === 'inventory' && stock.map((item) => (
                <tr key={item.id} className="border-b border-brass/20 border-dotted hover:bg-ink/5 transition-colors even:bg-stone/30 font-mono">
                  <td className="p-4 font-sans font-medium text-ink flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-variety-${item.varietyId}`} />
                    {item.varietyName}
                  </td>
                  <td className="p-4 text-right text-ink font-medium">{item.quantity.toLocaleString()} kg</td>
                  <td className="p-4 text-right text-ink/60">{item.threshold.toLocaleString()} kg</td>
                  <td className="p-4 text-right text-ink font-medium">₹{(item.quantity * item.price).toLocaleString()}</td>
                  <td className="p-4 text-center">
                    {item.quantity < item.threshold ? (
                      <span className="text-ledger-red text-xs bg-ledger-red/10 px-2 py-1 rounded-sm border border-ledger-red/20 uppercase tracking-widest font-sans">Low Stock</span>
                    ) : (
                      <span className="text-paddy text-xs bg-paddy/10 px-2 py-1 rounded-sm border border-paddy/20 uppercase tracking-widest font-sans">Healthy</span>
                    )}
                  </td>
                </tr>
              ))}

              {activeReport === 'sales' && sales.map((item) => (
                <tr key={item.id} className="border-b border-brass/20 border-dotted hover:bg-ink/5 transition-colors even:bg-stone/30 font-mono">
                  <td className="p-4 text-ink font-bold">{item.invoiceNo}</td>
                  <td className="p-4 text-ink/70">{item.saleDate.split('T')[0]}</td>
                  <td className="p-4 font-sans text-ink">{item.customer?.name}</td>
                  <td className="p-4 font-sans text-ink/80">{item.items[0]?.variety?.name}</td>
                  <td className="p-4 text-right text-ink font-medium">{item.items[0]?.quantity} Bags ({item.items[0]?.kgPerBag ?? 26}kg)</td>
                  <td className="p-4 text-right font-medium text-ink">₹{item.totalAmount.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <StatusBadge status={item.paymentStatus} />
                  </td>
                </tr>
              ))}

              {activeReport === 'purchases' && purchases.map((item) => (
                <tr key={item.id} className="border-b border-brass/20 border-dotted hover:bg-ink/5 transition-colors even:bg-stone/30 font-mono">
                  <td className="p-4 text-ink font-bold">{item.entryNo}</td>
                  <td className="p-4 text-ink/70">{item.purchaseDate.split('T')[0]}</td>
                  <td className="p-4 font-sans text-ink">{item.supplier?.name}</td>
                  <td className="p-4 font-sans text-ink/80">{item.items[0]?.variety?.name}</td>
                  <td className="p-4 text-right text-ink font-medium">{item.items[0]?.quantity} Bags ({item.items[0]?.kgPerBag ?? 26}kg)</td>
                  <td className="p-4 text-right font-medium text-ink">₹{item.totalAmount.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <StatusBadge status={item.paymentStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
