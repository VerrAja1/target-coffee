import { site } from '../config/site'

export interface OpenStatus {
  open: boolean
  /** "21.00" style closing or opening time. */
  time: string
  /** Minutes until close when open, until open when closed. */
  minutes: number
  /** Day label for the next opening, only when closed for the day. */
  nextDay: string | null
}

interface JakartaNow {
  dayIndex: number
  minutes: number
}

const weekdayIndex: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

export function jakartaNow(now: Date): JakartaNow {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: site.hours.timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now)

  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ''
  const dayIndex = weekdayIndex[get('weekday')] ?? 0
  const hour = Number(get('hour')) % 24
  const minute = Number(get('minute'))

  return { dayIndex, minutes: hour * 60 + minute }
}

function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  return `${String(hours).padStart(2, '0')}.${String(minutes).padStart(2, '0')}`
}

export function formatMinutesLabel(total: number): string {
  return formatMinutes(total)
}

export function getOpenStatus(now: Date = new Date()): OpenStatus {
  const { dayIndex, minutes } = jakartaNow(now)
  const today = site.hours.byDay[dayIndex]

  if (today && minutes >= today.open && minutes < today.close) {
    return {
      open: true,
      time: formatMinutes(today.close),
      minutes: today.close - minutes,
      nextDay: null,
    }
  }

  if (today && minutes < today.open) {
    return {
      open: false,
      time: formatMinutes(today.open),
      minutes: today.open - minutes,
      nextDay: null,
    }
  }

  const tomorrow = site.hours.byDay[(dayIndex + 1) % 7]
  const open = tomorrow?.open ?? 8 * 60
  return {
    open: false,
    time: formatMinutes(open),
    minutes: 24 * 60 - minutes + open,
    nextDay: tomorrow?.label ?? null,
  }
}
