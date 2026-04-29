import type { Account } from '@/domain/entities/Account'
import type { AccountHistoryEntry } from '@/domain/entities/AccountHistoryEntry'
import type { FixedMovement } from '@/domain/entities/FixedMovement'
import type { ExtraordinaryMovement } from '@/domain/entities/ExtraordinaryMovement'

export interface AppData {
  version: string
  exportedAt: string
  accounts: Account[]
  accountHistory: AccountHistoryEntry[]
  fixedMovements: FixedMovement[]
  extraordinaryMovements: ExtraordinaryMovement[]
}

export function serializeAppData(data: Omit<AppData, 'version' | 'exportedAt'>): string {
  const appData: AppData = {
    version: '0.1.0',
    exportedAt: new Date().toISOString(),
    ...data,
  }
  return JSON.stringify(appData, null, 2)
}

export function deserializeAppData(json: string): AppData {
  const parsed = JSON.parse(json) as AppData
  if (!parsed.version || !parsed.accounts || !parsed.fixedMovements) {
    throw new Error('Invalid FinanzApp export file')
  }
  return parsed
}
