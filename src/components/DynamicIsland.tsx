import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { useI18n } from '../i18n'
import { useIsDesktop, useScrollSpy, useScrollState } from '../lib/hooks'
import { formatRupiah } from '../lib/money'
import { useOrder } from '../lib/order'
import { useSmoothScroll } from '../lib/scroll'
import { SECTION_IDS } from '../lib/sections'
import type { SectionId } from '../lib/sections'
import { Dialog } from './ui/Dialog'
import { StatusPill } from './ui/StatusPill'
import { buttonStyles } from './ui/buttonStyles'

type NavKey = 'home' | 'about' | 'menu' | 'booking' | 'location' | 'contact'

const NAV: ReadonlyArray<{ id: SectionId; key: NavKey }> = [
  { id: 'home', key: 'home' },
  { id: 'about', key: 'about' },
  { id: 'menu', key: 'menu' },
  { id: 'booking', key: 'booking' },
  { id: 'location', key: 'location' },
  { id: 'contact', key: 'contact' },
]

function Wordmark({ onClick }: { onClick: () => void }) {
  return (
    <a
      href="#home"
      onClick={(event) => {
        event.preventDefault()
        onClick()
      }}
      className="flex shrink-0 items-baseline gap-1.5 rounded-xs py-2 pr-1 focus-visible:outline-offset-4"
    >
      <span className="font-display text-[1.375rem] leading-none font-medium tracking-[-0.01em] text-cream">
        Target
      </span>
      <span className="font-display text-[1.375rem] leading-none italic text-brass">Coffee</span>
    </a>
  )
}

export function DynamicIsland() {
  const { copy, lang, toggleLang } = useI18n()
  const { scrollTo } = useSmoothScroll()
  const { count, bill, isOpen: orderOpen, openOrder, closeOrder } = useOrder()
  const { y, direction } = useScrollState()
  const active = useScrollSpy(SECTION_IDS)
  const desktop = useIsDesktop()
  const reduced = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const compact = desktop && y > 90 && direction === 'down' && !hovered && !orderOpen

  const navigate = (id: SectionId) => {
    setMenuOpen(false)
    scrollTo(id)
  }

  const spring = reduced
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 320, damping: 28 }

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:top-5">
        <motion.nav
          aria-label={copy.nav.sections}
          initial={false}
          animate={{ maxWidth: compact ? 468 : 920 }}
          transition={spring}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHovered(false)
          }}
          className={`pointer-events-auto flex w-full items-center gap-1 rounded-full py-1.5 pr-1.5 pl-4 ${
            orderOpen ? 'ring-1 ring-brass/50' : ''
          } island-surface`}
        >
          <Wordmark onClick={() => navigate('home')} />

          {desktop ? (
            <div className="relative flex min-w-0 flex-1 items-center justify-center">
              <AnimatePresence mode="wait" initial={false}>
                {compact ? (
                  <motion.span
                    key="active"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="truncate px-3 text-[0.8125rem] text-cream"
                  >
                    {copy.nav[active as SectionId]}
                  </motion.span>
                ) : (
                  <motion.ul
                    key="links"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-0.5"
                  >
                    {NAV.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          aria-current={active === item.id ? 'true' : undefined}
                          onClick={(event) => {
                            event.preventDefault()
                            navigate(item.id)
                          }}
                          className={`inline-flex min-h-10 items-center rounded-full px-3 text-[0.8125rem] transition-colors ${
                            active === item.id
                              ? 'text-brass'
                              : 'text-cream/70 hover:text-cream'
                          }`}
                        >
                          {copy.nav[item.key]}
                        </a>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          <div className="flex shrink-0 items-center gap-0.5">
            {compact ? null : (
              <div className="mr-1 hidden xl:flex">
                <StatusPill compact />
              </div>
            )}

            {compact ? null : (
              <button
                type="button"
                onClick={toggleLang}
                aria-label={`${copy.nav.language}: ${lang.toUpperCase()}`}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[0.75rem] font-medium transition-colors hover:bg-cream/5"
              >
                <span className={lang === 'id' ? 'text-brass' : 'text-muted'}>ID</span>
                <span aria-hidden="true" className="mx-0.5 text-muted/60">
                  /
                </span>
                <span className={lang === 'en' ? 'text-brass' : 'text-muted'}>EN</span>
              </button>
            )}

            <button
              type="button"
              onClick={orderOpen ? closeOrder : openOrder}
              aria-label={
                orderOpen
                  ? copy.order.close
                  : count > 0
                    ? copy.order.openCart.replace('{count}', String(count))
                    : copy.nav.order
              }
              aria-expanded={orderOpen}
              className={`${buttonStyles('primary', 'dark', 'sm')} min-h-11 rounded-full px-3.5`}
            >
              <ShoppingBag size={16} aria-hidden="true" />
              {count > 0 ? (
                <span className="tabular text-[0.8125rem]">
                  {compact ? formatRupiah(bill.total) : count}
                </span>
              ) : (
                <span className="hidden text-[0.8125rem] sm:inline">{copy.nav.order}</span>
              )}
            </button>

            {desktop ? null : (
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label={copy.nav.openMenu}
                aria-expanded={menuOpen}
                className="inline-flex size-11 items-center justify-center rounded-full text-cream transition-colors hover:bg-cream/5"
              >
                <Menu size={20} aria-hidden="true" />
              </button>
            )}
          </div>
        </motion.nav>
      </header>

      <Dialog
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        label={copy.nav.sections}
        className="z-[60]"
      >
        <div className="flex size-full flex-col overflow-y-auto bg-ink px-5 pt-6 pb-10">
          <div className="flex items-center justify-between">
            <Wordmark onClick={() => navigate('home')} />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={copy.nav.closeMenu}
              className="inline-flex size-11 items-center justify-center rounded-full text-cream hover:bg-cream/5"
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>

          <nav className="mt-10" aria-label={copy.nav.sections}>
            <ul className="flex flex-col">
              {NAV.map((item) => (
                <li key={item.id} className="border-b border-ink-line">
                  <a
                    href={`#${item.id}`}
                    onClick={(event) => {
                      event.preventDefault()
                      navigate(item.id)
                    }}
                    className={`flex min-h-16 items-center justify-between font-display text-[2rem] leading-none ${
                      active === item.id ? 'text-brass' : 'text-cream'
                    }`}
                  >
                    {copy.nav[item.key]}
                    <span aria-hidden="true" className="font-sans text-[0.6875rem] text-muted">
                      0{NAV.findIndex((entry) => entry.id === item.id) + 1}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-8 flex items-center justify-between gap-4">
            <StatusPill />
            <button
              type="button"
              onClick={() => {
                toggleLang()
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brass/30 px-4 text-[0.8125rem]"
              aria-label={`${copy.nav.language}: ${lang === 'id' ? 'Indonesia' : 'English'}`}
            >
              <span className={lang === 'id' ? 'text-brass' : 'text-muted'}>ID</span>
              <span className="text-muted/60" aria-hidden="true">
                /
              </span>
              <span className={lang === 'en' ? 'text-brass' : 'text-muted'}>EN</span>
            </button>
          </div>

          <div className="mt-auto pt-10">
            <a
              href="#booking"
              onClick={(event) => {
                event.preventDefault()
                navigate('booking')
              }}
              className={`${buttonStyles('primary', 'dark', 'lg')} w-full`}
            >
              {copy.nav.reserve}
            </a>
          </div>
        </div>
      </Dialog>
    </>
  )
}
