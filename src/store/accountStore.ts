import { create } from 'zustand'
import type { Account } from '@/domain/entities/Account'
import type { AccountHistoryEntry } from '@/domain/entities/AccountHistoryEntry'
import { LocalStorageRepository } from '@/infrastructure/persistence/LocalStorageRepository'
import { AccountHistoryLocalRepository } from '@/infrastructure/persistence/AccountHistoryLocalRepository'

const accountRepo = new LocalStorageRepository<Account>('finanzapp:accounts')
const historyRepo = new AccountHistoryLocalRepository()

interface AccountState {
  accounts: Account[]
  history: AccountHistoryEntry[]
  loadAll: () => void
  saveAccount: (account: Account) => void
  deleteAccount: (id: string) => void
  saveHistoryEntry: (entry: AccountHistoryEntry) => void
  deleteHistoryEntry: (id: string) => void
  getLatestBalance: (accountId: string) => number
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  history: [],

  loadAll: () => {
    set({
      accounts: accountRepo.findAll(),
      history: historyRepo.findAll(),
    })
  },

  saveAccount: (account) => {
    accountRepo.save(account)
    set({ accounts: accountRepo.findAll() })
  },

  deleteAccount: (id) => {
    accountRepo.delete(id)
    set({ accounts: accountRepo.findAll() })
  },

  saveHistoryEntry: (entry) => {
    historyRepo.save(entry)
    set({ history: historyRepo.findAll() })
  },

  deleteHistoryEntry: (id) => {
    historyRepo.delete(id)
    set({ history: historyRepo.findAll() })
  },

  getLatestBalance: (accountId) => {
    const entry = historyRepo.findLatestByAccountId(accountId)
    return entry?.balance ?? 0
  },
}))
