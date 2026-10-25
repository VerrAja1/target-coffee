/* eslint-disable react-refresh/only-export-components -- provider and its hook live together on purpose */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import Lenis from 'lenis'
import { usePrefersReducedMotion } from './hooks'

interface ScrollValue {
  scrollTo: (id: string) => void
  smooth: boolean
}

const ScrollContext = createContext<ScrollValue | null>(null)

const HEADER_OFFSET = 92

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion()
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    })
    lenisRef.current = lenis

    let frame = 0
    const loop = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reduced])

  const scrollTo = useCallback(
    (id: string) => {
      const element = document.getElementById(id)
      if (!element) return
      const top = element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET

      if (lenisRef.current) {
        lenisRef.current.scrollTo(top, { duration: 1.1 })
        return
      }
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
    },
    [reduced],
  )

  const value = useMemo<ScrollValue>(() => ({ scrollTo, smooth: !reduced }), [scrollTo, reduced])

  return <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>
}

export function useSmoothScroll(): ScrollValue {
  const value = useContext(ScrollContext)
  if (!value) throw new Error('useSmoothScroll must be used inside SmoothScrollProvider')
  return value
}
