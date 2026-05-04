import { describe, expect, it } from 'vitest'
import { PredictionEngine } from '../predictions/PredictionEngine'
import type { Loan } from '@/domain/entities/Loan'
import type { LoanAmortization } from '@/domain/entities/LoanAmortization'

const loan: Loan = {
  id: 'l1',
  concept: 'Car loan',
  amount: 12000,
  openingCommission: 0,
  tin: 6,
  tae: null,
  termMonths: 12,
  startDate: '2024-01-01',
  accountId: 'acc-1',
  label: '',
}

describe('PredictionEngine with loans', () => {
  const engine = new PredictionEngine()
  const refDate = new Date(2024, 0, 1)

  it('deducts loan quota from account balance each month', () => {
    const result = engine.run(
      [],
      [],
      ['acc-1'],
      { 'acc-1': 50000 },
      1,
      refDate,
      { loans: [loan], loanAmortizations: [] },
    )
    // Should be less than 50000 due to quota deduction
    expect(result.months[0].p50Balance).toBeLessThan(50000)
  })

  it('includes loan quota occurrence in month occurrences', () => {
    const result = engine.run(
      [],
      [],
      ['acc-1'],
      { 'acc-1': 50000 },
      1,
      refDate,
      { loans: [loan], loanAmortizations: [] },
    )
    const occ = result.months[0].occurrences.find((o) => o.movementId === loan.id)
    expect(occ).toBeDefined()
    expect(occ?.type).toBe('expense')
  })

  it('does not deduct loan quota after loan ends', () => {
    const result = engine.run(
      [],
      [],
      ['acc-1'],
      { 'acc-1': 50000 },
      14, // beyond 12-month term
      refDate,
      { loans: [loan], loanAmortizations: [] },
    )
    // Month 13 (index 12) should have no loan occurrence
    const month13 = result.months[12]
    const occ = month13.occurrences.find((o) => o.movementId === loan.id)
    expect(occ).toBeUndefined()
  })

  it('affects quota when reduce-quota amortization is present', () => {
    const amort: LoanAmortization = {
      id: 'a1',
      loanId: 'l1',
      date: '2024-06-01',
      amount: 3000,
      type: 'reduce-quota',
      note: '',
    }

    const withoutAmort = engine.run([], [], ['acc-1'], { 'acc-1': 50000 }, 8, refDate, {
      loans: [loan],
      loanAmortizations: [],
    })
    const withAmort = engine.run([], [], ['acc-1'], { 'acc-1': 50000 }, 8, refDate, {
      loans: [loan],
      loanAmortizations: [amort],
    })

    // Month 8 balance should be higher with amortization (lower quotas after month 6)
    expect(withAmort.months[7].p50Balance).toBeGreaterThan(withoutAmort.months[7].p50Balance)
  })
})
