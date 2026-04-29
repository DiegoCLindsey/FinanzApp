import { beforeEach, describe, expect, it } from 'vitest'
import { ExtraordinaryMovementLocalRepository } from './ExtraordinaryMovementLocalRepository'
import type { ExtraordinaryMovement } from '@/domain/entities/ExtraordinaryMovement'

describe('ExtraordinaryMovementLocalRepository', () => {
  let repo: ExtraordinaryMovementLocalRepository

  beforeEach(() => {
    localStorage.clear()
    repo = new ExtraordinaryMovementLocalRepository()
  })

  const mov = (id: string, accountId: string, date: string): ExtraordinaryMovement => ({
    id,
    concept: `Movement ${id}`,
    type: 'expense',
    amount: 100,
    date,
    accountId,
    targetAccountId: null,
    label: '',
    isBasicExpense: false,
  })

  it('finds by accountId', () => {
    repo.save(mov('1', 'acc-a', '2024-05-01'))
    repo.save(mov('2', 'acc-b', '2024-05-01'))
    expect(repo.findByAccountId('acc-a')).toHaveLength(1)
  })

  it('finds by date range (inclusive)', () => {
    repo.save(mov('1', 'acc-a', '2024-01-15'))
    repo.save(mov('2', 'acc-a', '2024-03-20'))
    repo.save(mov('3', 'acc-a', '2024-06-01'))

    const result = repo.findByDateRange('2024-01-01', '2024-04-30')
    expect(result).toHaveLength(2)
    expect(result.map((m) => m.id).sort()).toEqual(['1', '2'])
  })

  it('returns empty array when no match in range', () => {
    repo.save(mov('1', 'acc-a', '2024-12-01'))
    expect(repo.findByDateRange('2024-01-01', '2024-06-30')).toEqual([])
  })
})
