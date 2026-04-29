import { describe, expect, it } from 'vitest'
import { resolveEffectiveDates } from './effectiveDayResolver'

describe('resolveEffectiveDates', () => {
  it('day-of-month: returns correct date', () => {
    const dates = resolveEffectiveDates({ mode: 'day-of-month', day: 15 }, 2024, 0)
    expect(dates).toHaveLength(1)
    expect(dates[0].getDate()).toBe(15)
    expect(dates[0].getMonth()).toBe(0)
  })

  it('day-of-month: clamps to last day when month is shorter', () => {
    const dates = resolveEffectiveDates({ mode: 'day-of-month', day: 31 }, 2024, 1) // Feb
    expect(dates[0].getDate()).toBe(29) // 2024 is leap year
  })

  it('day-of-week: returns all matching weekdays in month', () => {
    // January 2024: Mondays are 1, 8, 15, 22, 29
    const dates = resolveEffectiveDates({ mode: 'day-of-week', weekday: 'monday' }, 2024, 0)
    expect(dates).toHaveLength(5)
    dates.forEach((d) => expect(d.getDay()).toBe(1))
  })

  it('nth-weekday: returns 2nd Tuesday', () => {
    // January 2024: Tuesdays are 2, 9, 16, 23, 30 → 2nd is 9
    const dates = resolveEffectiveDates({ mode: 'nth-weekday', nth: 2, weekday: 'tuesday' }, 2024, 0)
    expect(dates).toHaveLength(1)
    expect(dates[0].getDate()).toBe(9)
  })

  it('nth-weekday: returns empty when nth does not exist in month', () => {
    // Feb 2024: 5th Monday — Feb has 4 or 5 weeks
    // Feb 2024 starts on Thursday, so Mondays: 5, 12, 19, 26 → no 5th Monday
    const dates = resolveEffectiveDates({ mode: 'nth-weekday', nth: 5, weekday: 'monday' }, 2024, 1)
    expect(dates).toHaveLength(0)
  })

  it('last-weekday: returns last Friday of January 2024', () => {
    // Jan 2024 Fridays: 5, 12, 19, 26 → last is 26
    const dates = resolveEffectiveDates({ mode: 'last-weekday', weekday: 'friday' }, 2024, 0)
    expect(dates).toHaveLength(1)
    expect(dates[0].getDate()).toBe(26)
  })
})
