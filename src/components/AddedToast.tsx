import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { getMenuItem } from '../data/menu'
import { useI18n } from '../i18n'
import { fill } from '../i18n'
import { useOrder } from '../lib/order'

export function AddedToast() {
  const { copy } = useI18n()
  const { lastAdded, openOrder } = useOrder()
  const [dismissedToken, setDismissedToken] = useState(0)
  const token = lastAdded?.token ?? 0
  const visible = Boolean(lastAdded) && dismissedToken !== token

  useEffect(() => {
    if (!lastAdded) return
    const timer = window.setTimeout(() => setDismissedToken(lastAdded.token), 2600)
    return () => window.clearTimeout(timer)
  }, [lastAdded])

  const name = lastAdded ? (getMenuItem(lastAdded.itemId)?.name ?? '') : ''

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[65] flex justify-center px-4"
    >
      <AnimatePresence>
        {visible && lastAdded ? (
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="pointer-events-auto flex items-center gap-3 rounded-full border border-brass/25 bg-ink-raised/95 py-2 pr-2 pl-4 shadow-[0_14px_36px_rgb(0_0_0/0.45)]"
          >
            <Check size={15} aria-hidden="true" className="text-brass" />
            <span className="text-[0.8125rem] text-cream">
              {fill(copy.order.justAdded, { name })}
            </span>
            <button
              type="button"
              onClick={openOrder}
              className="min-h-9 rounded-full bg-terracotta px-3 text-[0.75rem] font-medium text-ink"
            >
              {copy.order.viewOrder}
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
