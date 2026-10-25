import { addOns, SERVICE_RATE, TAX_RATE } from '../config/commerce'
import type { AddOnId } from '../data/menu.types'

export interface BillLine {
  /** Menu item id. */
  itemId: string
  /** Printed menu price in integer rupiah. */
  unitPrice: number
  quantity: number
  addOnIds: readonly AddOnId[]
}

export interface Bill {
  subtotal: number
  service: number
  tax: number
  total: number
}

const addOnPrice = new Map(addOns.map((addOn) => [addOn.id, addOn.price]))

export function addOnsTotal(addOnIds: readonly AddOnId[]): number {
  return addOnIds.reduce((sum, id) => sum + (addOnPrice.get(id) ?? 0), 0)
}

export function lineTotal(line: BillLine): number {
  return (line.unitPrice + addOnsTotal(line.addOnIds)) * line.quantity
}

/**
 * Subtotal -> +5% service -> +10% government tax on (subtotal + service).
 * Rounded once per step so the printed receipt and the WhatsApp message agree.
 */
export function calculateBill(lines: readonly BillLine[]): Bill {
  const subtotal = lines.reduce((sum, line) => sum + lineTotal(line), 0)
  const service = Math.round(subtotal * SERVICE_RATE)
  const tax = Math.round((subtotal + service) * TAX_RATE)
  return { subtotal, service, tax, total: subtotal + service + tax }
}

export function itemCount(lines: readonly BillLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0)
}

const rupiah = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })

export function formatRupiah(amount: number): string {
  return `Rp${rupiah.format(amount)}`
}
