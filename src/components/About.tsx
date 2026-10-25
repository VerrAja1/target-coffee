import { useI18n } from '../i18n'
import { media } from '../data/media'
import { PictureFrame } from './ui/PictureFrame'
import { SectionHeading } from './ui/SectionHeading'

export function About() {
  const { copy } = useI18n()
  const [machine, room, kitchen] = copy.about.cards

  return (
    <section id="about" aria-labelledby="about-title" className="border-t border-ink-line">
      <div className="shell py-16 md:py-24">
        <SectionHeading
          id="about-title"
          kicker={copy.about.kicker}
          title={copy.about.title}
          lede={copy.about.lede}
        />

        <div className="mt-10 grid gap-4 md:grid-cols-12">
          <article className="overflow-hidden rounded-lg border border-ink-line bg-ink-raised md:col-span-6">
            <div className="aspect-[16/10] overflow-hidden">
              <PictureFrame
                picture={media.barista}
                alt={copy.about.baristaAlt}
                sizes="(min-width: 768px) 45vw, 92vw"
                imgClassName="object-[50%_86%]"
                className="size-full"
              />
            </div>
            <div className="p-6">
              <h3 className="font-display text-[1.75rem] leading-tight text-cream">{machine?.title}</h3>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-muted">{machine?.body}</p>
            </div>
          </article>

          <article className="overflow-hidden rounded-lg border border-ink-line bg-ink-raised md:col-span-6">
            <div className="aspect-[16/10] overflow-hidden">
              <PictureFrame
                picture={media.interior}
                alt={copy.about.interiorAlt}
                sizes="(min-width: 768px) 45vw, 92vw"
                imgClassName="object-[50%_45%]"
                className="size-full"
              />
            </div>
            <div className="p-6">
              <h3 className="font-display text-[1.75rem] leading-tight text-cream">{room?.title}</h3>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-muted">{room?.body}</p>
            </div>
          </article>

          <article className="grid overflow-hidden rounded-lg border border-ink-line bg-ink-raised md:col-span-12 md:grid-cols-[1.15fr_1fr]">
            <div className="p-6 md:p-8 md:self-center">
              <h3 className="font-display text-[1.75rem] leading-tight text-cream">{kitchen?.title}</h3>
              <p className="mt-2 max-w-md text-[0.875rem] leading-relaxed text-muted">{kitchen?.body}</p>
            </div>
            <div className="order-first aspect-[16/9] overflow-hidden md:order-none md:aspect-auto md:min-h-[22rem]">
              <PictureFrame
                picture={media['soto-ayam']}
                alt={copy.about.kitchenAlt}
                sizes="(min-width: 768px) 40vw, 92vw"
                imgClassName="object-[50%_78%]"
                className="size-full"
              />
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
