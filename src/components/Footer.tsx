import { Instagram, MessageCircle, Music2 } from 'lucide-react'
import { useI18n } from '../i18n'
import { site } from '../config/site'
import { useSmoothScroll } from '../lib/scroll'
import { SECTION_IDS } from '../lib/sections'
import { StatusPill } from './ui/StatusPill'

export function Footer() {
  const { copy } = useI18n()
  const { scrollTo } = useSmoothScroll()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-ink-line">
      <div className="shell py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="font-display text-[1.5rem] leading-none">
              <span className="text-cream">Target</span>{' '}
              <span className="italic text-brass">Coffee</span>
            </p>
            <p className="mt-2 font-display text-[1.0625rem] italic text-muted">
              {copy.footer.tagline}
            </p>
            <address className="mt-4 not-italic text-[0.8125rem] leading-relaxed text-muted">
              {site.address.street}
              <br />
              {site.address.district}, {site.address.city}
            </address>
            <div className="mt-4">
              <StatusPill />
            </div>
          </div>

          <nav aria-label={copy.footer.exploreTitle}>
            <h2 className="text-[0.6875rem] tracking-[0.08em] text-muted uppercase">
              {copy.footer.exploreTitle}
            </h2>
            <ul className="mt-3 grid gap-1">
              {SECTION_IDS.map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={(event) => {
                      event.preventDefault()
                      scrollTo(id)
                    }}
                    className="inline-flex min-h-9 items-center text-[0.8125rem] text-cream/80 hover:text-brass"
                  >
                    {copy.nav[id]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-[0.6875rem] tracking-[0.08em] text-muted uppercase">
              {copy.footer.contactTitle}
            </h2>
            <ul className="mt-3 grid gap-1 text-[0.8125rem]">
              <li>
                <a
                  href={`https://wa.me/${site.contact.whatsappE164}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-9 items-center gap-2 text-cream/80 hover:text-brass"
                >
                  <MessageCircle size={14} aria-hidden="true" />
                  {site.contact.whatsappDisplay}
                </a>
              </li>
              <li>
                <a
                  href={site.contact.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-9 items-center gap-2 text-cream/80 hover:text-brass"
                >
                  <Instagram size={14} aria-hidden="true" />
                  {site.contact.instagramHandle}
                </a>
              </li>
              <li>
                <a
                  href={site.contact.tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-9 items-center gap-2 text-cream/80 hover:text-brass"
                >
                  <Music2 size={14} aria-hidden="true" />
                  {site.contact.tiktokHandle}
                </a>
              </li>
            </ul>
            <p className="mt-3 text-[0.75rem] text-muted">{copy.footer.daily}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-ink-line pt-6 text-[0.75rem] leading-relaxed text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl">{copy.footer.note}</p>
          <p className="shrink-0">
            © {year} {copy.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}
