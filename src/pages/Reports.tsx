import { useState } from "react"
import { StampHeader } from "@/components/ui/StampHeader"
import { Button } from "@/components/ui/Button"
import { useStock } from "@/data/useStock"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Calendar, Download, Printer, BarChart as BarChartIcon } from "lucide-react"

// Hardcoded token colors for recharts
const CHIP_COLORS = {
  ponni: "#F3EFE2",
  sona: "#B9723A",
  basmati: "#C9A227",
  idli: "#A85A3A",
  black: "#3E2A3E",
  brown: "#5B4530"
}

export function Reports() {
  const [activeTab, setActiveTab] = useState<'stock' | 'purchase' | 'sales'>('stock')
  const { stock } = useStock()

  const chartData = stock.map(s => ({
    name: s.varietyName,
    varietyId: s.varietyId,
    stock: s.quantity,
    value: s.quantity * s.price
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-stone-light border border-ink p-3 shadow-[2px_2px_0px_0px_rgba(20,32,26,1)] font-mono text-sm">
          <p className="font-sans font-medium text-ink mb-1">{label}</p>
          <p className="text-ink">Qty: {payload[0].value.toLocaleString()} kg</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <StampHeader title="Ledger Reports" />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="gap-2 flex-1 md:flex-none justify-center"><Printer size={16} /> Print</Button>
          <Button variant="secondary" className="gap-2 flex-1 md:flex-none justify-center"><Download size={16} /> Export CSV</Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between items-stretch md:items-center bg-stone border border-brass/30 p-2 shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)] gap-2 md:gap-0">
        <div className="flex overflow-x-auto hide-scrollbar">
          {['stock', 'purchase', 'sales'].map((tab) => (
            <button
              key={tab}
              className={`px-4 md:px-6 py-2 text-sm font-medium uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-ink text-stone' : 'hover:bg-ink/5 text-ink/70 hover:text-ink'}`}
              onClick={() => setActiveTab(tab as any)}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex justify-between items-center gap-2 px-4 py-2 bg-ink/5 border border-ink/20 font-mono text-xs md:text-sm group cursor-pointer hover:border-ink/50 transition-colors shrink-0">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-ink/60 group-hover:text-ink" />
            <span>Jul 01, 2026 - Jul 14, 2026</span>
          </div>
        </div>
      </div>

      <div className="bg-stone-light p-4 md:p-6 border md:border-brass/30 shadow-[4px_4px_0px_0px_rgba(140,111,62,0.2)]">
        <h3 className="font-display uppercase tracking-wider text-xl mb-6 md:mb-8 border-b border-brass/20 pb-4">
          {activeTab === 'stock' ? 'Current Stock Volume by Variety' : activeTab === 'purchase' ? 'Purchase Volume Trend' : 'Sales Volume Trend'}
        </h3>
        
        <div className="w-full">
          {/* Desktop Chart */}
          <div className="hidden md:block h-96">
            {activeTab === 'stock' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData.slice(0, 5)} // Cap at 5 on desktop too for clarity or just show all
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#8C6F3E" strokeOpacity={0.2} vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontFamily: 'Inter', fontSize: 12, fill: '#14201A'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontFamily: 'JetBrains Mono', fontSize: 12, fill: '#14201A'}} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#14201A', opacity: 0.05}} />
                  <Bar dataKey="stock" radius={[2, 2, 0, 0]}>
                    {chartData.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHIP_COLORS[entry.varietyId]} stroke="#14201A" strokeWidth={1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center font-sans text-ink/50 flex-col gap-2">
                <div className="w-16 h-16 border-2 border-dashed border-ink/20 rounded-full flex items-center justify-center">
                  <BarChartIcon size={24} className="text-ink/30" />
                </div>
                <p>Detailed {activeTab} trend visualization requires more historical data.</p>
              </div>
            )}
          </div>

          {/* Mobile Chart - Horizontal, Explicit Height, Max 5 */}
          <div className="md:hidden" style={{ height: '280px' }}>
            {activeTab === 'stock' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData.slice(0, 5)}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#8C6F3E" strokeOpacity={0.2} horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fontFamily: 'JetBrains Mono', fontSize: 10, fill: '#14201A'}} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontFamily: 'Inter', fontSize: 11, fill: '#14201A'}} width={100} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#14201A', opacity: 0.05}} />
                  <Bar dataKey="stock" radius={[0, 2, 2, 0]} barSize={24}>
                    {chartData.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHIP_COLORS[entry.varietyId]} stroke="#14201A" strokeWidth={1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center font-sans text-ink/50 flex-col gap-2 border border-brass/10">
                <BarChartIcon size={24} className="text-ink/30" />
                <p className="text-sm">More historical data needed.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
