import type { EffectiveDay } from '@/domain/value-objects/EffectiveDay'
import type { Frequency } from '@/domain/value-objects/Frequency'

export type IRPFMode = 'auto' | 'manual'
export type PayrollDisplayMode = 'simplified' | 'detailed'

export interface Payroll {
  id: string
  concept: string
  grossAmount: number
  accountId: string
  frequency: Frequency
  startDate: string
  endDate: string | null
  effectiveDay: EffectiveDay
  label: string
  irpfMode: IRPFMode
  manualIRPFRate: number | null
  displayMode: PayrollDisplayMode
  monteCarloVariance: number
}
