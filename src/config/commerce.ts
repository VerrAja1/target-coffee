import type { AddOn, CategoryId } from '../data/menu.types'

export const SERVICE_RATE = 0.05
export const TAX_RATE = 0.1

/**
 * Government tax is applied to subtotal + service, the convention printed on
 * Target Coffee's menu board. Integer rupiah is used end to end; only these two
 * roundings can introduce a difference.
 */
export const addOns: readonly AddOn[] = [
  { id: 'extra-shot', price: 5000, label: { id: 'Extra shot espresso', en: 'Extra espresso shot' } },
  { id: 'full-arabica', price: 5000, label: { id: 'Full arabica beans', en: 'Full arabica beans' } },
  { id: 'oat-milk', price: 8000, label: { id: 'Oat milk', en: 'Oat milk' } },
  { id: 'onsen-egg', price: 8000, label: { id: 'Onsen egg', en: 'Onsen egg' } },
]

export const categoryOrder: readonly CategoryId[] = [
  'filter-tea',
  'espresso',
  'house-latte',
  'black',
  'blend',
  'barista',
  'brew-matcha',
  'non-coffee',
  'light-bites',
  'rice-bowl',
  'soup-bowl',
]
