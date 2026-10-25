import { describe, expect, it } from 'vitest'
import { buildOrderMessage, buildReservationMessage, formatLongDate, waUrl } from './whatsapp'

const bill = { subtotal: 60000, service: 3000, tax: 6300, total: 69300 }

describe('waUrl', () => {
  it('targets the official number and encodes the text', () => {
    const url = waUrl('Halo & terima kasih')
    expect(url.startsWith('https://wa.me/6285194498342?text=')).toBe(true)
    expect(url).toContain('%26')
    expect(url).toContain('%20')
  })
})

describe('buildOrderMessage', () => {
  it('lists every line, add-on, and the tax breakdown', () => {
    const message = buildOrderMessage({
      lines: [
        { name: 'Kopi Sanger', quantity: 2, addOnLabels: ['Oat milk'], total: 72000 },
        { name: 'Soto Tangkar', quantity: 1, addOnLabels: [], total: 69000 },
      ],
      bill,
      lang: 'id',
    })

    expect(message).toContain('1. 2x Kopi Sanger (Oat milk) - Rp72.000')
    expect(message).toContain('2. 1x Soto Tangkar - Rp69.000')
    expect(message).toContain('Subtotal: Rp60.000')
    expect(message).toContain('Service 5%: Rp3.000')
    expect(message).toContain('Government tax 10%: Rp6.300')
    expect(message).toContain('Total: Rp69.300')
  })

  it('omits empty name and note instead of writing blanks', () => {
    const message = buildOrderMessage({
      lines: [{ name: 'Latte', quantity: 1, addOnLabels: [], total: 30000 }],
      bill,
      name: '   ',
      note: '',
      lang: 'en',
    })
    expect(message).not.toContain('Name:')
    expect(message).not.toContain('Note:')
  })

  it('switches language', () => {
    const message = buildOrderMessage({
      lines: [{ name: 'Latte', quantity: 1, addOnLabels: [], total: 30000 }],
      bill,
      lang: 'en',
    })
    expect(message).toContain('I would like to order')
    expect(message).toContain('Total: Rp69.300')
  })

  it('never uses an em dash', () => {
    const message = buildOrderMessage({
      lines: [{ name: 'Latte', quantity: 1, addOnLabels: [], total: 30000 }],
      bill,
      lang: 'id',
    })
    expect(message).not.toContain('\u2014')
  })
})

describe('buildReservationMessage', () => {
  it('includes date, time, people, purpose, and area', () => {
    const message = buildReservationMessage({
      name: 'Rani',
      phone: '0812',
      date: '2026-10-31',
      time: '19:30',
      people: 4,
      purpose: 'Nongkrong',
      area: 'Indoor AC, non-smoking',
      lang: 'id',
    })

    expect(message).toContain('Nama: Rani')
    expect(message).toContain('Jumlah orang: 4')
    expect(message).toContain('19.30 WIB')
    expect(message).toContain('Nongkrong')
    expect(message).toContain('Indoor AC, non-smoking')
    expect(message).toContain('2026')
  })

  it('adds optional preorder and notes when present', () => {
    const message = buildReservationMessage({
      name: 'Rani',
      phone: '0812',
      date: '2026-10-31',
      time: '19:30',
      people: 4,
      purpose: 'WFC',
      area: 'Outdoor',
      preorder: '2 Kopi Sanger',
      notes: 'Dekat colokan',
      lang: 'en',
    })
    expect(message).toContain('Pre-order: 2 Kopi Sanger')
    expect(message).toContain('Note: Dekat colokan')
  })
})

describe('formatLongDate', () => {
  it('formats in Indonesian without shifting the day', () => {
    expect(formatLongDate('2026-10-31', 'id')).toBe('Sabtu, 31 Oktober 2026')
  })

  it('formats in English', () => {
    expect(formatLongDate('2026-10-31', 'en')).toContain('Saturday')
    expect(formatLongDate('2026-10-31', 'en')).toContain('31 October 2026')
  })
})
