import { useMemo, useState } from 'react'
import { categoryOrder } from '../config/commerce'
import { menu } from '../data/menu'
import type { BadgeId, CategoryId, MenuItem } from '../data/menu.types'
import { useI18n } from '../i18n'
import { fill } from '../i18n'
import { ItemDialog } from './ItemDialog'
import { MenuCard } from './MenuCard'
import { SectionHeading } from './ui/SectionHeading'
import { useOrder } from '../lib/order'

type CategoryFilter = CategoryId | 'all'
type Spotlight = BadgeId | 'all'

export function MenuSection() {
  const { copy } = useI18n()
  const { addItem } = useOrder()
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [spotlight, setSpotlight] = useState<Spotlight>('all')
  const [customizing, setCustomizing] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      menu.filter((item) => {
        const categoryMatch = category === 'all' || item.category === category
        const badgeMatch = spotlight === 'all' || item.badges.includes(spotlight)
        return categoryMatch && badgeMatch
      }),
    [category, spotlight],
  )

  const groups = useMemo(() => {
    const map = new Map<string, MenuItem[]>()
    for (const item of filtered) {
      const key = category === 'all' ? 'main' : (item.group ?? 'main')
      const bucket = map.get(key)
      if (bucket) bucket.push(item)
      else map.set(key, [item])
    }
    return [...map.entries()]
  }, [filtered, category])

  const handleAdd = (item: MenuItem) => {
    if (item.addOns && item.addOns.length > 0) {
      setCustomizing(item.id)
      return
    }
    addItem(item.id)
  }

  const reset = () => {
    setCategory('all')
    setSpotlight('all')
  }

  return (
    <section id="menu" aria-labelledby="menu-title" className="bg-cream text-cocoa">
      <div className="shell pt-16 pb-6 md:pt-24">
        <SectionHeading
          id="menu-title"
          kicker={copy.menu.kicker}
          title={copy.menu.title}
          lede={copy.menu.lede}
          tone="light"
        />

        <div className="sticky top-[72px] z-30 -mx-5 mt-8 border-y border-cocoa/10 bg-cream px-5 py-3 sm:-mx-8 sm:px-8 lg:top-[84px]">
          <div
            className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [mask-image:linear-gradient(to_right,#000_88%,transparent)] lg:flex-wrap lg:overflow-visible lg:[mask-image:none]"
            role="group"
            aria-label={copy.menu.filters}
          >
            <button
              type="button"
              onClick={() => setCategory('all')}
              aria-pressed={category === 'all'}
              className={`min-h-9 shrink-0 rounded-full border px-3.5 text-[0.8125rem] transition-colors ${
                category === 'all'
                  ? 'border-cocoa bg-cocoa text-cream'
                  : 'border-cocoa/20 text-cocoa/75 hover:border-cocoa/40'
              }`}
            >
              {copy.menu.all}
            </button>
            {categoryOrder.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setCategory(id)}
                aria-pressed={category === id}
                className={`min-h-9 shrink-0 rounded-full border px-3.5 text-[0.8125rem] transition-colors ${
                  category === id
                    ? 'border-cocoa bg-cocoa text-cream'
                    : 'border-cocoa/20 text-cocoa/75 hover:border-cocoa/40'
                }`}
              >
                {copy.menu.categories[id]}
              </button>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="hidden shrink-0 text-[0.6875rem] tracking-[0.08em] text-muted-light uppercase sm:inline">
              {copy.menu.spotlight}
            </span>
            <div className="no-scrollbar -mx-1 flex flex-1 items-center gap-1 overflow-x-auto px-1 [mask-image:linear-gradient(to_right,#000_88%,transparent)] lg:[mask-image:none]">
              <button
                type="button"
                onClick={() => setSpotlight('all')}
                aria-pressed={spotlight === 'all'}
                className={`min-h-8 shrink-0 rounded-xs px-2 text-[0.75rem] transition-colors ${
                  spotlight === 'all'
                    ? 'font-medium text-cocoa underline decoration-brass decoration-2 underline-offset-[5px]'
                    : 'text-muted-light hover:text-cocoa'
                }`}
              >
                {copy.menu.all}
              </button>
              {(['best-seller', 'signature', 'new'] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSpotlight(id)}
                  aria-pressed={spotlight === id}
                  className={`min-h-8 shrink-0 rounded-xs px-2 text-[0.75rem] transition-colors ${
                    spotlight === id
                      ? 'font-medium text-cocoa underline decoration-brass decoration-2 underline-offset-[5px]'
                      : 'text-muted-light hover:text-cocoa'
                  }`}
                >
                  {copy.menu.badges[id]}
                </button>
              ))}
            </div>
            <span className="shrink-0 text-[0.75rem] text-muted-light">
              {fill(copy.menu.itemCount, { count: filtered.length })}
            </span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-light">{copy.menu.empty}</p>
            <button
              type="button"
              onClick={reset}
              className="mt-4 min-h-11 rounded-xs border border-cocoa/30 px-4 text-sm text-cocoa hover:bg-cocoa hover:text-cream"
            >
              {copy.menu.reset}
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-x-14 md:grid-cols-2">
            {groups.map(([group, items]) => (
              <div key={group} className="contents">
                {group === 'main' ? null : (
                  <h3 className="col-span-full mt-6 mb-1 font-display text-[1.5rem] text-cocoa">
                    {copy.menu.groups[group as keyof typeof copy.menu.groups]}
                  </h3>
                )}
                {items.map((item) => (
                  <MenuCard key={item.id} item={item} onAdd={handleAdd} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <ItemDialog
        key={customizing ?? 'closed'}
        itemId={customizing}
        onClose={() => setCustomizing(null)}
      />
    </section>
  )
}
