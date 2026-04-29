import type { AccountHistoryEntry } from '@/domain/entities/AccountHistoryEntry'
import type { IRepository } from './IRepository'

export interface IAccountHistoryRepository extends IRepository<AccountHistoryEntry> {
  findByAccountId(accountId: string): AccountHistoryEntry[]
  findLatestByAccountId(accountId: string): AccountHistoryEntry | undefined
}
