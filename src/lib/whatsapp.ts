import { site } from '../config/site'
import type { Bill } from './money'
import { formatRupiah } from './money'

export type Lang = 'id' | 'en'

export interface OrderMessageLine {
  name: string
  quantity: number
  addOnLabels: readonly string[]
  total: number
}

export interface OrderMessageInput {
  lines: readonly OrderMessageLine[]
  bill: Bill
  name?: string
  note?: string
  lang: Lang
}

export interface ReservationInput {
  name: string
  phone: string
  date: string
  time: string
  people: number
  purpose: string
  area: string
  notes?: string
  preorder?: string
  lang: Lang
}

const labels = {
  id: {
    orderIntro: 'Halo Target Coffee, saya mau pesan:',
    orderOutro: 'Mohon konfirmasi ketersediaan dan waktu ambil.',
    name: 'Nama',
    note: 'Catatan',
    subtotal: 'Subtotal',
    service: 'Service 5%',
    tax: 'Government tax 10%',
    total: 'Total',
    reservationIntro: 'Halo Target Coffee, saya mau reservasi meja.',
    purpose: 'Tujuan',
    area: 'Area',
    date: 'Tanggal',
    time: 'Jam',
    people: 'Jumlah orang',
    phone: 'Nomor WhatsApp',
    preorder: 'Pre-order',
    closing: 'Terima kasih.',
  },
  en: {
    orderIntro: 'Hi Target Coffee, I would like to order:',
    orderOutro: 'Please confirm availability and pickup time.',
    name: 'Name',
    note: 'Note',
    subtotal: 'Subtotal',
    service: 'Service 5%',
    tax: 'Government tax 10%',
    total: 'Total',
    reservationIntro: 'Hi Target Coffee, I would like to book a table.',
    purpose: 'Purpose',
    area: 'Area',
    date: 'Date',
    time: 'Time',
    people: 'Guests',
    phone: 'WhatsApp number',
    preorder: 'Pre-order',
    closing: 'Thank you.',
  },
} satisfies Record<Lang, Record<string, string>>

export function waUrl(text: string): string {
  return `https://wa.me/${site.contact.whatsappE164}?text=${encodeURIComponent(text)}`
}

export function buildOrderMessage({ lines, bill, name, note, lang }: OrderMessageInput): string {
  const l = labels[lang]
  const rows = lines.map((line, index) => {
    const addOns = line.addOnLabels.length > 0 ? ` (${line.addOnLabels.join(', ')})` : ''
    return `${index + 1}. ${line.quantity}x ${line.name}${addOns} - ${formatRupiah(line.total)}`
  })

  const parts = [
    l.orderIntro,
    '',
    ...rows,
    '',
    `${l.subtotal}: ${formatRupiah(bill.subtotal)}`,
    `${l.service}: ${formatRupiah(bill.service)}`,
    `${l.tax}: ${formatRupiah(bill.tax)}`,
    `${l.total}: ${formatRupiah(bill.total)}`,
  ]

  if (name && name.trim()) parts.push('', `${l.name}: ${name.trim()}`)
  if (note && note.trim()) parts.push(`${l.note}: ${note.trim()}`)
  parts.push('', l.orderOutro)

  return parts.join('\n')
}

export function formatLongDate(date: string, lang: Lang): string {
  const parsed = new Date(`${date}T12:00:00+07:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: site.hours.timeZone,
  }).format(parsed)
}

export function formatClock(time: string, lang: Lang): string {
  return lang === 'id' ? time.replace(':', '.') : time
}

export function buildReservationMessage(input: ReservationInput): string {
  const l = labels[input.lang]
  const parts = [
    l.reservationIntro,
    '',
    `${l.name}: ${input.name.trim()}`,
    `${l.phone}: ${input.phone.trim()}`,
    `${l.date}: ${formatLongDate(input.date, input.lang)}`,
    `${l.time}: ${formatClock(input.time, input.lang)} WIB`,
    `${l.people}: ${input.people}`,
    `${l.purpose}: ${input.purpose}`,
    `${l.area}: ${input.area}`,
  ]

  if (input.preorder && input.preorder.trim()) {
    parts.push(`${l.preorder}: ${input.preorder.trim()}`)
  }
  if (input.notes && input.notes.trim()) {
    parts.push(`${l.note}: ${input.notes.trim()}`)
  }

  parts.push('', l.closing)
  return parts.join('\n')
}
