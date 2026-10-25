import { fill } from '../i18n'
import type { Dictionary } from '../i18n'
import type { OpenStatus } from './hours'

export function statusText(status: OpenStatus, copy: Dictionary): string {
  if (status.open) return fill(copy.status.closesAt, { time: status.time })
  if (status.nextDay) return fill(copy.status.opensTomorrow, { time: status.time })
  return fill(copy.status.opensAt, { time: status.time })
}
