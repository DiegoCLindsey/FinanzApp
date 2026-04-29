import type { AccountHistoryEntry } from '@/domain/entities/AccountHistoryEntry'
import type { IAccountHistoryRepository } from '@/domain/repositories/IAccountHistoryRepository'
import { LocalStorageRepository } from './LocalStorageRepository'

export class AccountHistoryLocalRepository
  extends LocalStorageRepository<AccountHistoryEntry>
  implements IAccountHistoryRepository
{
  constructor() {
    super('finanzapp:account_history')
  }

  findByAccountId(accountId: string): AccountHistoryEntry[] {
    return this.findAll().filter((e) => e.accountId === accountId)
  }

  findLatestByAccountId(accountId: string): AccountHistoryEntry | undefined {
    return this.findByAccountId(accountId).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]
  }
}
