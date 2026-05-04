import { describe, it, expect, beforeEach } from 'vitest'
import { LoanAmortizationLocalRepository } from './LoanAmortizationLocalRepository'
import type { LoanAmortization } from '@/domain/entities/LoanAmortization'

function makeAmort(overrides: Partial<LoanAmortization> = {}): LoanAmortization {
  return {
    id: crypto.randomUUID(),
    loanId: 'loan1',
    date: '2024-06-01',
    amount: 5000,
    type: 'reduce-quota',
    note: '',
    ...overrides,
  }
}

describe('LoanAmortizationLocalRepository', () => {
  let repo: LoanAmortizationLocalRepository

  beforeEach(() => {
    localStorage.clear()
    repo = new LoanAmortizationLocalRepository()
  })

  it('starts empty', () => {
    expect(repo.findAll()).toEqual([])
  })

  it('saves and retrieves amortizations', () => {
    const a = makeAmort()
    repo.save(a)
    expect(repo.findAll()).toHaveLength(1)
    expect(repo.findById(a.id)).toEqual(a)
  })

  it('filters by loanId', () => {
    repo.save(makeAmort({ loanId: 'loan1' }))
    repo.save(makeAmort({ loanId: 'loan2' }))
    expect(repo.findByLoanId('loan1')).toHaveLength(1)
    expect(repo.findByLoanId('loan2')).toHaveLength(1)
  })

  it('deletes an amortization', () => {
    const a = makeAmort()
    repo.save(a)
    repo.delete(a.id)
    expect(repo.findAll()).toHaveLength(0)
  })
})
