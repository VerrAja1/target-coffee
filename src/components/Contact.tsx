import { ArrowUpRight, Instagram, MessageCircle, Music2 } from 'lucide-react'
import { useI18n } from '../i18n'
import { site } from '../config/site'
import { media } from '../data/media'
import { waUrl } from '../lib/whatsapp'
import { PictureFrame } from './ui/PictureFrame'
import { SectionHeading } from './ui/SectionHeading'

export function Contact() {
  const { copy } = useI18n()

  const cards = [
    {
      key: 'whatsapp',
      icon: MessageCircle,
      title: copy.contact.whatsappTitle,
      body: copy.contact.whatsappBody,
      cta: copy.contact.whatsappCta,
      href: waUrl(copy.contact.whatsappMessage),
      detail: site.contact.whatsappDisplay,
    },
    {
      key: 'instagram',
      icon: Instagram,
      title: copy.contact.instagramTitle,
      body: copy.contact.instagramBody,
      cta: copy.contact.instagramCta,
      href: site.contact.instagramUrl,
      detail: site.contact.instagramHandle,
    },
    {
      key: 'tiktok',
      icon: Music2,
      title: copy.contact.tiktokTitle,
      body: copy.contact.tiktokBody,
      cta: copy.contact.tiktokCta,
      href: site.contact.tiktokUrl,
      detail: site.contact.tiktokHandle,
    },
  ] as const

  return (
    <section id="contact" aria-labelledby="contact-title" className="border-t border-ink-line">
      <div className="shell py-16 md:py-24">
        <SectionHeading
          id="contact-title"
          kicker={copy.contact.kicker}
          title={copy.contact.title}
          lede={copy.contact.lede}
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.key}
              className="flex flex-col rounded-lg border border-ink-line bg-ink-raised p-6"
            >
              <card.icon size={20} aria-hidden="true" className="text-brass" />
              <h3 className="mt-4 font-display text-[1.5rem] leading-tight text-cream">
                {card.title}
              </h3>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">{card.body}</p>
              <p className="mt-4 text-[0.75rem] text-cream/85">{card.detail}</p>
              <a
                href={card.href}
                target="_blank"
                rel="noreferrer"
                className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-4 text-[0.8125rem] font-medium text-brass hover:text-cream"
              >
                {card.cta}
                <ArrowUpRight size={14} aria-hidden="true" />
                <span className="sr-only">({copy.common.openInNewTab})</span>
              </a>
            </article>
          ))}
        </div>

        <div className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h3 className="font-display text-[1.75rem] text-cream">{copy.contact.galleryTitle}</h3>
            <p className="text-[0.75rem] text-muted">{copy.contact.galleryNote}</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            {[media.interior, media.barista, media['soto-tangkar']].map((picture, index) => (
              <div key={index} className="aspect-[4/5] overflow-hidden rounded-md bg-ink-raised">
                <PictureFrame
                  picture={picture}
                  alt={
                    [copy.contact.photoAlt.interior, copy.contact.photoAlt.barista, copy.contact.photoAlt.soto][
                      index
                    ] ?? ''
                  }
                  sizes="(min-width: 640px) 30vw, 32vw"
                  imgClassName="object-[50%_40%]"
                  className="size-full"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
