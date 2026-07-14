import { useState } from "react"
import { StampHeader } from "@/components/ui/StampHeader"
import { Button } from "@/components/ui/Button"
import { useStock } from "@/data/useStock"
import { Calendar, Download, Printer, TrendingUp, TrendingDown, Package, ShoppingCart, Wheat, Wallet, FileText, Search, Plus } from "lucide-react"

export function Reports() {
  const { stock } = useStock()
  const [activeTab, setActiveTab] = useState<'inventory' | 'sales' | 'purchases' | 'financial'>('inventory')

  // Mock data for KPI
  const kpis = [
    { title: "Total Stock", value: "17,200 kg", trend: "+2.4%", up: true, icon: Package },
    { title: "Revenue (MTD)", value: "₹ 8,45,000", trend: "+12.5%", up: true, icon: Wallet },
    { title: "Purchases (MTD)", value: "₹ 5,12,000", trend: "-4.1%", up: false, icon: Wheat },
    { title: "Outstanding", value: "₹ 1,24,500", trend: "+1.2%", up: true, icon: FileText },
  ]

  // Mock sales
  const sales = [
    { id: '1', date: '2026-07-14', invoice: 'INV-2041', customer: 'Saraswathi Stores', variety: 'Ponni Boiled', qty: 250, rate: 58, amount: 14500, status: 'Paid' },
    { id: '2', date: '2026-07-13', invoice: 'INV-2040', customer: 'Krishna Supermarket', variety: 'Sona Masuri', qty: 500, rate: 62, amount: 31000, status: 'Pending' },
  ]

  // Mock purchases
  const purchases = [
    { id: '1', date: '2026-07-12', entry: 'P-1042', supplier: 'Rajesh Traders', variety: 'Ponni Boiled', qty: 4500, rate: 42, amount: 189000, status: 'Paid' },
    { id: '2', date: '2026-07-10', entry: 'P-1041', supplier: 'Sri Balaji Agro', variety: 'Sona Masuri', qty: 1200, rate: 54, amount: 64800, status: 'Paid' },
  ]

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <StampHeader title="Ledger Reports" className="mb-4 md:mb-0" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-stone-light border border-brass/50 font-mono text-sm shadow-[2px_2px_0px_0px_rgba(140,111,62,0.2)]">
            <Calendar size={16} className="text-ink/60" />
            <span>Jul 01 - Jul 14, 2026</span>
          </div>
          <Button variant="secondary" className="gap-2 hidden md:flex"><Download size={16} /> PDF</Button>
          <Button variant="secondary" className="gap-2 hidden md:flex"><Download size={16} /> Excel</Button>
          <Button variant="secondary" className="gap-2"><Printer size={16} /> Print</Button>
        </div>
      </div>

      {/* Executive Summary */}
      <div>
        <h2 className="font-display uppercase tracking-wider text-ink/50 text-sm mb-4">Executive Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-stone-light border border-brass/30 p-5 shadow-[4px_4px_0px_0px_rgba(20,32,26,0.05)] relative overflow-hidden group">
              <kpi.icon className="absolute -right-4 -bottom-4 w-24 h-24 text-brass/5 opacity-50 group-hover:scale-110 transition-transform" />
              <div className="flex justify-between items-start mb-4">
                <span className="font-sans font-medium text-ink/70">{kpi.title}</span>
                <span className={`flex items-center gap-1 text-xs font-mono px-1.5 py-0.5 rounded-sm border ${kpi.up ? 'text-paddy bg-paddy/10 border-paddy/20' : 'text-ledger-red bg-ledger-red/10 border-ledger-red/20'}`}>
                  {kpi.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {kpi.trend}
                </span>
              </div>
              <div className="font-mono text-2xl font-bold text-ink">{kpi.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto hide-scrollbar border-b-2 border-brass/20">
        {[
          { id: 'inventory', label: 'Inventory Report', icon: Package },
          { id: 'sales', label: 'Sales Report', icon: ShoppingCart },
          { id: 'purchases', label: 'Purchase Report', icon: Wheat },
          { id: 'financial', label: 'Financial Report', icon: Wallet },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 font-display uppercase tracking-wider text-sm transition-colors whitespace-nowrap border-b-2 -mb-[2px] ${activeTab === tab.id ? 'border-ink text-ink bg-ink/5' : 'border-transparent text-ink/60 hover:bg-ink/5 hover:text-ink'}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-stone-light md:border md:border-brass/30 md:shadow-[4px_4px_0px_0px_rgba(140,111,62,0.1)]">
        
        {/* Controls Bar */}
        <div className="p-4 border-b border-brass/20 flex flex-col md:flex-row gap-4 justify-between bg-[#F8F9F3] sticky top-0 z-10 hidden md:flex">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={16} />
            <input type="text" placeholder={`Search ${activeTab}...`} className="w-full pl-9 pr-4 py-2 bg-stone border border-brass/30 text-sm font-sans focus:outline-none focus:border-turmeric" />
          </div>
          <Button variant="ghost" className="border border-brass/30 text-xs gap-2"><FileText size={14}/> Filters</Button>
        </div>

        {/* Mobile Filter Bar */}
        <div className="md:hidden flex gap-2 p-2 bg-stone sticky top-16 z-20 shadow-sm border-b border-brass/20">
           <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={14} />
            <input type="text" placeholder="Search..." className="w-full pl-8 pr-4 py-2 bg-stone-light border border-brass/30 text-xs font-sans focus:outline-none focus:border-turmeric" />
          </div>
          <button className="px-4 bg-stone-light border border-brass/30 text-xs uppercase tracking-wider flex items-center justify-center shadow-sm">Filter</button>
        </div>

        {/* Mobile Ledger Cards */}
        <div className="md:hidden flex flex-col gap-4 bg-stone pb-4 pt-4 px-2">
          
          {activeTab === 'inventory' && stock.map(item => (
            <div key={item.id} className="bg-stone-light border border-brass/30 p-4 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start border-b border-brass/10 pb-2">
                <div className="font-sans font-medium text-ink flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-variety-${item.varietyId}`} />
                  {item.varietyName}
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded-sm border font-sans uppercase tracking-widest ${item.quantity < item.threshold ? 'text-ledger-red bg-ledger-red/10 border-ledger-red/20' : 'text-paddy bg-paddy/10 border-paddy/20'}`}>
                    {item.quantity < item.threshold ? 'Low' : 'Healthy'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-1">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-ink/50">Available</span>
                  <span className="font-mono text-lg font-medium text-ink">{item.quantity.toLocaleString()} kg</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-widest text-ink/50">Stock Value</span>
                  <span className="font-mono text-sm text-ink/70">₹{(item.quantity * item.price).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}

          {activeTab === 'sales' && sales.map(item => (
            <div key={item.id} className="bg-stone-light border border-brass/30 p-4 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start border-b border-brass/10 pb-2">
                <div>
                  <div className="text-ink font-bold font-mono">{item.invoice}</div>
                  <div className="text-xs text-ink/70 font-mono mt-0.5">{item.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg font-bold text-ink">₹{item.amount.toLocaleString()}</div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border font-sans uppercase tracking-widest ${item.status === 'Paid' ? 'text-paddy bg-paddy/10 border-paddy/20' : 'text-turmeric bg-turmeric/10 border-turmeric/20 text-ink'}`}>{item.status}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-1">
                <div className="flex flex-col gap-1">
                  <div className="font-sans font-medium text-ink/90 text-sm">{item.customer}</div>
                  <div className="text-xs text-ink/60 font-sans">{item.variety}</div>
                </div>
                <div className="text-ink font-mono font-medium text-sm">
                  {item.qty} kg
                </div>
              </div>
            </div>
          ))}

          {activeTab === 'purchases' && purchases.map(item => (
            <div key={item.id} className="bg-stone-light border border-brass/30 p-4 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start border-b border-brass/10 pb-2">
                <div>
                  <div className="text-ink font-bold font-mono">{item.entry}</div>
                  <div className="text-xs text-ink/70 font-mono mt-0.5">{item.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg font-bold text-ink">₹{item.amount.toLocaleString()}</div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border font-sans uppercase tracking-widest ${item.status === 'Paid' ? 'text-paddy bg-paddy/10 border-paddy/20' : 'text-turmeric bg-turmeric/10 border-turmeric/20 text-ink'}`}>{item.status}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-1">
                <div className="flex flex-col gap-1">
                  <div className="font-sans font-medium text-ink/90 text-sm">{item.supplier}</div>
                  <div className="text-xs text-ink/60 font-sans">{item.variety}</div>
                </div>
                <div className="text-ink font-mono font-medium text-sm">
                  {item.qty} kg
                </div>
              </div>
            </div>
          ))}

          {activeTab === 'financial' && (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-[#F8F9F3] border border-brass/20">
              <div className="w-16 h-16 rounded-full bg-ink/5 flex items-center justify-center">
                <Wallet size={32} className="text-brass/40" />
              </div>
              <p className="font-sans text-ink/60 font-medium text-sm">Financials require reconciliation.</p>
            </div>
          )}
        </div>

        {/* Desktop Tables */}
        <div className="hidden md:block w-full">
          {activeTab === 'inventory' && (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-ink/5 border-b-2 border-brass/30 font-display uppercase tracking-wider text-ink/70">
                <tr>
                  <th className="p-4">Variety</th>
                  <th className="p-4 text-right">Available Stock</th>
                  <th className="p-4 text-right">Min Level</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Stock Value</th>
                </tr>
              </thead>
              <tbody>
                {stock.map(item => (
                  <tr key={item.id} className="border-b border-brass/20 border-dotted hover:bg-ink/5 transition-colors even:bg-stone/30 font-mono">
                    <td className="p-4 font-sans font-medium text-ink flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-variety-${item.varietyId}`} />
                      {item.varietyName}
                    </td>
                    <td className="p-4 text-right text-ink">{item.quantity.toLocaleString()} kg</td>
                    <td className="p-4 text-right text-ink/60">{item.threshold.toLocaleString()} kg</td>
                    <td className="p-4 text-center">
                      {item.quantity < item.threshold ? (
                        <span className="text-ledger-red text-[10px] bg-ledger-red/10 px-2 py-0.5 rounded-sm border border-ledger-red/20 font-sans uppercase tracking-widest">Low</span>
                      ) : (
                        <span className="text-paddy text-[10px] bg-paddy/10 px-2 py-0.5 rounded-sm border border-paddy/20 font-sans uppercase tracking-widest">Healthy</span>
                      )}
                    </td>
                    <td className="p-4 text-right">₹{(item.quantity * item.price).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'sales' && (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-ink/5 border-b-2 border-brass/30 font-display uppercase tracking-wider text-ink/70">
                <tr>
                  <th className="p-4">Invoice No</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Variety</th>
                  <th className="p-4 text-right">Qty</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(item => (
                  <tr key={item.id} className="border-b border-brass/20 border-dotted hover:bg-ink/5 transition-colors even:bg-stone/30 font-mono">
                    <td className="p-4 text-ink font-bold">{item.invoice}</td>
                    <td className="p-4 text-ink/70">{item.date}</td>
                    <td className="p-4 font-sans text-ink">{item.customer}</td>
                    <td className="p-4 font-sans text-ink/80">{item.variety}</td>
                    <td className="p-4 text-right">{item.qty} kg</td>
                    <td className="p-4 text-right font-medium text-ink">₹{item.amount.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-sm border font-sans uppercase tracking-widest ${item.status === 'Paid' ? 'text-paddy bg-paddy/10 border-paddy/20' : 'text-turmeric bg-turmeric/10 border-turmeric/20 text-ink'}`}>{item.status}</span>
                    </td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <div className="p-16 flex flex-col items-center justify-center gap-4 text-ink/50 bg-[#F8F9F3]">
                        <ShoppingCart size={48} className="text-brass/20" />
                        <p className="font-sans">No sales found for this period. Try changing the selected date range.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          
          {activeTab === 'purchases' && (
             <table className="w-full text-left text-sm border-collapse">
             <thead className="bg-ink/5 border-b-2 border-brass/30 font-display uppercase tracking-wider text-ink/70">
               <tr>
                 <th className="p-4">Entry No</th>
                 <th className="p-4">Date</th>
                 <th className="p-4">Supplier</th>
                 <th className="p-4">Variety</th>
                 <th className="p-4 text-right">Qty</th>
                 <th className="p-4 text-right">Total</th>
                 <th className="p-4 text-center">Status</th>
               </tr>
             </thead>
             <tbody>
               {purchases.map(item => (
                 <tr key={item.id} className="border-b border-brass/20 border-dotted hover:bg-ink/5 transition-colors even:bg-stone/30 font-mono">
                   <td className="p-4 text-ink font-bold">{item.entry}</td>
                   <td className="p-4 text-ink/70">{item.date}</td>
                   <td className="p-4 font-sans text-ink">{item.supplier}</td>
                   <td className="p-4 font-sans text-ink/80">{item.variety}</td>
                   <td className="p-4 text-right">{item.qty} kg</td>
                   <td className="p-4 text-right font-medium text-ink">₹{item.amount.toLocaleString()}</td>
                   <td className="p-4 text-center">
                     <span className={`text-[10px] px-2 py-0.5 rounded-sm border font-sans uppercase tracking-widest ${item.status === 'Paid' ? 'text-paddy bg-paddy/10 border-paddy/20' : 'text-turmeric bg-turmeric/10 border-turmeric/20 text-ink'}`}>{item.status}</span>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
          )}

          {activeTab === 'financial' && (
            <div className="p-24 flex flex-col items-center justify-center gap-4 text-ink/50 bg-[#F8F9F3]">
              <Wallet size={48} className="text-brass/20" />
              <p className="font-sans">Financial reports require end-of-month reconciliation.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
