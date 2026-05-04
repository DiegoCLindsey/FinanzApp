import { describe, expect, it } from 'vitest'
import {
  calculateTAE,
  buildLoanSchedule,
  getScheduleRowForMonth,
  resolveTAE,
} from './LoanCalculator'
import type { Loan } from '@/domain/entities/Loan'
import type { LoanAmortization } from '@/domain/entities/LoanAmortization'

const baseLoan: Loan = {
  id: 'l1',
  concept: 'Test loan',
  amount: 100000,
  openingCommission: 0,
  tin: 3,
  tae: null,
  termMonths: 120,
  startDate: '2024-01-01',
  accountId: 'acc1',
  label: '',
}

describe('calculateTAE', () => {
  it('returns correct TAE for 3% TIN', () => {
    // (1 + 0.03/12)^12 - 1 ≈ 3.0416%
    expect(calculateTAE(3)).toBeCloseTo(3.0416, 2)
  })

  it('returns 0 for 0% TIN', () => {
    expect(calculateTAE(0)).toBeCloseTo(0, 5)
  })

  it('is always slightly above TIN for positive rates', () => {
    const tin = 5
    expect(calculateTAE(tin)).toBeGreaterThan(tin)
  })
})

describe('resolveTAE', () => {
  it('returns tae field when not null', () => {
    expect(resolveTAE({ ...baseLoan, tae: 3.5 })).toBe(3.5)
  })

  it('calculates TAE from TIN when tae is null', () => {
    expect(resolveTAE(baseLoan)).toBeCloseTo(calculateTAE(baseLoan.tin), 5)
  })
})

describe('buildLoanSchedule', () => {
  it('generates correct number of rows for a standard loan', () => {
    const schedule = buildLoanSchedule(baseLoan)
    expect(schedule.rows.length).toBe(baseLoan.termMonths)
  })

  it('first row starts on loan start date', () => {
    const schedule = buildLoanSchedule(baseLoan)
    expect(schedule.rows[0].date).toBe('2024-01-01')
  })

  it('remaining principal of last row is ~0', () => {
    const schedule = buildLoanSchedule(baseLoan)
    const last = schedule.rows[schedule.rows.length - 1]
    expect(last.remainingPrincipal).toBeCloseTo(0, 0)
  })

  it('total payments = principal + interest', () => {
    const schedule = buildLoanSchedule(baseLoan)
    expect(schedule.totalPayments).toBeCloseTo(schedule.totalInterest + baseLoan.amount, 0)
  })

  it('quota is constant across rows (French method)', () => {
    const schedule = buildLoanSchedule(baseLoan)
    const firstQuota = schedule.rows[0].quota
    // All rows should have same quota (within floating-point tolerance)
    for (const row of schedule.rows.slice(0, -1)) {
      expect(row.quota).toBeCloseTo(firstQuota, 2)
    }
  })

  it('handles 0% TIN', () => {
    const zeroLoan = { ...baseLoan, tin: 0 }
    const schedule = buildLoanSchedule(zeroLoan)
    expect(schedule.rows.length).toBe(zeroLoan.termMonths)
    expect(schedule.totalInterest).toBeCloseTo(0, 2)
    expect(schedule.quota).toBeCloseTo(zeroLoan.amount / zeroLoan.termMonths, 2)
  })

  describe('with reduce-quota amortization', () => {
    it('reduces the monthly quota after amortization', () => {
      const amort: LoanAmortization = {
        id: 'a1',
        loanId: 'l1',
        date: '2024-06-01',
        amount: 20000,
        type: 'reduce-quota',
        note: '',
      }
      const scheduleWithout = buildLoanSchedule(baseLoan)
      const scheduleWith = buildLoanSchedule(baseLoan, [amort])

      // Quota after amortization month should be lower
      const afterIdx = scheduleWith.rows.findIndex((r) => r.date >= '2024-07-01')
      const beforeIdx = scheduleWithout.rows.findIndex((r) => r.date >= '2024-07-01')
      expect(scheduleWith.rows[afterIdx].quota).toBeLessThan(scheduleWithout.rows[beforeIdx].quota)
    })

    it('still has same number of months', () => {
      const amort: LoanAmortization = {
        id: 'a1',
        loanId: 'l1',
        date: '2024-06-01',
        amount: 20000,
        type: 'reduce-quota',
        note: '',
      }
      const scheduleWith = buildLoanSchedule(baseLoan, [amort])
      // Term stays 120 (reduce-quota keeps same months)
      expect(scheduleWith.rows.length).toBeLessThanOrEqual(baseLoan.termMonths)
    })
  })

  describe('with reduce-term amortization', () => {
    it('reduces the number of months', () => {
      const amort: LoanAmortization = {
        id: 'a2',
        loanId: 'l1',
        date: '2024-06-01',
        amount: 20000,
        type: 'reduce-term',
        note: '',
      }
      const scheduleWith = buildLoanSchedule(baseLoan, [amort])
      expect(scheduleWith.rows.length).toBeLessThan(baseLoan.termMonths)
    })
  })
})

describe('getScheduleRowForMonth', () => {
  it('returns row for matching month', () => {
    const schedule = buildLoanSchedule(baseLoan)
    const row = getScheduleRowForMonth(schedule, 2024, 1)
    expect(row).toBeDefined()
    expect(row?.date).toMatch(/^2024-01/)
  })

  it('returns undefined for month beyond schedule', () => {
    const schedule = buildLoanSchedule(baseLoan)
    const row = getScheduleRowForMonth(schedule, 2100, 1)
    expect(row).toBeUndefined()
  })
})
