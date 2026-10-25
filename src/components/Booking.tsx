import { useState } from 'react'
import type { FormEvent } from 'react'
import { useI18n } from '../i18n'
import { media } from '../data/media'
import { getMenuItem } from '../data/menu'
import { useOrder } from '../lib/order'
import { buildReservationMessage, waUrl } from '../lib/whatsapp'
import { PictureFrame } from './ui/PictureFrame'
import { SectionHeading } from './ui/SectionHeading'
import { buttonStyles } from './ui/buttonStyles'

interface FormValues {
  name: string
  phone: string
  date: string
  time: string
  people: string
  purpose: string
  area: string
  notes: string
}

type Errors = Partial<Record<keyof FormValues, string>>

function todayInJakarta(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
}

export function Booking() {
  const { copy, lang } = useI18n()
  const { lines, count } = useOrder()
  const [values, setValues] = useState<FormValues>({
    name: '',
    phone: '',
    date: '',
    time: '19:00',
    people: '2',
    purpose: 'hangout',
    area: 'indoor-non-smoking',
    notes: '',
  })
  const [includeOrder, setIncludeOrder] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [sentLink, setSentLink] = useState<string | null>(null)

  const update = (key: keyof FormValues, value: string) => {
    setValues((previous) => ({ ...previous, [key]: value }))
    setErrors((previous) => {
      const next = { ...previous }
      delete next[key]
      return next
    })
  }

  const preorderText = includeOrder
    ? lines
        .map((line) => `${line.quantity}x ${getMenuItem(line.itemId)?.name ?? line.itemId}`)
        .join(', ')
    : ''

  const validate = (): Errors => {
    const next: Errors = {}
    if (!values.name.trim()) next.name = copy.booking.required
    if (values.phone.replace(/\D/g, '').length < 8) next.phone = copy.booking.phoneError
    if (!values.date) next.date = copy.booking.required
    else if (values.date < todayInJakarta()) next.date = copy.booking.required
    if (!values.time) next.time = copy.booking.required
    const people = Number(values.people)
    if (!Number.isInteger(people) || people < 1 || people > 20) {
      next.people = copy.booking.peopleError
    }
    return next
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const message = buildReservationMessage({
      name: values.name,
      phone: values.phone,
      date: values.date,
      time: values.time,
      people: Number(values.people),
      purpose: copy.booking.purposes[values.purpose as keyof typeof copy.booking.purposes],
      area: copy.booking.areas[values.area as keyof typeof copy.booking.areas],
      lang,
      ...(preorderText ? { preorder: preorderText } : {}),
      ...(values.notes.trim() ? { notes: values.notes } : {}),
    })

    const url = waUrl(message)
    setSentLink(url)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const fieldLabel = 'text-[0.6875rem] tracking-[0.08em] text-muted uppercase'
  const errorText = 'mt-1 text-[0.6875rem] text-terracotta'

  return (
    <section id="booking" aria-labelledby="booking-title" className="border-t border-ink-line">
      <div className="shell py-16 md:py-24">
        <SectionHeading
          id="booking-title"
          kicker={copy.booking.kicker}
          title={copy.booking.title}
          lede={copy.booking.lede}
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <form
            noValidate
            onSubmit={onSubmit}
            className="rounded-lg border border-ink-line bg-ink-raised p-5 sm:p-7"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className={fieldLabel}>{copy.booking.name}</span>
                <input
                  type="text"
                  value={values.name}
                  onChange={(event) => update('name', event.target.value)}
                  placeholder={copy.booking.namePlaceholder}
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'booking-name-error' : undefined}
                  className="field"
                />
                {errors.name ? (
                  <span id="booking-name-error" className={errorText}>
                    {errors.name}
                  </span>
                ) : null}
              </label>

              <label className="grid gap-1.5">
                <span className={fieldLabel}>{copy.booking.phone}</span>
                <input
                  type="tel"
                  inputMode="tel"
                  value={values.phone}
                  onChange={(event) => update('phone', event.target.value)}
                  placeholder={copy.booking.phonePlaceholder}
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'booking-phone-error' : undefined}
                  className="field"
                />
                {errors.phone ? (
                  <span id="booking-phone-error" className={errorText}>
                    {errors.phone}
                  </span>
                ) : null}
              </label>

              <label className="grid gap-1.5">
                <span className={fieldLabel}>{copy.booking.date}</span>
                <input
                  type="date"
                  value={values.date}
                  min={todayInJakarta()}
                  onChange={(event) => update('date', event.target.value)}
                  aria-invalid={Boolean(errors.date)}
                  aria-describedby={errors.date ? 'booking-date-error' : undefined}
                  className="field"
                />
                {errors.date ? (
                  <span id="booking-date-error" className={errorText}>
                    {errors.date}
                  </span>
                ) : null}
              </label>

              <label className="grid gap-1.5">
                <span className={fieldLabel}>{copy.booking.time}</span>
                <input
                  type="time"
                  value={values.time}
                  min="08:00"
                  max="22:00"
                  step={900}
                  onChange={(event) => update('time', event.target.value)}
                  aria-invalid={Boolean(errors.time)}
                  className="field"
                />
              </label>

              <label className="grid gap-1.5">
                <span className={fieldLabel}>{copy.booking.people}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={20}
                  value={values.people}
                  onChange={(event) => update('people', event.target.value)}
                  aria-invalid={Boolean(errors.people)}
                  aria-describedby={errors.people ? 'booking-people-error' : undefined}
                  className="field"
                />
                {errors.people ? (
                  <span id="booking-people-error" className={errorText}>
                    {errors.people}
                  </span>
                ) : null}
              </label>

              <label className="grid gap-1.5">
                <span className={fieldLabel}>{copy.booking.area}</span>
                <select
                  value={values.area}
                  onChange={(event) => update('area', event.target.value)}
                  className="field"
                >
                  {Object.entries(copy.booking.areas).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 sm:col-span-2">
                <span className={fieldLabel}>{copy.booking.purpose}</span>
                <select
                  value={values.purpose}
                  onChange={(event) => update('purpose', event.target.value)}
                  className="field"
                >
                  {Object.entries(copy.booking.purposes).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 sm:col-span-2">
                <span className={fieldLabel}>{copy.booking.notes}</span>
                <textarea
                  value={values.notes}
                  onChange={(event) => update('notes', event.target.value)}
                  placeholder={copy.booking.notesPlaceholder}
                  rows={3}
                  className="field resize-y"
                />
              </label>
            </div>

            <label
              className={`mt-4 flex items-start gap-3 rounded-sm border border-brass/20 px-3 py-3 ${
                count === 0 ? 'opacity-55' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={includeOrder}
                disabled={count === 0}
                onChange={(event) => setIncludeOrder(event.target.checked)}
                className="mt-0.5 size-4 accent-brass"
              />
              <span className="text-[0.8125rem] leading-snug text-cream">
                {count > 0
                  ? copy.booking.preorderOn.replace('{count}', String(count))
                  : copy.booking.preorderOff}
              </span>
            </label>

            <button type="submit" className={`${buttonStyles('primary', 'dark', 'lg')} mt-5 w-full`}>
              {copy.booking.submit}
            </button>

            <p className="mt-3 text-[0.6875rem] leading-relaxed text-muted">{copy.booking.note}</p>

            {sentLink ? (
              <p className="mt-3 text-[0.75rem] leading-relaxed text-brass">
                {copy.booking.sent}{' '}
                <a href={sentLink} target="_blank" rel="noreferrer" className="underline">
                  {copy.booking.sentLink}
                </a>
              </p>
            ) : null}
          </form>

          <aside className="self-start">
            <div className="overflow-hidden rounded-lg border border-ink-line">
              <div className="aspect-[4/3]">
                <PictureFrame
                  picture={media.interior}
                  alt={copy.about.interiorAlt}
                  sizes="(min-width: 1024px) 34vw, 92vw"
                  imgClassName="object-[50%_40%]"
                  className="size-full"
                />
              </div>
            </div>
            <h3 className="mt-6 font-display text-[1.75rem] text-cream">{copy.booking.asideTitle}</h3>
            <ul className="mt-3 grid gap-2.5">
              {copy.booking.aside.map((item) => (
                <li key={item} className="flex gap-2.5 text-[0.8125rem] leading-relaxed text-muted">
                  <span aria-hidden="true" className="mt-2 inline-block size-1 shrink-0 rounded-full bg-brass/80" />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  )
}
