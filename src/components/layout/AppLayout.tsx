import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Wheat, Users, ArrowDownToLine, ArrowUpFromLine, Layers, PieChart, LogOut } from 'lucide-react'

function Ticker() {
  return (
    <div className="bg-ink text-stone border-b border-brass flex items-center justify-between px-4 md:px-6 py-4 overflow-hidden">
      <div className="flex gap-8 md:gap-12 overflow-x-auto snap-x snap-mandatory hide-scrollbar w-full md:w-auto flex-1">
        <div className="flex flex-col snap-start shrink-0 w-[85vw] md:w-auto">
          <span className="text-[10px] uppercase tracking-widest text-stone/70 mb-1 transform origin-left">Total Rice Stock</span>
          <span className="font-mono text-3xl text-paddy">17,200 <span className="text-sm text-stone/50">kg</span></span>
        </div>
        <div className="hidden md:block w-px bg-brass/30 h-10 shrink-0" />
        <div className="flex flex-col snap-start shrink-0 w-[85vw] md:w-auto">
          <span className="text-[10px] uppercase tracking-widest text-stone/70 mb-1 transform origin-left">Total Purchases</span>
          <span className="font-mono text-3xl">42,500 <span className="text-sm text-stone/50">kg</span></span>
        </div>
        <div className="hidden md:block w-px bg-brass/30 h-10 shrink-0" />
        <div className="flex flex-col snap-start shrink-0 w-[85vw] md:w-auto">
          <span className="text-[10px] uppercase tracking-widest text-stone/70 mb-1 transform origin-left">Total Sales</span>
          <span className="font-mono text-3xl">25,300 <span className="text-sm text-stone/50">kg</span></span>
        </div>
      </div>
      <div className="text-right shrink-0 pl-4 border-l border-brass/30 ml-4 flex items-center gap-4">
        <div className="hidden md:block">
          <div className="font-display text-xl uppercase tracking-tighter text-stone">Mandi Board</div>
          <div className="font-mono text-xs text-stone/50">v1.0.0</div>
        </div>
        <Link to="/login" className="text-stone hover:text-ledger-red transition-colors md:hidden">
          <LogOut size={20} />
        </Link>
      </div>
    </div>
  )
}

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/stock', label: 'Stock', icon: Wheat },
  { path: '/purchases', label: 'Purchases', icon: ArrowDownToLine },
  { path: '/sales', label: 'Sales', icon: ArrowUpFromLine },
  { path: '/inventory', label: 'Inventory', icon: Layers, mobileHidden: true },
  { path: '/suppliers', label: 'Suppliers', icon: Users, mobileHidden: true },
  { path: '/reports', label: 'Reports', icon: PieChart },
]

function LedgerIndex() {
  const location = useLocation()
  
  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex w-64 border-r border-brass/20 flex-col pt-6 pb-6 h-[calc(100vh-80px)] bg-stone">
        <div className="px-6 mb-8">
          <h2 className="font-display text-ink uppercase tracking-tight text-xl drop-shadow-stamp origin-left inline-block">Ledger Index</h2>
        </div>
        <div className="flex-1 flex flex-col gap-1 pr-4">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "py-3 px-6 relative group transition-colors flex items-center gap-3",
                  isActive ? "text-ink font-medium" : "text-ink/60 hover:text-ink"
                )}
              >
                {isActive && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-turmeric rounded-l-sm" />
                )}
                <item.icon size={18} className={isActive ? "text-turmeric" : ""} />
                {item.label}
              </Link>
            )
          })}
        </div>
        <div className="px-6 pb-4">
          <Link to="/login" className="py-2 flex items-center gap-3 text-ledger-red/80 hover:text-ledger-red transition-colors">
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </Link>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-stone border-t border-brass/20 z-40 pb-safe">
        <div className="flex justify-around items-center h-16">
          {NAV_ITEMS.filter(item => !item.mobileHidden).map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative",
                  isActive ? "text-turmeric" : "text-ink/50"
                )}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-turmeric rounded-b-sm" />
                )}
                <item.icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  if (location.pathname === '/login') return <>{children}</>

  return (
    <div className="min-h-screen flex flex-col bg-stone">
      <Ticker />
      <div className="flex flex-1 overflow-hidden">
        <LedgerIndex />
        <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
