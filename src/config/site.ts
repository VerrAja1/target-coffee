/**
 * Single source of truth for business facts.
 * Components must never hardcode an address, phone number, or opening hour.
 */
export const site = {
  name: 'Target Coffee',
  tagline: 'Your Neighbourhood Coffee Shop',
  address: {
    street: 'Jl. Kusuma V, Wijaya Kusuma',
    district: 'Grogol Petamburan',
    city: 'Jakarta Barat',
    region: 'DKI Jakarta',
    country: 'Indonesia',
    full: 'Jl. Kusuma V, Wijaya Kusuma, Grogol Petamburan, Jakarta Barat',
    landmark: 'Area Dutamas / Jelambar',
  },
  contact: {
    whatsappDisplay: '+62 851-9449-8342',
    whatsappE164: '6285194498342',
    instagramHandle: '@target.coffee.id',
    instagramUrl: 'https://instagram.com/target.coffee.id',
    tiktokHandle: '@target.coffee.id',
    tiktokUrl: 'https://www.tiktok.com/@target.coffee.id',
  },
  maps: {
    /** Keyless embed. Query is the verified address, not invented coordinates. */
    embedUrl:
      'https://www.google.com/maps?q=Target+Coffee+Jl.+Kusuma+V+Wijaya+Kusuma+Grogol+Petamburan+Jakarta+Barat&output=embed',
    placeUrl:
      'https://www.google.com/maps/search/?api=1&query=Target+Coffee+Jl.+Kusuma+V+Wijaya+Kusuma+Jakarta+Barat',
    directionsUrl:
      'https://www.google.com/maps/dir/?api=1&destination=Target+Coffee+Jl.+Kusuma+V+Wijaya+Kusuma+Jakarta+Barat',
  },
  hours: {
    /** 24h, Asia/Jakarta. Index 0 = Sunday, matching Date.getDay(). */
    byDay: [
      { day: 0, open: 8 * 60, close: 22 * 60, label: 'Minggu' },
      { day: 1, open: 8 * 60, close: 21 * 60, label: 'Senin' },
      { day: 2, open: 8 * 60, close: 21 * 60, label: 'Selasa' },
      { day: 3, open: 8 * 60, close: 21 * 60, label: 'Rabu' },
      { day: 4, open: 8 * 60, close: 21 * 60, label: 'Kamis' },
      { day: 5, open: 8 * 60, close: 22 * 60, label: 'Jumat' },
      { day: 6, open: 8 * 60, close: 22 * 60, label: 'Sabtu' },
    ],
    timeZone: 'Asia/Jakarta',
  },
  capacityNote: 'Indoor ber-AC dan outdoor',
} as const

export type Site = typeof site
