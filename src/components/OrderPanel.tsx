import { useState } from 'react'
import { motion } from 'framer-motion'
import { Minus, Plus, Trash2, X } from 'lucide-react'
import { addOns } from '../config/commerce'
import { getMenuItem } from '../data/menu'
import { useI18n } from '../i18n'
import { fill } from '../i18n'
import { formatRupiah, lineTotal } from '../lib/money'
import { useOrder } from '../lib/order'
import { buildOrderMessage, waUrl } from '../lib/whatsapp'
import { Dialog } from './ui/Dialog'
import { buttonStyles } from './ui/buttonStyles'

function Stepper({
  value,
  onDecrease,
  onIncrease,
  decreaseLabel,
  increaseLabel,
}: {
  value: number
  onDecrease: () => void
  onIncrease: () => void
  decreaseLabel: string
  increaseLabel: string
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-brass/25">
      <button
        type="button"
        onClick={onDecrease}
        aria-label={decreaseLabel}
        className="inline-flex size-9 items-center justify-center rounded-full text-cream/80 hover:text-brass"
      >
        <Minus size={14} aria-hidden="true" />
      </button>
      <span className="tabular w-7 text-center text-[0.8125rem] text-cream">{value}</span>
      <button
        type="button"
        onClick={onIncrease}
        aria-label={increaseLabel}
        className="inline-flex size-9 items-center justify-center rounded-full text-cream/80 hover:text-brass"
      >
        <Plus size={14} aria-hidden="true" />
      </button>
    </div>
  )
}

export function OrderPanel() {
  const { copy, lang } = useI18n()
  const { lines, bill, count, isOpen, closeOrder, increment, decrement, remove, clear } = useOrder()
  const [name, setName] = useState('')
  const [note, setNote] = useState('')

  const messageLines = lines.map((line) => {
    const item = getMenuItem(line.itemId)
    const addOnLabels = line.addOnIds.map(
      (id) => addOns.find((addOn) => addOn.id === id)?.label[lang] ?? id,
    )
    return {
      name: item?.name ?? line.itemId,
      quantity: line.quantity,
      addOnLabels,
      total: lineTotal(line),
    }
  })

  const message = buildOrderMessage({ lines: messageLines, bill, name, note, lang })

  return (
    <Dialog open={isOpen} onClose={closeOrder} label={copy.order.title} className="z-[70]">
      <div className="pointer-events-none flex size-full items-end justify-center md:items-stretch md:justify-end">
        <motion.div
          initial={{ y: 28, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="pointer-events-auto flex max-h-[88dvh] w-full flex-col rounded-t-2xl border border-brass/20 bg-ink-raised pb-[env(safe-area-inset-bottom)] md:h-full md:max-h-none md:w-[440px] md:rounded-none md:border-y-0 md:border-r-0"
        >
          <header className="flex items-start justify-between gap-4 border-b border-ink-line px-5 py-4">
            <div>
              <h2 className="font-display text-2xl leading-none text-cream">{copy.order.title}</h2>
              <p className="mt-1 text-[0.75rem] text-muted">
                {fill(copy.order.items, { count })}
              </p>
            </div>
            <button
              type="button"
              onClick={closeOrder}
              aria-label={copy.order.close}
              className="inline-flex size-10 items-center justify-center rounded-full text-cream/70 hover:bg-cream/5 hover:text-cream"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5">
            {lines.length === 0 ? (
              <p className="py-10 text-sm leading-relaxed text-muted">{copy.order.empty}</p>
            ) : (
              <ul>
                {lines.map((line) => {
                  const item = getMenuItem(line.itemId)
                  const label = item?.name ?? line.itemId
                  const addOnLabels = line.addOnIds.map(
                    (id) => addOns.find((addOn) => addOn.id === id)?.label[lang] ?? id,
                  )

                  return (
                    <li
                      key={line.key}
                      className="flex gap-3 border-b border-ink-line py-4 last:border-b-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.9375rem] leading-snug text-cream">{label}</p>
                        {addOnLabels.length > 0 ? (
                          <p className="mt-0.5 text-[0.75rem] text-muted">
                            {addOnLabels.join(', ')}
                          </p>
                        ) : null}
                        <div className="mt-2 flex items-center gap-3">
                          <Stepper
                            value={line.quantity}
                            onDecrease={() => decrement(line.key)}
                            onIncrease={() => increment(line.key)}
                            decreaseLabel={fill(copy.order.decrease, { name: label })}
                            increaseLabel={fill(copy.order.increase, { name: label })}
                          />
                          <button
                            type="button"
                            onClick={() => remove(line.key)}
                            aria-label={fill(copy.order.remove, { name: label })}
                            className="inline-flex size-9 items-center justify-center rounded-full text-muted hover:text-terracotta"
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <p className="tabular shrink-0 text-[0.8125rem] text-cream">
                        {formatRupiah(lineTotal(line))}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <footer className="border-t border-ink-line px-5 py-4">
            <div className="grid gap-2">
              <label className="grid gap-1">
                <span className="text-[0.6875rem] tracking-[0.08em] text-muted uppercase">
                  {copy.order.name}
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={copy.order.namePlaceholder}
                  className="field"
                  autoComplete="name"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-[0.6875rem] tracking-[0.08em] text-muted uppercase">
                  {copy.order.note}
                </span>
                <input
                  type="text"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={copy.order.notePlaceholder}
                  className="field"
                />
              </label>
            </div>

            <dl className="mt-4 space-y-1.5 text-[0.8125rem]">
              <div className="flex justify-between text-muted">
                <dt>{copy.order.subtotal}</dt>
                <dd className="tabular">{formatRupiah(bill.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>{copy.order.service}</dt>
                <dd className="tabular">{formatRupiah(bill.service)}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>{copy.order.tax}</dt>
                <dd className="tabular">{formatRupiah(bill.tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-ink-line pt-2 text-cream">
                <dt className="text-sm">{copy.order.total}</dt>
                <dd className="tabular font-mono text-[0.9375rem]">{formatRupiah(bill.total)}</dd>
              </div>
            </dl>

            <p className="mt-3 text-[0.6875rem] leading-relaxed text-muted/90">
              {copy.order.estimate}
            </p>

            <div className="mt-4 grid gap-2">
              {lines.length > 0 ? (
                <a
                  href={waUrl(message)}
                  target="_blank"
                  rel="noreferrer"
                  className={`${buttonStyles('primary', 'dark', 'lg')} w-full`}
                >
                  {copy.order.send}
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className={`${buttonStyles('primary', 'dark', 'lg')} w-full`}
                >
                  {copy.order.send}
                </button>
              )}
              <button
                type="button"
                onClick={clear}
                disabled={lines.length === 0}
                className={`${buttonStyles('quiet', 'dark', 'sm')} w-full`}
              >
                {copy.order.clear}
              </button>
            </div>
          </footer>
        </motion.div>
      </div>
    </Dialog>
  )
}
