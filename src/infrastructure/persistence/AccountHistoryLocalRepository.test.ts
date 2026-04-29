import { beforeEach, describe, expect, it } from 'vitest'
import { AccountHistoryLocalRepository } from './AccountHistoryLocalRepository'
import type { AccountHistoryEntry } from '@/domain/entities/AccountHistoryEntry'

describe('AccountHistoryLocalRepository', () => {
  let repo: AccountHistoryLocalRepository

  beforeEach(() => {
    localStorage.clear()
    repo = new AccountHistoryLocalRepository()
  })

  const entry = (id: string, accountId: string, date: string, balance: number): AccountHistoryEntry => ({
    id,
    accountId,
    date,
    balance,
    note: '',
  })

  it('finds entries by accountId', () => {
    repo.save(entry('1', 'acc-a', '2024-01-01', 1000))
    repo.save(entry('2', 'acc-b', '2024-01-01', 500))
    repo.save(entry('3', 'acc-a', '2024-02-01', 1200))

    const result = repo.findByAccountId('acc-a')
    expect(result).toHaveLength(2)
    expect(result.every((e) => e.accountId === 'acc-a')).toBe(true)
  })

  it('returns latest entry by date for an account', () => {
    repo.save(entry('1', 'acc-a', '2024-01-01', 1000))
    repo.save(entry('2', 'acc-a', '2024-03-01', 1500))
    repo.save(entry('3', 'acc-a', '2024-02-01', 1200))

    const latest = repo.findLatestByAccountId('acc-a')
    expect(latest?.balance).toBe(1500)
    expect(latest?.date).toBe('2024-03-01')
  })

  it('returns undefined when no entries exist for account', () => {
    expect(repo.findLatestByAccountId('nonexistent')).toBeUndefined()
  })
})
