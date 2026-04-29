import type { MovementType } from '@/domain/value-objects/MovementType'

export interface ExtraordinaryMovement {
  id: string
  concept: string
  type: MovementType
  amount: number
  date: string           // ISO date string — single occurrence
  accountId: string
  targetAccountId: string | null
  label: string
  isBasicExpense: boolean
}
