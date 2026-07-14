import { useState } from "react"
import { useStock } from "@/data/useStock"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calendar, Download, Printer, Package, ShoppingCart, 
  Wheat, Wallet, Users, TrendingUp, AlertTriangle, 
  FileText, Search, SlidersHorizontal, ArrowDownUp, 
  Columns, Settings2, Share, Lightbulb, ChevronRight, Menu, X
} from "lucide-react"

export function Reports() {
  const { stock } = useStock()
  const [activeReport, setActiveReport] = useState('inventory')
  const [showFilters, setShowFilters] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const reports = [
    { id: 'inventory', label: 'Inventory Report', icon: Package },
    { id: 'sales', label: 'Sales Report', icon: ShoppingCart },
    { id: 'purchases', label: 'Purchase Report', icon: Wheat },
    { id: 'financial', label: 'Financial Report', icon: Wallet },
    { id: 'suppliers', label: 'Supplier Report', icon: Users },
    { id: 'profit', label: 'Profit Analysis', icon: TrendingUp },
    { id: 'low-stock', label: 'Low Stock Report', icon: AlertTriangle },
    { id: 'monthly', label: 'Monthly Summary', icon: FileText },
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

  const activeReportData = reports.find(r => r.id === activeReport)

  return (
    <div className="flex flex-col gap-10 pb-24 max-w-[1600px] mx-auto w-full">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-brass/20 pb-6">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tighter text-ink drop-shadow-stamp">Ledger Reports</h1>
          <p className="font-sans text-ink/60 mt-2">Generate, analyze and export operational business reports.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3 bg-stone-light p-1.5 border border-brass/30 shadow-sm rounded-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 font-mono text-xs md:text-sm text-ink/80 border-r border-brass/20">
            <Calendar size={14} className="text-ink/50" />
            <span>Jul 01 — Jul 14, 2026</span>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-sans font-medium text-ink/70 hover:text-ink hover:bg-ink/5 transition-colors rounded-sm">
            Generate Report
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-sans font-medium text-ink/70 hover:text-ink hover:bg-ink/5 transition-colors rounded-sm border-l border-brass/20 pl-4">
            <Download size={14} /> Export
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-sans font-medium text-ink/70 hover:text-ink hover:bg-ink/5 transition-colors rounded-sm">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* 2. Report Overview Cover */}
      <div className="w-full bg-[#F8F9F3] border-y-2 border-brass/40 shadow-sm overflow-x-auto hide-scrollbar">
        <div className="flex items-center divide-x divide-brass/20 min-w-max">
          <div className="py-6 px-8 flex flex-col justify-center bg-ink/5">
            <span className="font-display text-sm tracking-widest uppercase text-ink/40 mb-1">Report Summary</span>
            <span className="font-sans font-medium text-ink">July 1 — July 14</span>
          </div>
          <div className="py-6 px-8 flex flex-col justify-center min-w-[200px]">
            <span className="font-sans text-xs tracking-wider uppercase text-ink/50 mb-2">Inventory Value</span>
            <span className="font-mono text-2xl font-bold text-ink tabular-nums">₹11,24,500</span>
          </div>
          <div className="py-6 px-8 flex flex-col justify-center min-w-[200px]">
            <span className="font-sans text-xs tracking-wider uppercase text-ink/50 mb-2">Revenue</span>
            <span className="font-mono text-2xl font-bold text-ink tabular-nums">₹8,45,000</span>
          </div>
          <div className="py-6 px-8 flex flex-col justify-center min-w-[200px]">
            <span className="font-sans text-xs tracking-wider uppercase text-ink/50 mb-2">Purchases</span>
            <span className="font-mono text-2xl font-bold text-ink tabular-nums">₹5,12,000</span>
          </div>
          <div className="py-6 px-8 flex flex-col justify-center min-w-[200px]">
            <span className="font-sans text-xs tracking-wider uppercase text-ink/50 mb-2">Net Profit</span>
            <span className="font-mono text-2xl font-bold text-paddy tabular-nums">₹2,08,000</span>
          </div>
          <div className="py-6 px-8 flex flex-col justify-center min-w-[180px]">
            <span className="font-sans text-xs tracking-wider uppercase text-ink/50 mb-2">Generated</span>
            <span className="font-mono text-sm text-ink/80 tabular-nums">Today 10:30 AM</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full items-start relative">
        
        {/* Mobile Library Toggle */}
        <div className="lg:hidden w-full flex items-center justify-between bg-[#F8F9F3] border border-brass/30 p-4 shadow-sm">
          <div className="flex items-center gap-3 font-display uppercase tracking-wider text-ink">
            {activeReportData?.icon && <activeReportData.icon size={18} className="text-turmeric" />}
            {activeReportData?.label}
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-ink/5 text-ink">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* 3. Left Panel - Report Library */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block w-full lg:w-72 shrink-0 bg-stone/50 border border-brass/20 p-6 shadow-sm sticky top-24`}>
          <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-ink/40 mb-6 px-3">Report Library</h3>
          <div className="flex flex-col gap-1">
            {reports.map((report) => {
              const isActive = activeReport === report.id
              return (
                <button
                  key={report.id}
                  onClick={() => { setActiveReport(report.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-sans transition-all border-l-2 ${
                    isActive 
                      ? 'border-brass bg-[#F8F9F3] text-ink font-semibold shadow-sm' 
                      : 'border-transparent text-ink/60 hover:text-ink hover:bg-[#F8F9F3]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <report.icon size={16} className={isActive ? 'text-brass' : 'text-ink/40'} />
                    <span>{report.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-brass/50" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* 4. Main Workspace (Document Viewer) */}
        <div className="flex-1 w-full flex flex-col items-center">
          
          <motion.div 
            key={activeReport}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-[1000px] bg-[#F8F9F3] border border-brass/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[800px] relative overflow-hidden"
          >
            {/* Document Header */}
            <div className="px-8 md:px-16 pt-16 pb-8 border-b-2 border-brass/20 border-dotted">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="font-display text-3xl uppercase tracking-tighter text-ink mb-3">{activeReportData?.label}</h2>
                  <p className="font-sans text-ink/60 max-w-lg leading-relaxed">
                    Detailed breakdown of {activeReportData?.label.toLowerCase()} across all active warehouses. Records are verified and audited.
                  </p>
                </div>
                <div className="w-16 h-16 border-4 border-brass/20 rounded-full flex items-center justify-center opacity-30">
                  {activeReportData?.icon && <activeReportData.icon size={24} className="text-ink" />}
                </div>
              </div>

              {/* Document Summary */}
              {activeReport === 'inventory' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-4">
                  <div className="flex flex-col">
                    <span className="font-sans text-xs tracking-widest uppercase text-ink/40 mb-1">Current Stock</span>
                    <span className="font-mono text-xl font-medium text-ink tabular-nums">17,200 <span className="text-xs font-sans text-ink/50">kg</span></span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans text-xs tracking-widest uppercase text-ink/40 mb-1">Stock Value</span>
                    <span className="font-mono text-xl font-medium text-ink tabular-nums">₹11,24,500</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans text-xs tracking-widest uppercase text-ink/40 mb-1">Critical Items</span>
                    <span className="font-mono text-xl font-medium text-ledger-red tabular-nums">1 <span className="text-xs font-sans text-ledger-red/50">varieties</span></span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans text-xs tracking-widest uppercase text-ink/40 mb-1">Warehouse Count</span>
                    <span className="font-mono text-xl font-medium text-ink tabular-nums">2 <span className="text-xs font-sans text-ink/50">active</span></span>
                  </div>
                </div>
              )}
            </div>

            {/* Document Toolbar */}
            <div className="px-4 md:px-16 py-4 bg-ink/[0.02] border-b border-brass/20 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search records..." 
                    className="w-full pl-9 pr-4 py-2 bg-[#F8F9F3] border border-brass/30 text-xs font-sans focus:outline-none focus:border-brass rounded-sm shadow-sm"
                  />
                </div>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center justify-center w-9 h-9 border rounded-sm transition-colors shadow-sm ${showFilters ? 'bg-ink text-stone border-ink' : 'bg-[#F8F9F3] border-brass/30 text-ink/70 hover:text-ink'}`}
                >
                  <SlidersHorizontal size={14} />
                </button>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar">
                <button className="flex items-center gap-2 px-3 py-2 text-xs font-sans text-ink/60 hover:text-ink hover:bg-ink/5 rounded-sm transition-colors">
                  <ArrowDownUp size={14} /> Sort
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-xs font-sans text-ink/60 hover:text-ink hover:bg-ink/5 rounded-sm transition-colors">
                  <Columns size={14} /> Columns
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-xs font-sans text-ink/60 hover:text-ink hover:bg-ink/5 rounded-sm transition-colors">
                  <Settings2 size={14} /> Density
                </button>
                <div className="w-px h-4 bg-brass/30 mx-2" />
                <button className="flex items-center gap-2 px-3 py-2 text-xs font-sans text-ink/60 hover:text-ink hover:bg-ink/5 rounded-sm transition-colors">
                  <Share size={14} /> Share
                </button>
              </div>
            </div>

            {/* Collapsible Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-[#F8F9F3] border-b border-brass/20 overflow-hidden"
                >
                  <div className="px-8 md:px-16 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-sans font-medium text-ink/60">Rice Variety</label>
                      <select className="w-full p-2 bg-stone-light border border-brass/30 text-xs font-sans rounded-sm focus:outline-none">
                        <option>All Varieties</option>
                        <option>Ponni Boiled</option>
                        <option>Sona Masuri</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-sans font-medium text-ink/60">Warehouse</label>
                      <select className="w-full p-2 bg-stone-light border border-brass/30 text-xs font-sans rounded-sm focus:outline-none">
                        <option>All Warehouses</option>
                        <option>Main Godown</option>
                        <option>Secondary Unit</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-sans font-medium text-ink/60">Stock Status</label>
                      <select className="w-full p-2 bg-stone-light border border-brass/30 text-xs font-sans rounded-sm focus:outline-none">
                        <option>All Status</option>
                        <option>Healthy</option>
                        <option>Low Stock</option>
                      </select>
                    </div>
                    <div className="flex items-end gap-2">
                      <button className="flex-1 py-2 bg-turmeric text-ink font-display text-xs uppercase tracking-widest shadow-sm border border-turmeric rounded-sm">Apply</button>
                      <button onClick={() => setShowFilters(false)} className="px-4 py-2 bg-transparent text-ink/60 font-sans text-xs border border-brass/30 hover:bg-ink/5 rounded-sm">Reset</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Document Data Table */}
            <div className="w-full overflow-x-auto pb-12">
              {activeReport === 'inventory' && (
                <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                  <thead className="bg-[#F8F9F3] border-b-2 border-brass/40 font-display uppercase tracking-widest text-ink/60 text-[11px]">
                    <tr>
                      <th className="px-8 md:px-16 py-6 font-medium">Variety</th>
                      <th className="px-6 py-6 font-medium text-right">Available Stock</th>
                      <th className="px-6 py-6 font-medium text-right">Min Level</th>
                      <th className="px-6 py-6 font-medium text-center">Status</th>
                      <th className="px-8 md:px-16 py-6 font-medium text-right">Stock Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock.map(item => (
                      <tr key={item.id} className="border-b border-brass/20 border-dotted hover:bg-ink/[0.02] transition-colors font-mono even:bg-stone/20">
                        <td className="px-8 md:px-16 py-5 font-sans font-medium text-ink/90 flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full bg-variety-${item.varietyId} shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]`} />
                          {item.varietyName}
                        </td>
                        <td className="px-6 py-5 text-right text-ink tabular-nums">{item.quantity.toLocaleString()} <span className="text-xs text-ink/40 ml-1 font-sans">kg</span></td>
                        <td className="px-6 py-5 text-right text-ink/50 tabular-nums">{item.threshold.toLocaleString()} <span className="text-xs text-ink/40 ml-1 font-sans">kg</span></td>
                        <td className="px-6 py-5 text-center">
                          {item.quantity < item.threshold ? (
                            <span className="text-ledger-red text-[10px] bg-transparent px-0 font-sans uppercase tracking-widest font-bold flex items-center justify-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-ledger-red animate-pulse"/> Low
                            </span>
                          ) : (
                            <span className="text-paddy text-[10px] bg-transparent px-0 font-sans uppercase tracking-widest font-bold flex items-center justify-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-paddy"/> Healthy
                            </span>
                          )}
                        </td>
                        <td className="px-8 md:px-16 py-5 text-right tabular-nums text-ink font-medium">₹{(item.quantity * item.price).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeReport === 'sales' && (
                <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                  <thead className="bg-[#F8F9F3] border-b-2 border-brass/40 font-display uppercase tracking-widest text-ink/60 text-[11px]">
                    <tr>
                      <th className="px-8 md:px-16 py-6 font-medium">Invoice No</th>
                      <th className="px-6 py-6 font-medium">Date</th>
                      <th className="px-6 py-6 font-medium">Customer</th>
                      <th className="px-6 py-6 font-medium">Variety</th>
                      <th className="px-6 py-6 font-medium text-right">Qty</th>
                      <th className="px-6 py-6 font-medium text-right">Amount</th>
                      <th className="px-8 md:px-16 py-6 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map(item => (
                      <tr key={item.id} className="border-b border-brass/20 border-dotted hover:bg-ink/[0.02] transition-colors font-mono even:bg-stone/20">
                        <td className="px-8 md:px-16 py-5 text-ink font-bold">{item.invoice}</td>
                        <td className="px-6 py-5 text-ink/60 tabular-nums">{item.date}</td>
                        <td className="px-6 py-5 font-sans text-ink/90">{item.customer}</td>
                        <td className="px-6 py-5 font-sans text-ink/60">{item.variety}</td>
                        <td className="px-6 py-5 text-right tabular-nums text-ink">{item.qty} <span className="text-xs text-ink/40 ml-1 font-sans">kg</span></td>
                        <td className="px-6 py-5 text-right font-medium text-ink tabular-nums">₹{item.amount.toLocaleString()}</td>
                        <td className="px-8 md:px-16 py-5 text-center">
                           <span className={`text-[10px] font-sans uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 ${item.status === 'Paid' ? 'text-paddy' : 'text-turmeric'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Paid' ? 'bg-paddy' : 'bg-turmeric'}`}/> {item.status}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeReport === 'purchases' && (
                <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                  <thead className="bg-[#F8F9F3] border-b-2 border-brass/40 font-display uppercase tracking-widest text-ink/60 text-[11px]">
                    <tr>
                      <th className="px-8 md:px-16 py-6 font-medium">Entry No</th>
                      <th className="px-6 py-6 font-medium">Date</th>
                      <th className="px-6 py-6 font-medium">Supplier</th>
                      <th className="px-6 py-6 font-medium">Variety</th>
                      <th className="px-6 py-6 font-medium text-right">Qty</th>
                      <th className="px-6 py-6 font-medium text-right">Total</th>
                      <th className="px-8 md:px-16 py-6 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map(item => (
                      <tr key={item.id} className="border-b border-brass/20 border-dotted hover:bg-ink/[0.02] transition-colors font-mono even:bg-stone/20">
                        <td className="px-8 md:px-16 py-5 text-ink font-bold">{item.entry}</td>
                        <td className="px-6 py-5 text-ink/60 tabular-nums">{item.date}</td>
                        <td className="px-6 py-5 font-sans text-ink/90">{item.supplier}</td>
                        <td className="px-6 py-5 font-sans text-ink/60">{item.variety}</td>
                        <td className="px-6 py-5 text-right tabular-nums text-ink">{item.qty} <span className="text-xs text-ink/40 ml-1 font-sans">kg</span></td>
                        <td className="px-6 py-5 text-right font-medium text-ink tabular-nums">₹{item.amount.toLocaleString()}</td>
                        <td className="px-8 md:px-16 py-5 text-center">
                           <span className={`text-[10px] font-sans uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 ${item.status === 'Paid' ? 'text-paddy' : 'text-turmeric'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Paid' ? 'bg-paddy' : 'bg-turmeric'}`}/> {item.status}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Placeholder for other reports */}
              {!['inventory', 'sales', 'purchases'].includes(activeReport) && (
                <div className="px-16 py-32 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-stone rounded-full flex items-center justify-center mb-6">
                    {activeReportData?.icon && <activeReportData.icon size={32} className="text-brass/30" />}
                  </div>
                  <h3 className="font-display text-xl uppercase tracking-wider text-ink mb-2">Report Not Available</h3>
                  <p className="font-sans text-ink/50 max-w-sm">This specific business report requires an enterprise module activation or end-of-month reconciliation to view data.</p>
                </div>
              )}
            </div>


          </motion.div>
        </div>
      </div>
    </div>
  )
}
