import type { EffectiveDay, Weekday } from '@/domain/value-objects/EffectiveDay'

const WEEKDAY_INDEX: Record<Weekday, number> = {
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
  friday: 5, saturday: 6, sunday: 0,
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function nthWeekdayOfMonth(year: number, month: number, weekday: Weekday, nth: number): Date | null {
  const targetDay = WEEKDAY_INDEX[weekday]
  let count = 0
  const days = lastDayOfMonth(year, month)
  for (let d = 1; d <= days; d++) {
    if (new Date(year, month, d).getDay() === targetDay) {
      count++
      if (count === nth) return new Date(year, month, d)
    }
  }
  return null
}

function lastWeekdayOfMonth(year: number, month: number, weekday: Weekday): Date {
  const targetDay = WEEKDAY_INDEX[weekday]
  const days = lastDayOfMonth(year, month)
  for (let d = days; d >= 1; d--) {
    if (new Date(year, month, d).getDay() === targetDay) {
      return new Date(year, month, d)
    }
  }
  return new Date(year, month, days)
}

export function resolveEffectiveDates(
  effectiveDay: EffectiveDay,
  year: number,
  month: number,
): Date[] {
  switch (effectiveDay.mode) {
    case 'day-of-month': {
      const day = Math.min(effectiveDay.day, lastDayOfMonth(year, month))
      return [new Date(year, month, day)]
    }
    case 'day-of-week': {
      const targetDay = WEEKDAY_INDEX[effectiveDay.weekday]
      const dates: Date[] = []
      const days = lastDayOfMonth(year, month)
      for (let d = 1; d <= days; d++) {
        if (new Date(year, month, d).getDay() === targetDay) {
          dates.push(new Date(year, month, d))
        }
      }
      return dates
    }
    case 'nth-weekday': {
      const date = nthWeekdayOfMonth(year, month, effectiveDay.weekday, effectiveDay.nth)
      return date ? [date] : []
    }
    case 'last-weekday': {
      return [lastWeekdayOfMonth(year, month, effectiveDay.weekday)]
    }
  }
}
