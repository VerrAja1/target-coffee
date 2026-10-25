import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onStoreChange)
      return () => list.removeEventListener('change', onStoreChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}

function detectWebgl(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function detectSaveData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return Boolean(connection?.saveData)
}

/**
 * 3D is an enhancement, never a requirement: no WebGL, a narrow screen, reduced
 * motion, or Save-Data all fall back to the photo. Desktop only on purpose.
 */
export function useCanRender3D(): boolean {
  const wide = useIsDesktop()
  const reduced = usePrefersReducedMotion()
  const [webgl] = useState(detectWebgl)
  const [saveData] = useState(detectSaveData)

  return wide && !reduced && webgl && !saveData
}

interface ScrollState {
  y: number
  direction: 'up' | 'down'
}

export function useScrollState(): ScrollState {
  const [state, setState] = useState<ScrollState>({ y: 0, direction: 'up' })
  const lastY = useRef(0)
  const frame = useRef(0)

  useEffect(() => {
    const update = () => {
      const y = Math.max(0, window.scrollY)
      const direction = y > lastY.current && y > 24 ? 'down' : 'up'
      lastY.current = y
      setState((previous) =>
        previous.y === y && previous.direction === direction ? previous : { y, direction },
      )
    }

    const onScroll = () => {
      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame.current)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return state
}

/** Returns the id of the last section whose top passed the header offset. */
export function useScrollSpy(ids: readonly string[], offset = 140): string {
  const [active, setActive] = useState(ids[0] ?? '')
  const frame = useRef(0)

  useEffect(() => {
    const update = () => {
      let current = ids[0] ?? ''
      for (const id of ids) {
        const element = document.getElementById(id)
        if (element && element.getBoundingClientRect().top - offset <= 0) current = id
      }
      setActive((previous) => (previous === current ? previous : current))
    }

    const onScroll = () => {
      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame.current)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids, offset])

  return active
}

export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])

  return now
}
