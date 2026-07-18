import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Download, Printer, Check, Clock, AlertCircle, AlertTriangle } from "lucide-react"

interface DetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  actions?: React.ReactNode
}

export function DetailDrawer({ isOpen, onClose, title, subtitle, children, actions }: DetailDrawerProps) {
  // Close on Escape key
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/20 backdrop-blur-[1px] z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed inset-y-0 right-0 w-full md:w-[52%] lg:w-[45%] bg-[#F8F9F3] border-l-2 border-brass/50 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-brass/20 bg-ink/5 shrink-0">
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-lg md:text-xl uppercase tracking-tight text-ink drop-shadow-stamp truncate">
                  {title}
                </h2>
                {subtitle && (
                  <div className="text-xs font-mono text-ink/50 mt-0.5 truncate">{subtitle}</div>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                {actions}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-ink/70 hover:text-ink hover:bg-brass/10 transition-colors rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/** A compact info row used inside detail drawers */
export function DetailRow({ label, value, mono = false, className = '' }: { label: string; value?: React.ReactNode; mono?: boolean; className?: string }) {
  return (
    <div className={`flex justify-between items-start py-2.5 border-b border-brass/10 last:border-0 ${className}`}>
      <span className="text-xs uppercase tracking-wider text-ink/50 font-sans font-semibold shrink-0 mr-4">{label}</span>
      <span className={`text-sm text-ink font-medium text-right ${mono ? 'font-mono' : ''}`}>{value ?? '-'}</span>
    </div>
  )
}

/** Status badge */
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PAID: 'text-paddy bg-paddy/10 border-paddy/20',
    PENDING: 'text-turmeric bg-turmeric/10 border-turmeric/20',
    UNPAID: 'text-turmeric bg-turmeric/10 border-turmeric/20',
    PARTIAL: 'text-blue-600 bg-blue-50 border-blue-200',
    OVERDUE: 'text-ledger-red bg-ledger-red/10 border-ledger-red/20',
  }
  const cls = map[status] ?? 'text-ink/60 bg-ink/5 border-ink/10'
  const displayStatus = status === 'PENDING' ? 'UNPAID' : status

  const getIcon = () => {
    switch (status) {
      case 'PAID':
        return <Check size={11} className="mr-1 shrink-0" />
      case 'PENDING':
      case 'UNPAID':
        return <Clock size={11} className="mr-1 shrink-0" />
      case 'PARTIAL':
        return <AlertCircle size={11} className="mr-1 shrink-0" />
      case 'OVERDUE':
        return <AlertTriangle size={11} className="mr-1 shrink-0" />
      default:
        return null
    }
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm border text-[10px] font-sans uppercase tracking-widest font-bold ${cls}`}>
      {getIcon()}
      {displayStatus}
    </span>
  )
}

/** Section heading inside a drawer */
export function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-0">
      <div className="px-5 py-2 bg-ink/5 border-b border-brass/20 text-[10px] font-sans uppercase tracking-widest font-bold text-ink/50">
        {title}
      </div>
      <div className="px-5 py-3">{children}</div>
    </div>
  )
}

/** Export/print action buttons row */
export function DrawerActionBar({ onPrint, onDownload, onEdit }: { onPrint?: () => void; onDownload?: () => void; onEdit?: () => void }) {
  return (
    <div className="flex gap-2">
      {onEdit && (
        <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium border border-brass/40 text-ink hover:bg-turmeric/10 transition-colors rounded-sm">
          Edit
        </button>
      )}
      {onPrint && (
        <button onClick={onPrint} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium border border-brass/40 text-ink/70 hover:bg-ink/5 transition-colors rounded-sm">
          <Printer size={13} /> Print
        </button>
      )}
      {onDownload && (
        <button onClick={onDownload} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium border border-brass/40 text-ink/70 hover:bg-ink/5 transition-colors rounded-sm">
          <Download size={13} /> Download
        </button>
      )}
    </div>
  )
}
