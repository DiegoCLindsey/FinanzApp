import { describe, it, expect, beforeEach } from 'vitest'
import { LoanLocalRepository } from './LoanLocalRepository'
import type { Loan } from '@/domain/entities/Loan'

function makeLoan(overrides: Partial<Loan> = {}): Loan {
  return {
    id: crypto.randomUUID(),
    concept: 'Test loan',
    amount: 50000,
    openingCommission: 0,
    tin: 2.5,
    tae: null,
    termMonths: 60,
    startDate: '2024-01-01',
    accountId: 'acc1',
    label: '',
    ...overrides,
  }
}

describe('LoanLocalRepository', () => {
  let repo: LoanLocalRepository

  beforeEach(() => {
    localStorage.clear()
    repo = new LoanLocalRepository()
  })

  it('starts empty', () => {
    expect(repo.findAll()).toEqual([])
  })

  it('saves and retrieves a loan', () => {
    const loan = makeLoan()
    repo.save(loan)
    expect(repo.findAll()).toHaveLength(1)
    expect(repo.findById(loan.id)).toEqual(loan)
  })

  it('filters by accountId', () => {
    repo.save(makeLoan({ accountId: 'acc1' }))
    repo.save(makeLoan({ accountId: 'acc2' }))
    expect(repo.findByAccountId('acc1')).toHaveLength(1)
    expect(repo.findByAccountId('acc2')).toHaveLength(1)
    expect(repo.findByAccountId('acc3')).toHaveLength(0)
  })

  it('deletes a loan', () => {
    const loan = makeLoan()
    repo.save(loan)
    repo.delete(loan.id)
    expect(repo.findAll()).toHaveLength(0)
  })
})
