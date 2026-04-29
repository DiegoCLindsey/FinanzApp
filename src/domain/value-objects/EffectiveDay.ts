export type EffectiveDayMode =
  | 'day-of-month'    // e.g., the 15th of every month
  | 'day-of-week'     // e.g., every Monday
  | 'nth-weekday'     // e.g., 2nd Tuesday of the month
  | 'last-weekday'    // e.g., last Friday of the month

export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface EffectiveDayOfMonth {
  mode: 'day-of-month'
  day: number // 1–31
}

export interface EffectiveDayOfWeek {
  mode: 'day-of-week'
  weekday: Weekday
}

export interface EffectiveNthWeekday {
  mode: 'nth-weekday'
  nth: 1 | 2 | 3 | 4 | 5
  weekday: Weekday
}

export interface EffectiveLastWeekday {
  mode: 'last-weekday'
  weekday: Weekday
}

export type EffectiveDay =
  | EffectiveDayOfMonth
  | EffectiveDayOfWeek
  | EffectiveNthWeekday
  | EffectiveLastWeekday
