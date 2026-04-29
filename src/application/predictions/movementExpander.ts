import type { FixedMovement } from '@/domain/entities/FixedMovement'
import type { FrequencyUnit } from '@/domain/value-objects/Frequency'
import { resolveEffectiveDates } from './effectiveDayResolver'

export interface ExpandedOccurrence {
  movementId: string
  concept: string
  type: FixedMovement['type']
  baseAmount: number
  monteCarloVariance: number
  accountId: string
  targetAccountId: string | null
  date: string
  label: string
  isBasicExpense: boolean
}

function isActiveInMonth(movement: FixedMovement, year: number, month: number): boolean {
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)
  const start = new Date(movement.startDate)
  if (start > monthEnd) return false
  if (movement.endDate) {
    const end = new Date(movement.endDate)
    if (end < monthStart) return false
  }
  return true
}

function occursInMonth(movement: FixedMovement, year: number, month: number): boolean {
  const { value, unit } = movement.frequency
  const startDate = new Date(movement.startDate)
  const startYear = startDate.getFullYear()
  const startMonth = startDate.getMonth()

  const totalMonths = (year - startYear) * 12 + (month - startMonth)

  switch (unit as FrequencyUnit) {
    case 'day':
    case 'week':
      return true
    case 'month':
      return totalMonths >= 0 && totalMonths % value === 0
    case 'year': {
      const totalYears = year - startYear
      return totalYears >= 0 && totalYears % value === 0 && month === startMonth
    }
  }
}

export function expandFixedMovement(
  movement: FixedMovement,
  year: number,
  month: number,
): ExpandedOccurrence[] {
  if (!isActiveInMonth(movement, year, month)) return []
  if (!occursInMonth(movement, year, month)) return []

  const dates = resolveEffectiveDates(movement.effectiveDay, year, month)

  return dates
    .filter((date) => {
      if (date < new Date(movement.startDate)) return false
      if (movement.endDate && date > new Date(movement.endDate)) return false
      return true
    })
    .map((date) => ({
      movementId: movement.id,
      concept: movement.concept,
      type: movement.type,
      baseAmount: movement.amount,
      monteCarloVariance: movement.monteCarloVariance,
      accountId: movement.accountId,
      targetAccountId: movement.targetAccountId,
      date: date.toISOString().slice(0, 10),
      label: movement.label,
      isBasicExpense: movement.isBasicExpense,
    }))
}
