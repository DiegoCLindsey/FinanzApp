import { serializeAppData } from '@/infrastructure/serialization/AppDataSerializer'
import type { Account } from '@/domain/entities/Account'
import type { AccountHistoryEntry } from '@/domain/entities/AccountHistoryEntry'
import type { FixedMovement } from '@/domain/entities/FixedMovement'
import type { ExtraordinaryMovement } from '@/domain/entities/ExtraordinaryMovement'

export interface ExportPayload {
  accounts: Account[]
  accountHistory: AccountHistoryEntry[]
  fixedMovements: FixedMovement[]
  extraordinaryMovements: ExtraordinaryMovement[]
}

export function exportToJson(payload: ExportPayload): void {
  const json = serializeAppData(payload)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `finanzapp-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
