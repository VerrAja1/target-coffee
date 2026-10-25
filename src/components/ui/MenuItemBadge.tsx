import type { BadgeId } from '../../data/menu.types'

const styles: Record<BadgeId, string> = {
  'best-seller': 'border-terracotta/45 text-terracotta',
  signature: 'border-brass/50 text-brass',
  new: 'border-matcha/50 text-matcha',
}

export function MenuItemBadge({ id, label }: { id: BadgeId; label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-xs border px-1.5 py-0.5 text-[0.625rem] leading-none font-medium tracking-[0.04em] uppercase ${styles[id]}`}
    >
      {label}
    </span>
  )
}
