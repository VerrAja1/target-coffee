import { describe, expect, it } from 'vitest'
import { getOpenStatus } from './hours'

// All fixtures are explicit +07:00 instants, so the test never depends on the
// machine timezone.
const sundayMorning = new Date('2026-10-25T09:00:00+07:00')
const sundayNight = new Date('2026-10-25T21:30:00+07:00')
const mondayNoon = new Date('2026-10-26T12:00:00+07:00')
const mondayLate = new Date('2026-10-26T22:15:00+07:00')
const saturdayLate = new Date('2026-10-31T22:15:00+07:00')

describe('getOpenStatus', () => {
  it('reports open on a Sunday morning and closes at 22.00', () => {
    const status = getOpenStatus(sundayMorning)
    expect(status.open).toBe(true)
    expect(status.time).toBe('22.00')
    expect(status.minutes).toBe((22 - 9) * 60)
  })

  it('reports open late on Sunday until 22.00', () => {
    expect(getOpenStatus(sundayNight).open).toBe(true)
  })

  it('reports open on Monday and closes at 21.00', () => {
    const status = getOpenStatus(mondayNoon)
    expect(status.open).toBe(true)
    expect(status.time).toBe('21.00')
    expect(status.minutes).toBe((21 - 12) * 60)
  })

  it('closes at 21.00 sharp on a weekday', () => {
    expect(getOpenStatus(new Date('2026-10-26T21:00:00+07:00')).open).toBe(false)
  })

  it('points to tomorrow morning when closed at night', () => {
    const status = getOpenStatus(mondayLate)
    expect(status.open).toBe(false)
    expect(status.time).toBe('08.00')
    expect(status.nextDay).toBe('Selasa')
    expect(status.minutes).toBe(105 + 8 * 60)
  })

  it('stays open on Saturday until 21.59', () => {
    expect(getOpenStatus(new Date('2026-10-31T21:59:00+07:00')).open).toBe(true)
  })

  it('closes Saturday at 22.00', () => {
    expect(getOpenStatus(saturdayLate).open).toBe(false)
    expect(getOpenStatus(saturdayLate).time).toBe('08.00')
    expect(getOpenStatus(saturdayLate).nextDay).toBe('Minggu')
  })

  it('points to today 08.00 before opening', () => {
    const status = getOpenStatus(new Date('2026-10-26T06:30:00+07:00'))
    expect(status.open).toBe(false)
    expect(status.nextDay).toBeNull()
    expect(status.minutes).toBe(90)
  })
})
