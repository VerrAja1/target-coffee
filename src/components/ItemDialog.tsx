import { useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import { addOns } from '../config/commerce'
import { getMenuItem } from '../data/menu'
import type { AddOnId } from '../data/menu.types'
import { useI18n } from '../i18n'
import { formatRupiah } from '../lib/money'
import { useOrder } from '../lib/order'
import { Dialog } from './ui/Dialog'
import { buttonStyles } from './ui/buttonStyles'

interface ItemDialogProps {
  itemId: string | null
  onClose: () => void
}

export function ItemDialog({ itemId, onClose }: ItemDialogProps) {
  const { copy, lang } = useI18n()
  const { addItem } = useOrder()
  const item = itemId ? getMenuItem(itemId) : undefined
  const [quantity, setQuantity] = useState(1)
  const [selected, setSelected] = useState<AddOnId[]>([])

  const availableAddOns = addOns.filter((addOn) => item?.addOns?.includes(addOn.id))
  const addOnTotal = availableAddOns
    .filter((addOn) => selected.includes(addOn.id))
    .reduce((sum, addOn) => sum + addOn.price, 0)
  const total = item ? (item.price + addOnTotal) * quantity : 0

  const toggleAddOn = (id: AddOnId) => {
    setSelected((previous) =>
      previous.includes(id) ? previous.filter((entry) => entry !== id) : [...previous, id],
    )
  }

  return (
    <Dialog open={Boolean(item)} onClose={onClose} label={copy.menu.customizer.title} className="z-[80]">
      {item ? (
        <div className="flex size-full items-end justify-center md:items-center md:p-6">
          <div className="flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-brass/20 bg-ink-raised md:max-w-lg md:rounded-lg">
            <header className="flex items-start justify-between gap-4 border-b border-ink-line px-5 py-4">
              <div>
                <h2 className="font-display text-[1.75rem] leading-none text-cream">{item.name}</h2>
                <p className="mt-1 text-[0.75rem] text-muted">
                  {copy.menu.categories[item.category]}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={copy.menu.customizer.close}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-cream/70 hover:bg-cream/5 hover:text-cream"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <p className="text-sm leading-relaxed text-muted">{item.description[lang]}</p>

              {item.note ? (
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-brass/90">
                  {item.note[lang]}
                </p>
              ) : null}

              {availableAddOns.length > 0 ? (
                <fieldset className="mt-5">
                  <legend className="text-[0.6875rem] tracking-[0.08em] text-muted uppercase">
                    {copy.menu.customizer.addOns}
                  </legend>
                  <div className="mt-2 grid gap-2">
                    {availableAddOns.map((addOn) => (
                      <label
                        key={addOn.id}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-sm border border-brass/20 px-3 py-2.5 hover:border-brass/40"
                      >
                        <span className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={selected.includes(addOn.id)}
                            onChange={() => toggleAddOn(addOn.id)}
                            className="size-4 accent-brass"
                          />
                          <span className="text-[0.875rem] text-cream">{addOn.label[lang]}</span>
                        </span>
                        <span className="font-mono text-[0.75rem] text-muted">
                          +{formatRupiah(addOn.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : null}
            </div>

            <footer className="border-t border-ink-line px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[0.6875rem] tracking-[0.08em] text-muted uppercase">
                  {copy.menu.customizer.quantity}
                </span>
                <div className="inline-flex items-center rounded-full border border-brass/25">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    aria-label={copy.order.decrease.replace('{name}', item.name)}
                    className="inline-flex size-10 items-center justify-center rounded-full text-cream/80 hover:text-brass"
                  >
                    <Minus size={15} aria-hidden="true" />
                  </button>
                  <span className="tabular w-8 text-center text-sm text-cream">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.min(20, value + 1))}
                    aria-label={copy.order.increase.replace('{name}', item.name)}
                    className="inline-flex size-10 items-center justify-center rounded-full text-cream/80 hover:text-brass"
                  >
                    <Plus size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  addItem(item.id, selected, quantity)
                  onClose()
                }}
                className={`${buttonStyles('primary', 'dark', 'lg')} mt-4 w-full justify-between`}
              >
                <span>{copy.menu.customizer.addToOrder}</span>
                <span className="tabular font-mono text-[0.875rem]">{formatRupiah(total)}</span>
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </Dialog>
  )
}
