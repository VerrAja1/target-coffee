import { useRef, useState } from 'react'
import { motion, useReducedMotion, useSpring } from 'framer-motion'
import { Plus } from 'lucide-react'
import type { MenuItem } from '../data/menu.types'
import { mediaFor } from '../data/media'
import { useI18n } from '../i18n'
import { useIsDesktop } from '../lib/hooks'
import { formatRupiah } from '../lib/money'
import { PictureFrame } from './ui/PictureFrame'
import { MenuItemBadge } from './ui/MenuItemBadge'

function TiltImage({
  item,
  alt,
  enabled,
}: {
  item: MenuItem
  alt: string
  enabled: boolean
}) {
  const picture = mediaFor(item.image)
  const rotateX = useSpring(0, { stiffness: 210, damping: 22 })
  const rotateY = useSpring(0, { stiffness: 210, damping: 22 })
  const [glare, setGlare] = useState({ x: 50, y: 50, on: false })
  const frame = useRef<number>(0)

  if (!picture) return null

  if (!enabled) {
    return (
      <div className="size-24 shrink-0 overflow-hidden rounded-md bg-ink/5 md:size-28">
        <PictureFrame
          picture={picture}
          alt={alt}
          sizes="(min-width: 768px) 112px, 96px"
          className="size-full"
        />
      </div>
    )
  }

  return (
    <motion.div
      onPointerMove={(event) => {
        cancelAnimationFrame(frame.current)
        const bounds = event.currentTarget.getBoundingClientRect()
        frame.current = requestAnimationFrame(() => {
          const x = (event.clientX - bounds.left) / bounds.width
          const y = (event.clientY - bounds.top) / bounds.height
          rotateY.set((x - 0.5) * 12)
          rotateX.set(-(y - 0.5) * 12)
          setGlare({ x: x * 100, y: y * 100, on: true })
        })
      }}
      onPointerLeave={() => {
        rotateX.set(0)
        rotateY.set(0)
        setGlare((previous) => ({ ...previous, on: false }))
      }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className="relative size-24 shrink-0 overflow-hidden rounded-md bg-ink/5 md:size-28"
    >
      <PictureFrame
        picture={picture}
        alt={alt}
        sizes="(min-width: 768px) 112px, 96px"
        className="size-full"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: glare.on ? 1 : 0,
          background: `radial-gradient(90px circle at ${glare.x}% ${glare.y}%, rgb(255 255 255 / 0.35), transparent 70%)`,
        }}
      />
    </motion.div>
  )
}

interface MenuCardProps {
  item: MenuItem
  onAdd: (item: MenuItem) => void
}

export function MenuCard({ item, onAdd }: MenuCardProps) {
  const { copy, lang } = useI18n()
  const desktop = useIsDesktop()
  const reduced = useReducedMotion()
  const signature = item.badges.includes('signature')
  const tilt = Boolean(desktop && !reduced && signature && item.image)

  return (
    <article className="flex gap-4 border-b border-cocoa/10 py-5">
      <TiltImage item={item} alt={`${item.name}, Target Coffee`} enabled={tilt} />

      <div className="min-w-0 flex-1">
        {item.badges.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {item.badges.map((badge) => (
              <MenuItemBadge key={badge} id={badge} label={copy.menu.badges[badge]} />
            ))}
          </div>
        ) : null}

        <h3 className="mt-1.5 font-display text-[1.375rem] leading-tight text-cocoa">
          {item.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted-light">
          {item.description[lang]}
        </p>

        <div className="mt-2.5 flex items-end justify-between gap-3">
          <div>
            <span className="tabular font-mono text-[0.9375rem] text-cocoa">
              {formatRupiah(item.price)}
            </span>
            {item.note ? (
              <p className="mt-0.5 text-[0.6875rem] leading-snug text-muted-light">
                {item.note[lang]}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => onAdd(item)}
            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xs border border-cocoa/25 px-3 text-[0.75rem] font-medium text-cocoa transition-colors hover:border-cocoa hover:bg-cocoa hover:text-cream"
          >
            <Plus size={13} aria-hidden="true" />
            {copy.menu.add}
            <span className="sr-only">: {item.name}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
