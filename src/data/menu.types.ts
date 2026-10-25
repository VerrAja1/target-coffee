export type CategoryId =
  | 'filter-tea'
  | 'espresso'
  | 'house-latte'
  | 'black'
  | 'blend'
  | 'barista'
  | 'brew-matcha'
  | 'non-coffee'
  | 'light-bites'
  | 'rice-bowl'
  | 'soup-bowl'

export type BadgeId = 'best-seller' | 'signature' | 'new'

export type AddOnId = 'extra-shot' | 'full-arabica' | 'oat-milk' | 'onsen-egg'

export interface AddOn {
  id: AddOnId
  price: number
  label: { id: string; en: string }
}

export interface MenuItem {
  id: string
  name: string
  /** Integer rupiah, extracted 1:1 from the official menu PDF. Never estimated. */
  price: number
  description: { id: string; en: string }
  category: CategoryId
  /** Sub-heading inside a category, e.g. "Brewed Tea" vs "Matcha Series". */
  group?: 'brewed-tea' | 'matcha' | 'filter' | 'artisan-tea'
  badges: readonly BadgeId[]
  addOns?: readonly AddOnId[]
  image?: MediaId
  note?: { id: string; en: string }
}

export type MediaId =
  | 'interior'
  | 'barista'
  | 'cappuccino'
  | 'iced-latte'
  | 'americano'
  | 'citrus'
  | 'avocado'
  | 'lemon-tea'
  | 'matcha-lychee'
  | 'chocolate'
  | 'soto-ayam'
  | 'soto-tangkar'
  | 'singkong'
  | 'rice-bowl'
