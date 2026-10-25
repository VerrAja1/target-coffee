import type { ReactNode } from 'react'

interface SectionHeadingProps {
  kicker: string
  title: string
  lede?: string
  tone?: 'dark' | 'light'
  align?: 'start' | 'center'
  id?: string
}

export function SectionHeading({
  kicker,
  title,
  lede,
  tone = 'dark',
  align = 'start',
  id,
}: SectionHeadingProps) {
  const isLight = tone === 'light'
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p
        className={`flex items-center gap-3 font-display text-[1.0625rem] italic ${
          align === 'center' ? 'justify-center' : ''
        } ${isLight ? 'text-matcha' : 'text-brass'}`}
      >
        <span
          aria-hidden="true"
          className={`inline-block size-1.5 rounded-full ${isLight ? 'bg-matcha' : 'bg-brass'}`}
        />
        {kicker}
      </p>
      <h2
        id={id}
        className={`mt-3 font-display text-[clamp(2rem,4.6vw,3.25rem)] leading-[1.04] font-medium tracking-[-0.01em] text-balance ${
          isLight ? 'text-cocoa' : 'text-cream'
        }`}
      >
        {title}
      </h2>
      {lede ? (
        <p
          className={`mt-4 max-w-xl text-[0.9375rem] leading-relaxed ${
            isLight ? 'text-muted-light' : 'text-muted'
          }`}
        >
          {lede}
        </p>
      ) : null}
    </div>
  )
}

export function Kicker({ children, tone = 'dark' }: { children: ReactNode; tone?: 'dark' | 'light' }) {
  return (
    <p
      className={`font-display text-[1.0625rem] italic ${
        tone === 'light' ? 'text-matcha' : 'text-brass'
      }`}
    >
      {children}
    </p>
  )
}
