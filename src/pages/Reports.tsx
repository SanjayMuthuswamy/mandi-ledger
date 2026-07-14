import { useState } from "react"
import { useStock } from "@/data/useStock"
import { Calendar, Download, Printer, TrendingUp, TrendingDown, Package, ShoppingCart, Wheat, Wallet, FileText, Search } from "lucide-react"

export function Reports() {
  const { stock } = useStock()
  const [activeTab, setActiveTab] = useState<'inventory' | 'sales' | 'purchases' | 'financial'>('inventory')
  const [searchQuery, setSearchQuery] = useState('')

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

  // Filter Data
  const q = searchQuery.toLowerCase()
  const filteredStock = stock.filter(s => s.varietyName.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
  const filteredSales = sales.filter(s => s.invoice.toLowerCase().includes(q) || s.customer.toLowerCase().includes(q) || s.variety.toLowerCase().includes(q))
  const filteredPurchases = purchases.filter(p => p.entry.toLowerCase().includes(q) || p.supplier.toLowerCase().includes(q) || p.variety.toLowerCase().includes(q))

  return (
    <div className="flex flex-col gap-12 pb-24 max-w-[1400px] mx-auto w-full">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tighter text-ink drop-shadow-stamp">Ledger Reports</h1>
          <p className="font-sans text-ink/60 mt-2 text-sm md:text-base">Business insights and operational records</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-transparent border border-brass/30 font-mono text-xs md:text-sm rounded-md text-ink/70">
            <Calendar size={16} className="text-ink/50" />
            <span>Jul 01 - Jul 14, 2026</span>
          </div>
          <button className="flex items-center justify-center w-10 h-10 border border-brass/30 rounded-md text-ink/60 hover:text-ink hover:bg-ink/5 transition-colors shadow-sm">
            <Download size={16} />
          </button>
          <button className="flex items-center justify-center w-10 h-10 border border-brass/30 rounded-md text-ink/60 hover:text-ink hover:bg-ink/5 transition-colors shadow-sm">
            <Printer size={16} />
          </button>
        </div>
      </div>

      {/* 2. Executive Summary */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-[#F8F9F3] border border-brass/20 p-8 rounded-lg shadow-sm relative overflow-hidden group">
              <kpi.icon className="absolute -right-4 -bottom-4 w-32 h-32 text-brass/5 opacity-50 group-hover:scale-110 transition-transform duration-500" />
              <div className="flex justify-between items-start mb-6">
                <span className="font-sans font-medium text-xs uppercase tracking-widest text-ink/50">{kpi.title}</span>
                <span className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-sm border ${kpi.up ? 'text-paddy bg-paddy/5 border-paddy/10' : 'text-ledger-red bg-ledger-red/5 border-ledger-red/10'}`}>
                  {kpi.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {kpi.trend}
                </span>
              </div>
              <div className="font-mono text-3xl md:text-4xl font-bold text-ink tabular-nums">{kpi.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Report Navigation */}
      <div className="flex overflow-x-auto hide-scrollbar border-b border-brass/20 gap-8 md:gap-12">
        {[
          { id: 'inventory', label: 'Inventory Report', icon: Package },
          { id: 'sales', label: 'Sales Report', icon: ShoppingCart },
          { id: 'purchases', label: 'Purchase Report', icon: Wheat },
          { id: 'financial', label: 'Financial Report', icon: Wallet },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setSearchQuery(''); }}
            className={`flex items-center gap-2 pb-4 font-display uppercase tracking-widest text-sm transition-all whitespace-nowrap border-b-[3px] mb-[-2px] ${activeTab === tab.id ? 'border-brass text-ink font-bold' : 'border-transparent text-ink/40 hover:text-ink/70'}`}
          >
            <tab.icon size={16} className={activeTab === tab.id ? 'text-brass' : ''} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Filters & Table Container */}
      <div className="flex flex-col gap-6 md:gap-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={16} />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              className="w-full pl-11 pr-4 py-3 bg-[#F8F9F3] border border-brass/20 text-sm font-sans rounded-md focus:outline-none focus:border-turmeric focus:ring-1 focus:ring-turmeric/20 transition-all shadow-sm" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[#F8F9F3] border border-brass/20 rounded-md text-sm font-sans text-ink/70 hover:text-ink shadow-sm transition-colors">
            <FileText size={16}/> Filters
          </button>
        </div>

        {/* Mobile Ledger Cards */}
        <div className="md:hidden flex flex-col gap-4">
          {activeTab === 'inventory' && filteredStock.map(item => (
            <div key={item.id} className="bg-[#F8F9F3] border border-brass/20 p-5 rounded-lg shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start border-b border-brass/10 pb-3">
                <div className="font-sans font-medium text-ink flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-variety-${item.varietyId}`} />
                  {item.varietyName}
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded-sm border font-sans uppercase tracking-widest ${item.quantity < item.threshold ? 'text-ledger-red bg-ledger-red/5 border-ledger-red/10' : 'text-paddy bg-paddy/5 border-paddy/10'}`}>
                    {item.quantity < item.threshold ? 'Low' : 'Healthy'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-ink/40 mb-1">Available</span>
                  <span className="font-mono text-lg font-medium text-ink tabular-nums">{item.quantity.toLocaleString()} kg</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-widest text-ink/40 mb-1">Stock Value</span>
                  <span className="font-mono text-sm text-ink/70 tabular-nums">₹{(item.quantity * item.price).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}

          {activeTab === 'sales' && filteredSales.map(item => (
            <div key={item.id} className="bg-[#F8F9F3] border border-brass/20 p-5 rounded-lg shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start border-b border-brass/10 pb-3">
                <div>
                  <div className="text-ink font-bold font-mono">{item.invoice}</div>
                  <div className="text-xs text-ink/50 font-mono mt-1">{item.date}</div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="font-mono text-lg font-bold text-ink tabular-nums">₹{item.amount.toLocaleString()}</div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-sm border font-sans uppercase tracking-widest ${item.status === 'Paid' ? 'text-paddy bg-paddy/5 border-paddy/10' : 'text-turmeric bg-turmeric/10 border-turmeric/20 text-ink'}`}>{item.status}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <div className="font-sans font-medium text-ink/90 text-sm">{item.customer}</div>
                  <div className="text-xs text-ink/50 font-sans">{item.variety}</div>
                </div>
                <div className="text-ink font-mono font-medium text-sm tabular-nums">
                  {item.qty} kg
                </div>
              </div>
            </div>
          ))}

          {activeTab === 'purchases' && filteredPurchases.map(item => (
            <div key={item.id} className="bg-[#F8F9F3] border border-brass/20 p-5 rounded-lg shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start border-b border-brass/10 pb-3">
                <div>
                  <div className="text-ink font-bold font-mono">{item.entry}</div>
                  <div className="text-xs text-ink/50 font-mono mt-1">{item.date}</div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="font-mono text-lg font-bold text-ink tabular-nums">₹{item.amount.toLocaleString()}</div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-sm border font-sans uppercase tracking-widest ${item.status === 'Paid' ? 'text-paddy bg-paddy/5 border-paddy/10' : 'text-turmeric bg-turmeric/10 border-turmeric/20 text-ink'}`}>{item.status}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <div className="font-sans font-medium text-ink/90 text-sm">{item.supplier}</div>
                  <div className="text-xs text-ink/50 font-sans">{item.variety}</div>
                </div>
                <div className="text-ink font-mono font-medium text-sm tabular-nums">
                  {item.qty} kg
                </div>
              </div>
            </div>
          ))}

          {activeTab === 'financial' && (
            <div className="p-16 text-center flex flex-col items-center justify-center gap-4 bg-[#F8F9F3] border border-brass/20 rounded-lg shadow-sm">
              <div className="w-20 h-20 rounded-full bg-ink/5 flex items-center justify-center">
                <Wallet size={32} className="text-brass/40" />
              </div>
              <p className="font-sans text-ink/50 text-sm">Financial reports require end-of-month reconciliation.</p>
            </div>
          )}
        </div>

        {/* Desktop Tables Container */}
        <div className="hidden md:block w-full bg-[#F8F9F3] border border-brass/20 rounded-xl shadow-sm overflow-hidden">
          {activeTab === 'inventory' && (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-ink/[0.02] border-b border-brass/20 font-display uppercase tracking-widest text-ink/50 text-xs">
                <tr>
                  <th className="px-6 py-5 font-medium">Variety</th>
                  <th className="px-6 py-5 font-medium text-right">Available Stock</th>
                  <th className="px-6 py-5 font-medium text-right">Min Level</th>
                  <th className="px-6 py-5 font-medium text-center">Status</th>
                  <th className="px-6 py-5 font-medium text-right">Stock Value</th>
                </tr>
              </thead>
              <tbody>
                {filteredStock.map(item => (
                  <tr key={item.id} className="border-b border-brass/20 border-dotted hover:bg-ink/[0.02] transition-colors even:bg-stone/20 font-mono">
                    <td className="px-6 py-5 font-sans font-medium text-ink/90 flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full bg-variety-${item.varietyId} shadow-sm`} />
                      {item.varietyName}
                    </td>
                    <td className="px-6 py-5 text-right text-ink tabular-nums">{item.quantity.toLocaleString()} <span className="text-xs text-ink/40 ml-1 font-sans">kg</span></td>
                    <td className="px-6 py-5 text-right text-ink/50 tabular-nums">{item.threshold.toLocaleString()} <span className="text-xs text-ink/40 ml-1 font-sans">kg</span></td>
                    <td className="px-6 py-5 text-center">
                      {item.quantity < item.threshold ? (
                        <span className="text-ledger-red text-[10px] bg-ledger-red/5 px-2.5 py-1 rounded-sm border border-ledger-red/10 font-sans uppercase tracking-widest">Low</span>
                      ) : (
                        <span className="text-paddy text-[10px] bg-paddy/5 px-2.5 py-1 rounded-sm border border-paddy/10 font-sans uppercase tracking-widest">Healthy</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right tabular-nums text-ink">₹{(item.quantity * item.price).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'sales' && (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-ink/[0.02] border-b border-brass/20 font-display uppercase tracking-widest text-ink/50 text-xs">
                <tr>
                  <th className="px-6 py-5 font-medium">Invoice No</th>
                  <th className="px-6 py-5 font-medium">Date</th>
                  <th className="px-6 py-5 font-medium">Customer</th>
                  <th className="px-6 py-5 font-medium">Variety</th>
                  <th className="px-6 py-5 font-medium text-right">Qty</th>
                  <th className="px-6 py-5 font-medium text-right">Amount</th>
                  <th className="px-6 py-5 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(item => (
                  <tr key={item.id} className="border-b border-brass/20 border-dotted hover:bg-ink/[0.02] transition-colors even:bg-stone/20 font-mono">
                    <td className="px-6 py-5 text-ink font-bold">{item.invoice}</td>
                    <td className="px-6 py-5 text-ink/60 tabular-nums">{item.date}</td>
                    <td className="px-6 py-5 font-sans text-ink/90">{item.customer}</td>
                    <td className="px-6 py-5 font-sans text-ink/60">{item.variety}</td>
                    <td className="px-6 py-5 text-right tabular-nums text-ink">{item.qty} <span className="text-xs text-ink/40 ml-1 font-sans">kg</span></td>
                    <td className="px-6 py-5 text-right font-medium text-ink tabular-nums">₹{item.amount.toLocaleString()}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={`text-[10px] px-2.5 py-1 rounded-sm border font-sans uppercase tracking-widest ${item.status === 'Paid' ? 'text-paddy bg-paddy/5 border-paddy/10' : 'text-turmeric bg-turmeric/10 border-turmeric/20 text-ink'}`}>{item.status}</span>
                    </td>
                  </tr>
                ))}
                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <div className="p-24 flex flex-col items-center justify-center gap-6 text-ink/40 bg-transparent">
                        <ShoppingCart size={40} className="text-brass/20" />
                        <p className="font-sans text-sm">No sales found for this period. Try changing the selected date range.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          
          {activeTab === 'purchases' && (
             <table className="w-full text-left text-sm border-collapse">
             <thead className="bg-ink/[0.02] border-b border-brass/20 font-display uppercase tracking-widest text-ink/50 text-xs">
               <tr>
                 <th className="px-6 py-5 font-medium">Entry No</th>
                 <th className="px-6 py-5 font-medium">Date</th>
                 <th className="px-6 py-5 font-medium">Supplier</th>
                 <th className="px-6 py-5 font-medium">Variety</th>
                 <th className="px-6 py-5 font-medium text-right">Qty</th>
                 <th className="px-6 py-5 font-medium text-right">Total</th>
                 <th className="px-6 py-5 font-medium text-center">Status</th>
               </tr>
             </thead>
             <tbody>
               {filteredPurchases.map(item => (
                 <tr key={item.id} className="border-b border-brass/20 border-dotted hover:bg-ink/[0.02] transition-colors even:bg-stone/20 font-mono">
                   <td className="px-6 py-5 text-ink font-bold">{item.entry}</td>
                   <td className="px-6 py-5 text-ink/60 tabular-nums">{item.date}</td>
                   <td className="px-6 py-5 font-sans text-ink/90">{item.supplier}</td>
                   <td className="px-6 py-5 font-sans text-ink/60">{item.variety}</td>
                   <td className="px-6 py-5 text-right tabular-nums text-ink">{item.qty} <span className="text-xs text-ink/40 ml-1 font-sans">kg</span></td>
                   <td className="px-6 py-5 text-right font-medium text-ink tabular-nums">₹{item.amount.toLocaleString()}</td>
                   <td className="px-6 py-5 text-center">
                     <span className={`text-[10px] px-2.5 py-1 rounded-sm border font-sans uppercase tracking-widest ${item.status === 'Paid' ? 'text-paddy bg-paddy/5 border-paddy/10' : 'text-turmeric bg-turmeric/10 border-turmeric/20 text-ink'}`}>{item.status}</span>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
          )}

          {activeTab === 'financial' && (
            <div className="p-32 flex flex-col items-center justify-center gap-6 text-ink/40 bg-transparent">
              <Wallet size={40} className="text-brass/20" />
              <p className="font-sans text-sm">Financial reports require end-of-month reconciliation.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
