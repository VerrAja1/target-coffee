import { useNow } from '../../lib/hooks'
import { getOpenStatus } from '../../lib/hours'
import { statusText } from '../../lib/statusText'
import { useI18n } from '../../i18n'

interface StatusPillProps {
  compact?: boolean
  tone?: 'dark' | 'light'
}

export function StatusPill({ compact = false, tone = 'dark' }: StatusPillProps) {
  const { copy } = useI18n()
  const status = getOpenStatus(useNow())
  const label = `${status.open ? copy.status.open : copy.status.closed}, ${statusText(status, copy)}`

  return (
    <span
      className={`inline-flex items-center gap-2 text-[0.75rem] leading-none ${
        tone === 'light' ? 'text-muted-light' : 'text-muted'
      }`}
      aria-label={label}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 shrink-0 rounded-full ${status.open ? 'bg-brass' : 'bg-muted/60'}`}
      />
      <span className="sr-only">{status.open ? copy.status.open : copy.status.closed}</span>
      <span aria-hidden="true" className={compact ? 'hidden xl:inline' : ''}>
        {statusText(status, copy)}
      </span>
    </span>
  )
}
