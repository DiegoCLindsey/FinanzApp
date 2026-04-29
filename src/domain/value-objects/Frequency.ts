export type FrequencyUnit = 'day' | 'week' | 'month' | 'year'

export interface Frequency {
  value: number
  unit: FrequencyUnit
}
