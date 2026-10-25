import interior from '../assets/images/01-interior-bar-lamarzocco.jpg?w=480;800;1200&format=avif;webp;jpg&as=picture'
import barista from '../assets/images/02-barista-pouring-latte-art.jpg?w=420;720;900&format=avif;webp;jpg&as=picture'
import cappuccino from '../assets/images/03-hot-cappuccino-ceramic.jpg?w=320;560&format=avif;webp;jpg&as=picture'
import icedLatte from '../assets/images/04-barista-holding-iced-latte.jpg?w=320;560;900;1200&format=avif;webp;jpg&as=picture'
import americano from '../assets/images/05-americano-top-view.jpg?w=320;560&format=avif;webp;jpg&as=picture'
import citrus from '../assets/images/06-barista-creation-citrus.jpg?w=320;560&format=avif;webp;jpg&as=picture'
import avocado from '../assets/images/07-avocado-coffee-float.jpg?w=320;560&format=avif;webp;jpg&as=picture'
import lemonTea from '../assets/images/08-iced-lemon-tea.jpg?w=320;560&format=avif;webp;jpg&as=picture'
import matchaLychee from '../assets/images/09-matcha-lychee-layered.jpg?w=320;560&format=avif;webp;jpg&as=picture'
import chocolate from '../assets/images/10-iced-chocolate-fluted.jpg?w=320;560&format=avif;webp;jpg&as=picture'
import sotoAyam from '../assets/images/11-soto-ayam-ambengan.jpg?w=480;800;1200&format=avif;webp;jpg&as=picture'
import sotoTangkar from '../assets/images/12-soto-tangkar-bowl.jpg?w=320;460&format=avif;webp;jpg&as=picture'
import singkong from '../assets/images/13-singkong-goreng-salatiga.jpg?w=320;457&format=avif;webp;jpg&as=picture'
import riceBowl from '../assets/images/14-rice-bowl-kangkung-crispy.jpg?w=320;459&format=avif;webp;jpg&as=picture'
import type { MediaId } from '../data/menu.types'

export interface Picture {
  sources: Record<string, string>
  img: { src: string; w: number; h: number }
}

/**
 * Photo to menu-item mapping, kept in one place on purpose.
 * 11-soto-ayam is a kitchen photo: Soto Ayam is not on the menu, so it never
 * appears on a menu card. 06-citrus is mapped to Honey Yuzu (the only citrus
 * drink on the menu) and is a one-line change if the owner prefers otherwise.
 */
export const media = {
  interior,
  barista,
  cappuccino,
  'iced-latte': icedLatte,
  americano,
  citrus,
  avocado,
  'lemon-tea': lemonTea,
  'matcha-lychee': matchaLychee,
  chocolate,
  'soto-ayam': sotoAyam,
  'soto-tangkar': sotoTangkar,
  singkong,
  'rice-bowl': riceBowl,
} satisfies Record<MediaId, Picture>

export function mediaFor(id: MediaId | undefined): Picture | undefined {
  return id ? media[id] : undefined
}
