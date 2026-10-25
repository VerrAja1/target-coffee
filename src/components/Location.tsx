import { Clock, MapPin, Navigation } from 'lucide-react'
import { useI18n } from '../i18n'
import { site } from '../config/site'
import { jakartaNow } from '../lib/hours'
import { formatMinutesLabel } from '../lib/hours'
import { useNow } from '../lib/hooks'
import { SectionHeading } from './ui/SectionHeading'
import { StatusPill } from './ui/StatusPill'
import { buttonStyles } from './ui/buttonStyles'

const WEEK = [1, 2, 3, 4, 5, 6, 0] as const

export function Location() {
  const { copy } = useI18n()
  const todayIndex = jakartaNow(useNow()).dayIndex

  return (
    <section id="location" aria-labelledby="location-title" className="border-t border-ink-line">
      <div className="shell py-16 md:py-24">
        <SectionHeading
          id="location-title"
          kicker={copy.location.kicker}
          title={copy.location.title}
          lede={copy.location.lede}
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div className="overflow-hidden rounded-lg border border-ink-line bg-[#e9e7e4]">
            <div className="aspect-[4/3] w-full lg:aspect-[5/4]">
              <iframe
                src={site.maps.embedUrl}
                title={copy.location.mapTitle}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="size-full border-0 bg-[#e9e7e4]"
                allowFullScreen
              />
            </div>
            <p className="border-t border-ink-line px-4 py-3 text-[0.75rem] text-muted">
              {copy.location.mapFallback}{' '}
              <a
                href={site.maps.placeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-brass underline underline-offset-2"
              >
                {copy.location.mapFallbackLink}
              </a>
            </p>
          </div>

          <div className="grid gap-8">
            <div>
              <h3 className="flex items-center gap-2 text-[0.6875rem] tracking-[0.08em] text-muted uppercase">
                <MapPin size={14} aria-hidden="true" className="text-brass" />
                {copy.location.addressLabel}
              </h3>
              <address className="mt-2 not-italic">
                <p className="text-[1.0625rem] leading-relaxed text-cream">{site.address.street}</p>
                <p className="text-[0.9375rem] leading-relaxed text-muted">
                  {site.address.district}, {site.address.city}
                  <br />
                  {site.address.region}, {site.address.country}
                </p>
              </address>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={site.maps.placeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonStyles('primary', 'dark', 'sm')}
                >
                  {copy.location.openMaps}
                </a>
                <a
                  href={site.maps.directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonStyles('secondary', 'dark', 'sm')}
                >
                  <Navigation size={14} aria-hidden="true" />
                  {copy.location.directions}
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-[0.6875rem] tracking-[0.08em] text-muted uppercase">
                {copy.location.landmarkTitle}
              </h3>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-muted">
                {copy.location.landmarkBody}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <h3 className="flex items-center gap-2 text-[0.6875rem] tracking-[0.08em] text-muted uppercase">
                  <Clock size={14} aria-hidden="true" className="text-brass" />
                  {copy.location.hoursTitle}
                </h3>
                <StatusPill />
              </div>

              <table className="mt-3 w-full border-collapse text-[0.875rem]">
                <caption className="sr-only">{copy.location.hoursTitle}</caption>
                <tbody>
                  {WEEK.map((dayIndex) => {
                    const day = site.hours.byDay[dayIndex]
                    if (!day) return null
                    const isToday = day.day === todayIndex
                    return (
                      <tr
                        key={day.day}
                        className={isToday ? 'text-cream' : 'text-muted'}
                      >
                        <th scope="row" className="py-1.5 text-left font-normal">
                          <span className="flex items-center gap-2">
                            {isToday ? (
                              <span className="inline-block size-1 rounded-full bg-brass" aria-hidden="true" />
                            ) : (
                              <span className="inline-block size-1" aria-hidden="true" />
                            )}
                            {copy.days[day.day]}
                          </span>
                        </th>
                        <td className="tabular py-1.5 text-right font-mono text-[0.8125rem]">
                          {formatMinutesLabel(day.open)} - {formatMinutesLabel(day.close)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
