import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
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
            initial={{ y: "100%", x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: "100%", x: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 top-16 md:inset-y-0 md:left-auto md:right-0 md:top-0 w-full md:max-w-md bg-[#F8F9F3] border-t-2 md:border-t-0 md:border-l-2 border-brass/50 shadow-2xl z-50 flex flex-col rounded-t-2xl md:rounded-t-none"
          >
            <div className="flex items-center justify-between p-6 border-b border-brass/20">
              <h2 className="font-display text-xl md:text-2xl uppercase tracking-tight text-ink drop-shadow-stamp">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-ink/70 hover:text-ink hover:bg-brass/10 transition-colors rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
