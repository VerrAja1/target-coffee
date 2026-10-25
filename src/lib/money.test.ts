import { describe, expect, it } from 'vitest'
import { calculateBill, formatRupiah, lineTotal } from './money'

describe('lineTotal', () => {
  it('multiplies unit price by quantity', () => {
    expect(lineTotal({ itemId: 'latte', unitPrice: 30000, quantity: 2, addOnIds: [] })).toBe(60000)
  })

  it('charges add-ons per cup, not per order', () => {
    const line = {
      itemId: 'latte',
      unitPrice: 30000,
      quantity: 3,
      addOnIds: ['oat-milk', 'extra-shot'] as const,
    }
    expect(lineTotal(line)).toBe((30000 + 8000 + 5000) * 3)
  })

  it('ignores unknown add-ons instead of inventing a price', () => {
    const line = {
      itemId: 'latte',
      unitPrice: 30000,
      quantity: 1,
      addOnIds: ['not-a-real-addon' as never],
    }
    expect(lineTotal(line)).toBe(30000)
  })
})

describe('calculateBill', () => {
  it('returns zeroes for an empty order', () => {
    expect(calculateBill([])).toEqual({ subtotal: 0, service: 0, tax: 0, total: 0 })
  })

  it('adds 5% service and 10% tax on subtotal plus service', () => {
    const bill = calculateBill([{ itemId: 'sop-iga', unitPrice: 79000, quantity: 1, addOnIds: [] }])
    expect(bill.subtotal).toBe(79000)
    expect(bill.service).toBe(3950)
    expect(bill.tax).toBe(8295)
    expect(bill.total).toBe(91245)
  })

  it('rounds each step to whole rupiah exactly once', () => {
    const bill = calculateBill([{ itemId: 'x', unitPrice: 33333, quantity: 1, addOnIds: [] }])
    expect(bill.service).toBe(1667)
    expect(bill.tax).toBe(3500)
    expect(bill.total).toBe(38500)
  })

  it('keeps the total consistent with its own parts', () => {
    const bill = calculateBill([
      { itemId: 'a', unitPrice: 28000, quantity: 2, addOnIds: ['oat-milk'] },
      { itemId: 'b', unitPrice: 59000, quantity: 1, addOnIds: ['onsen-egg'] },
    ])
    expect(bill.total).toBe(bill.subtotal + bill.service + bill.tax)
    expect(Number.isInteger(bill.total)).toBe(true)
  })
})

describe('formatRupiah', () => {
  it('formats with Indonesian thousands separators', () => {
    expect(formatRupiah(23000)).toBe('Rp23.000')
    expect(formatRupiah(115500)).toBe('Rp115.500')
  })

  it('formats zero', () => {
    expect(formatRupiah(0)).toBe('Rp0')
  })
})
