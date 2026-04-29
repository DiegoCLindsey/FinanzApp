import type { EffectiveDay } from '@/domain/value-objects/EffectiveDay'
import type { Frequency } from '@/domain/value-objects/Frequency'
import type { MovementType } from '@/domain/value-objects/MovementType'

export interface FixedMovement {
  id: string
  concept: string
  type: MovementType
  amount: number
  frequency: Frequency
  startDate: string          // ISO date string
  endDate: string | null     // ISO date string or null
  effectiveDay: EffectiveDay
  monteCarloVariance: number // percentage 0–100
  accountId: string
  targetAccountId: string | null  // only for transfers
  label: string
  isBasicExpense: boolean
}
