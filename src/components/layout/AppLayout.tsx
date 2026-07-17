import type { ReactNode } from 'react'
import { Link, useLocation, Navigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Wheat, Users, ArrowDownToLine, ArrowUpFromLine, Layers, PieChart, LogOut, Truck, Settings as SettingsIcon, Menu } from 'lucide-react'
import { useState } from 'react'
import { Drawer } from '@/components/ui/Drawer'

import { useDashboard } from '@/data/useDashboard'
import { useAuth } from '@/contexts/AuthContext'

function Ticker() {
  const { summary } = useDashboard()
  const { logout } = useAuth()

  return (
    <div className="bg-ink text-stone border-b border-brass flex items-center justify-between px-4 md:px-6 py-4 overflow-hidden">
      <div className="flex gap-8 md:gap-12 overflow-x-auto snap-x snap-mandatory hide-scrollbar w-full md:w-auto flex-1">
        <div className="flex flex-col snap-start shrink-0 w-[85vw] md:w-auto">
          <span className="text-[10px] uppercase tracking-widest text-stone/70 mb-1 transform origin-left">Total Rice Stock</span>
          <span className="font-mono text-3xl text-paddy">{(summary?.kpis?.totalStockKg || 0).toLocaleString()} <span className="text-sm text-stone/50">kg</span></span>
        </div>
        <div className="hidden md:block w-px bg-brass/30 h-10 shrink-0" />
        <div className="flex flex-col snap-start shrink-0 w-[85vw] md:w-auto">
          <span className="text-[10px] uppercase tracking-widest text-stone/70 mb-1 transform origin-left">Total Purchases</span>
          <span className="font-mono text-3xl">₹{(summary?.kpis?.totalPurchaseValue || 0).toLocaleString()}</span>
        </div>
        <div className="hidden md:block w-px bg-brass/30 h-10 shrink-0" />
        <div className="flex flex-col snap-start shrink-0 w-[85vw] md:w-auto">
          <span className="text-[10px] uppercase tracking-widest text-stone/70 mb-1 transform origin-left">Total Sales</span>
          <span className="font-mono text-3xl">₹{(summary?.kpis?.totalSaleValue || 0).toLocaleString()}</span>
        </div>
      </div>
      <div className="shrink-0 pl-4 border-l border-brass/30 ml-4 flex items-center gap-4">
        <div className="hidden md:block text-right">
          <div className="font-display text-xl uppercase tracking-tighter text-stone">Mandi Board</div>
          <div className="font-mono text-xs text-stone/50">v1.2.0</div>
        </div>
        <div className="flex items-center gap-4 md:border-l md:border-brass/30 md:pl-4 md:ml-2">
          <Link to="/settings" className="text-stone hover:text-turmeric transition-colors" title="Settings">
            <SettingsIcon size={20} />
          </Link>
          <button onClick={logout} className="text-stone hover:text-ledger-red transition-colors" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Operations',
    items: [
      { path: '/stock', label: 'Stock', icon: Wheat },
      { path: '/purchases', label: 'Purchases', icon: ArrowDownToLine },
      { path: '/sales', label: 'Sales', icon: ArrowUpFromLine },
    ]
  },
  {
    label: 'Entities',
    items: [
      { path: '/customers', label: 'Customers', icon: Users },
      { path: '/suppliers', label: 'Suppliers', icon: Truck },
    ]
  },
  {
    label: 'Management',
    items: [
      { path: '/inventory', label: 'Inventory', icon: Layers, mobileHidden: true },
      { path: '/reports', label: 'Reports', icon: PieChart },
    ]
  }
]

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap(g => g.items)

function LedgerIndex() {
  const location = useLocation()
  const { logout } = useAuth()
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  const visibleMobileItems = ALL_NAV_ITEMS.slice(0, 4)
  const hiddenMobileItems = ALL_NAV_ITEMS.slice(4).filter(i => !i.mobileHidden)

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex w-56 border-r border-brass/20 flex-col pt-8 pb-8 h-full bg-stone overflow-y-auto hide-scrollbar">
        <div className="px-8 mb-10 flex flex-col gap-3">
          <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain bg-white rounded-md p-1 border border-brass/20" />
          <h2 className="font-display text-ink uppercase tracking-tight text-xl drop-shadow-stamp origin-left inline-block">Ledger Index</h2>
        </div>
        <div className="flex-1 flex flex-col gap-1 pb-4">
          {NAV_GROUPS.map((group, gIdx) => (
            <div key={group.label} className={cn("flex flex-col gap-1", gIdx > 0 && "mt-4")}>
              <div className="px-8 mb-1 text-[10px] font-display uppercase tracking-widest text-ink/40">{group.label}</div>
              {group.items.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "py-2 px-8 relative group transition-all flex items-center gap-4",
                      isActive ? "text-ink font-display uppercase tracking-widest text-sm bg-ink/5" : "text-ink/60 hover:text-ink font-sans text-sm hover:bg-ink/5"
                    )}
                  >
                    <item.icon size={16} className={isActive ? "text-turmeric" : ""} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-stone border-t border-brass/20 z-40 pb-safe">
        <div className="flex justify-around items-center h-16">
          {visibleMobileItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-[20%] h-full gap-1 transition-colors relative",
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

          <button
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center justify-center w-[20%] h-full gap-1 transition-colors relative text-ink/50"
          >
            <Menu size={20} />
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </nav>

      <Drawer isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} title="Menu">
        <div className="flex flex-col gap-2 pb-6">
          {hiddenMobileItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMoreOpen(false)}
                className={cn(
                  "flex items-center gap-4 py-4 px-2 border-b border-brass/10 transition-colors",
                  isActive ? "text-turmeric" : "text-ink/70"
                )}
              >
                <item.icon size={20} />
                <span className="font-medium text-sm tracking-wide uppercase font-display">{item.label}</span>
              </Link>
            )
          })}
          <button
            onClick={() => { setIsMoreOpen(false); logout(); }}
            className="flex items-center gap-4 py-4 px-2 transition-colors text-ledger-red/70 hover:text-ledger-red mt-4"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm tracking-wide uppercase font-display">Logout</span>
          </button>
        </div>
      </Drawer>
    </>
  )
}

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  if (location.pathname === '/login') return <>{children}</>
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />

  return (
    <div className="h-screen w-full flex flex-col bg-stone overflow-hidden">
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
