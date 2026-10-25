import { Component, Suspense, lazy, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { Transition } from 'framer-motion'
import { Image as ImageIcon, Rotate3d } from 'lucide-react'
import { useI18n } from '../i18n'
import { site } from '../config/site'
import { media } from '../data/media'
import { useCanRender3D } from '../lib/hooks'
import { useSmoothScroll } from '../lib/scroll'
import { PictureFrame } from './ui/PictureFrame'
import { StatusPill } from './ui/StatusPill'
import { buttonStyles } from './ui/buttonStyles'

const HeroScene = lazy(() => import('./HeroScene'))

class SceneBoundary extends Component<
  { fallback: ReactNode; onError?: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onError?.()
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/**
 * The still of the same drink the 3D cup is modelled on. It is both the
 * toggled-to state and the loading layer while the canvas boots, so switching
 * modes never shows an empty panel.
 */
function StagePhoto({ priority }: { priority: boolean }) {
  const { copy } = useI18n()
  return (
    <div className="relative h-full w-full overflow-hidden bg-ink-raised">
      <PictureFrame
        picture={media['iced-latte']}
        alt={copy.hero.photoAlt}
        sizes="(min-width: 1024px) 46vw, 92vw"
        priority={priority}
        imgClassName="object-cover object-[50%_45%]"
        className="size-full"
      />
    </div>
  )
}

export function Hero() {
  const { copy } = useI18n()
  const { scrollTo } = useSmoothScroll()
  const can3D = useCanRender3D()
  const reduced = useReducedMotion()
  const [sceneReady, setSceneReady] = useState(false)
  const [sceneFailed, setSceneFailed] = useState(false)
  const [interactive3D, setInteractive3D] = useState(true)
  const section = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(true)

  const show3D = can3D && interactive3D && !sceneFailed

  useEffect(() => {
    const element = section.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { rootMargin: '120px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const toggleStage = () => {
    if (!can3D || sceneFailed) return
    setInteractive3D((current) => !current)
    setSceneReady(false)
  }

  const words = copy.hero.title.split(' ')
  const fade: Transition = reduced
    ? { duration: 0 }
    : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }

  return (
    <section
      id="home"
      ref={section}
      aria-labelledby="hero-title"
      className="relative overflow-hidden pt-28 pb-12 lg:min-h-[100svh] lg:pt-32 lg:pb-16"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-52 right-[-14%] size-[52rem] rounded-full bg-[radial-gradient(circle,rgb(212_163_115/0.14),transparent_62%)]"
      />

      <div className="shell relative grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6 xl:col-span-6">
          <p className="flex items-center gap-3 font-display text-[1.0625rem] italic text-brass">
            <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-brass" />
            {copy.hero.eyebrow}
          </p>

          <h1
            id="hero-title"
            className="mt-5 font-display text-[clamp(2.75rem,7.2vw,5.4rem)] leading-[0.97] font-medium tracking-[-0.02em] text-balance text-cream"
          >
            {words.map((word, index) => (
              <span key={`${word}-${index}`} className={index >= words.length - 2 ? 'italic text-brass' : ''}>
                {word}
                {index < words.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h1>

          <p className="mt-5 max-w-lg text-[0.9375rem] leading-relaxed text-muted">
            {copy.hero.lede}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => scrollTo('menu')}
              className={buttonStyles('primary', 'dark', 'lg')}
            >
              {copy.hero.primary}
            </button>
            <button
              type="button"
              onClick={() => scrollTo('booking')}
              className={buttonStyles('secondary', 'dark', 'lg')}
            >
              {copy.hero.secondary}
            </button>
          </div>

          <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2.5">
            {copy.hero.badges.map((badge) => (
              <li key={badge} className="flex items-center gap-2 text-[0.75rem] text-muted">
                <span aria-hidden="true" className="inline-block size-1 rounded-full bg-brass/70" />
                {badge}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative h-[340px] sm:h-[440px] lg:col-span-6 lg:h-[560px] xl:col-span-6">
          {can3D ? (
            <div
              data-hero-stage=""
              className="absolute inset-0 cursor-pointer overflow-hidden rounded-lg border border-ink-line bg-[linear-gradient(180deg,#1b1612_0%,#12100e_78%)]"
              onClick={toggleStage}
            >
              <AnimatePresence initial={false}>
                {show3D ? (
                  <motion.div
                    key="scene"
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.985 }}
                    transition={fade}
                  >
                    <div
                      className={`absolute inset-0 transition-opacity duration-700 ${
                        sceneReady ? 'opacity-0' : 'opacity-100'
                      }`}
                      aria-hidden={sceneReady}
                    >
                      <StagePhoto priority />
                    </div>
                    <SceneBoundary fallback={null} onError={() => setSceneFailed(true)}>
                      <Suspense fallback={null}>
                        <div
                          className={`absolute inset-0 transition-opacity duration-700 ${
                            sceneReady ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <HeroScene active={inView} onReady={() => setSceneReady(true)} />
                        </div>
                      </Suspense>
                    </SceneBoundary>
                  </motion.div>
                ) : (
                  <motion.div
                    key="photo"
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.045 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={fade}
                  >
                    <StagePhoto priority />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-ink/90 via-ink/35 to-transparent px-4 pt-16 pb-3.5">
                <p className="max-w-[60%] text-[0.6875rem] leading-relaxed tracking-[0.06em] text-cream/75 uppercase">
                  {show3D ? copy.hero.sceneCaption : copy.hero.photoCaption}
                </p>

                {sceneFailed ? null : (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      toggleStage()
                    }}
                    className="pointer-events-auto inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-cream/25 bg-ink/55 px-3 text-[0.6875rem] tracking-[0.06em] text-cream/90 uppercase backdrop-blur-sm transition-colors hover:border-cream/50 hover:text-cream"
                  >
                    {show3D ? (
                      <ImageIcon size={13} aria-hidden="true" />
                    ) : (
                      <Rotate3d size={13} aria-hidden="true" />
                    )}
                    {show3D ? copy.hero.toggleToPhoto : copy.hero.toggleTo3D}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="mx-auto h-full w-full max-w-sm overflow-hidden rounded-lg border border-ink-line lg:max-w-none">
              <StagePhoto priority />
            </div>
          )}
        </div>
      </div>

      <div className="shell relative mt-10 lg:mt-14">
        <dl className="grid gap-6 border-t border-ink-line pt-6 sm:grid-cols-3 sm:gap-8">
          <div>
            <dt className="text-[0.6875rem] tracking-[0.08em] text-muted uppercase">
              {copy.hero.facts.hours}
            </dt>
            <dd className="mt-1.5">
              <StatusPill />
            </dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] tracking-[0.08em] text-muted uppercase">
              {copy.hero.facts.address}
            </dt>
            <dd className="mt-1.5 text-[0.8125rem] leading-relaxed text-cream">
              {site.address.street}
              <br />
              {site.address.district}, {site.address.city}
            </dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] tracking-[0.08em] text-muted uppercase">
              {copy.hero.facts.seats}
            </dt>
            <dd className="mt-1.5 text-[0.8125rem] leading-relaxed text-cream">
              {copy.hero.facts.amenities}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
