import { describe, expect, it } from 'vitest'
import { PredictionEngine, buildStartingBalances } from './PredictionEngine'
import type { FixedMovement } from '@/domain/entities/FixedMovement'
import type { ExtraordinaryMovement } from '@/domain/entities/ExtraordinaryMovement'
import type { AccountHistoryEntry } from '@/domain/entities/AccountHistoryEntry'

function makeFixed(overrides: Partial<FixedMovement> = {}): FixedMovement {
  return {
    id: '1',
    concept: 'Rent',
    type: 'expense',
    amount: 1000,
    frequency: { value: 1, unit: 'month' },
    startDate: '2024-01-01',
    endDate: null,
    effectiveDay: { mode: 'day-of-month', day: 1 },
    monteCarloVariance: 0,
    accountId: 'acc-1',
    targetAccountId: null,
    label: '',
    isBasicExpense: true,
    ...overrides,
  }
}

describe('PredictionEngine', () => {
  const engine = new PredictionEngine()
  const refDate = new Date(2024, 0, 1) // 1 Jan 2024

  it('produces one MonthlyAccountPrediction per account per month', () => {
    const result = engine.run([], [], ['acc-1', 'acc-2'], {}, 3, refDate)
    expect(result.months).toHaveLength(6)
  })

  it('deducts expense from balance each month', () => {
    const result = engine.run(
      [makeFixed()],
      [],
      ['acc-1'],
      { 'acc-1': 3000 },
      3,
      refDate,
    )
    const months = result.months
    expect(months[0].p50Balance).toBeCloseTo(2000, 0)
    expect(months[1].p50Balance).toBeCloseTo(1000, 0)
    expect(months[2].p50Balance).toBeCloseTo(0, 0)
  })

  it('adds income to balance', () => {
    const result = engine.run(
      [makeFixed({ type: 'income' })],
      [],
      ['acc-1'],
      { 'acc-1': 1000 },
      1,
      refDate,
    )
    expect(result.months[0].p50Balance).toBeCloseTo(2000, 0)
  })

  it('handles transfer between accounts', () => {
    const transfer = makeFixed({
      type: 'transfer',
      accountId: 'acc-1',
      targetAccountId: 'acc-2',
      amount: 500,
    })
    const result = engine.run(
      [transfer],
      [],
      ['acc-1', 'acc-2'],
      { 'acc-1': 2000, 'acc-2': 0 },
      1,
      refDate,
    )
    const acc1 = result.months.find((m) => m.accountId === 'acc-1')!
    const acc2 = result.months.find((m) => m.accountId === 'acc-2')!
    expect(acc1.p50Balance).toBeCloseTo(1500, 0)
    expect(acc2.p50Balance).toBeCloseTo(500, 0)
  })

  it('applies extraordinary movement in correct month', () => {
    const extraordinary: ExtraordinaryMovement = {
      id: 'ext-1',
      concept: 'Car repair',
      type: 'expense',
      amount: 800,
      date: '2024-01-15',
      accountId: 'acc-1',
      targetAccountId: null,
      label: '',
      isBasicExpense: false,
    }
    const result = engine.run([], [extraordinary], ['acc-1'], { 'acc-1': 2000 }, 2, refDate)
    expect(result.months[0].p50Balance).toBeCloseTo(1200, 0)
    expect(result.months[1].p50Balance).toBeCloseTo(1200, 0) // no change in month 2
  })

  it('Monte Carlo produces spread when variance > 0', () => {
    const result = engine.run(
      [makeFixed({ monteCarloVariance: 20 })],
      [],
      ['acc-1'],
      { 'acc-1': 5000 },
      1,
      refDate,
    )
    const { p10Balance, p90Balance } = result.months[0]
    expect(p90Balance).toBeGreaterThan(p10Balance)
  })
})

describe('buildStartingBalances', () => {
  it('returns latest balance per account', () => {
    const entries: AccountHistoryEntry[] = [
      { id: '1', accountId: 'acc-1', date: '2024-01-01', balance: 1000, note: '' },
      { id: '2', accountId: 'acc-1', date: '2024-03-01', balance: 2000, note: '' },
      { id: '3', accountId: 'acc-2', date: '2024-02-01', balance: 500, note: '' },
    ]
    const result = buildStartingBalances(['acc-1', 'acc-2'], entries)
    expect(result['acc-1']).toBe(2000)
    expect(result['acc-2']).toBe(500)
  })

  it('defaults to 0 when no history entry exists', () => {
    const result = buildStartingBalances(['acc-x'], [])
    expect(result['acc-x']).toBe(0)
  })
})
