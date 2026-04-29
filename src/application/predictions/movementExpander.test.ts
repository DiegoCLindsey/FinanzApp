import { describe, expect, it } from 'vitest'
import { expandFixedMovement } from './movementExpander'
import type { FixedMovement } from '@/domain/entities/FixedMovement'

function makeMovement(overrides: Partial<FixedMovement> = {}): FixedMovement {
  return {
    id: '1',
    concept: 'Test',
    type: 'expense',
    amount: 100,
    frequency: { value: 1, unit: 'month' },
    startDate: '2024-01-01',
    endDate: null,
    effectiveDay: { mode: 'day-of-month', day: 1 },
    monteCarloVariance: 0,
    accountId: 'acc-1',
    targetAccountId: null,
    label: '',
    isBasicExpense: false,
    ...overrides,
  }
}

describe('expandFixedMovement', () => {
  it('returns one occurrence per month for monthly movement', () => {
    const result = expandFixedMovement(makeMovement(), 2024, 2)
    expect(result).toHaveLength(1)
    expect(result[0].date).toBe('2024-03-01')
  })

  it('returns empty for movement before startDate', () => {
    const result = expandFixedMovement(makeMovement({ startDate: '2025-01-01' }), 2024, 2)
    expect(result).toHaveLength(0)
  })

  it('returns empty for movement after endDate', () => {
    const result = expandFixedMovement(
      makeMovement({ endDate: '2024-01-31' }),
      2024,
      2
    )
    expect(result).toHaveLength(0)
  })

  it('returns multiple occurrences for weekly movement', () => {
    const result = expandFixedMovement(
      makeMovement({
        frequency: { value: 1, unit: 'week' },
        effectiveDay: { mode: 'day-of-week', weekday: 'monday' },
      }),
      2024,
      0 // January 2024 has 5 Mondays
    )
    expect(result).toHaveLength(5)
  })

  it('skips when yearly movement does not land in month', () => {
    const result = expandFixedMovement(
      makeMovement({ frequency: { value: 1, unit: 'year' }, startDate: '2024-03-01' }),
      2024,
      0 // January — wrong month
    )
    expect(result).toHaveLength(0)
  })

  it('includes yearly movement in correct month', () => {
    const result = expandFixedMovement(
      makeMovement({ frequency: { value: 1, unit: 'year' }, startDate: '2024-03-01' }),
      2025,
      2 // March next year
    )
    expect(result).toHaveLength(1)
  })

  it('bimonthly movement only triggers every 2 months', () => {
    const m = makeMovement({ frequency: { value: 2, unit: 'month' } })
    expect(expandFixedMovement(m, 2024, 0)).toHaveLength(1) // month 0 → offset 0
    expect(expandFixedMovement(m, 2024, 1)).toHaveLength(0) // month 1 → offset 1
    expect(expandFixedMovement(m, 2024, 2)).toHaveLength(1) // month 2 → offset 2
  })
})
