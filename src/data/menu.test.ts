import { describe, expect, it } from 'vitest'
import { menu } from './menu'
import { addOns } from '../config/commerce'
import { media } from './media'
import type { MediaId } from './menu.types'

describe('menu data', () => {
  it('contains the full 60 items from the official menu', () => {
    expect(menu).toHaveLength(60)
  })

  it('has unique ids', () => {
    const ids = new Set(menu.map((item) => item.id))
    expect(ids.size).toBe(menu.length)
  })

  it('uses whole rupiah prices, never a zero or a guess', () => {
    for (const item of menu) {
      expect(Number.isInteger(item.price), item.id).toBe(true)
      expect(item.price, item.id).toBeGreaterThan(0)
      expect(item.price % 1000, item.id).toBe(0)
    }
  })

  it('covers every category in the PRD', () => {
    const categories = new Set(menu.map((item) => item.category))
    expect([...categories].sort()).toEqual(
      [
        'barista',
        'black',
        'blend',
        'brew-matcha',
        'espresso',
        'filter-tea',
        'house-latte',
        'light-bites',
        'non-coffee',
        'rice-bowl',
        'soup-bowl',
      ].sort(),
    )
  })

  it('only references photos that exist', () => {
    for (const item of menu) {
      if (!item.image) continue
      expect(media[item.image as MediaId], item.id).toBeDefined()
    }
  })

  it('only references add-ons that exist, and only where the PDF allows them', () => {
    const known = new Set(addOns.map((addOn) => addOn.id))
    for (const item of menu) {
      for (const addOn of item.addOns ?? []) {
        expect(known.has(addOn), `${item.id} -> ${addOn}`).toBe(true)
      }
      if (item.addOns) {
        expect(['espresso', 'house-latte', 'black', 'rice-bowl']).toContain(item.category)
      }
    }
  })

  it('writes both languages for every description', () => {
    for (const item of menu) {
      expect(item.description.id.length, item.id).toBeGreaterThan(3)
      expect(item.description.en.length, item.id).toBeGreaterThan(3)
    }
  })

  it('keeps the printed anchor prices exactly as in the PDF', () => {
    const find = (id: string) => menu.find((item) => item.id === id)?.price
    expect(find('filter-tier-1')).toBe(38000)
    expect(find('filter-tier-3')).toBe(58000)
    expect(find('matcha-latte')).toBe(65000)
    expect(find('sop-iga')).toBe(79000)
    expect(find('house-tea')).toBe(16000)
    expect(find('singkong-goreng')).toBe(38000)
  })
})
