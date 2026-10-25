export const SECTION_IDS = ['home', 'about', 'menu', 'booking', 'location', 'contact'] as const
export type SectionId = (typeof SECTION_IDS)[number]
