type Variant = 'primary' | 'secondary' | 'quiet'
type Tone = 'dark' | 'light'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-xs font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45'

const sizes: Record<Size, string> = {
  sm: 'min-h-9 px-3 text-[0.8125rem]',
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-12 px-6 text-[0.9375rem]',
}

export function buttonStyles(
  variant: Variant = 'primary',
  tone: Tone = 'dark',
  size: Size = 'md',
): string {
  const palette: Record<Tone, Record<Variant, string>> = {
    dark: {
      primary: 'bg-terracotta text-ink hover:bg-brass',
      secondary:
        'border border-cream/35 text-cream hover:border-brass hover:text-brass',
      quiet: 'text-cream/75 hover:text-brass',
    },
    light: {
      primary: 'bg-cocoa text-cream-soft hover:bg-ink',
      secondary:
        'border border-cocoa/30 text-cocoa hover:border-cocoa hover:bg-cocoa/5',
      quiet: 'text-muted-light hover:text-cocoa',
    },
  }

  return `${base} ${sizes[size]} ${palette[tone][variant]}`
}
