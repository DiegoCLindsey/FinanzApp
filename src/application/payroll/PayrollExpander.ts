import type { Payroll } from '@/domain/entities/Payroll'
import type { IRPFConfig } from '@/domain/entities/IRPFConfig'
import type { ExpandedOccurrence } from '@/application/predictions/movementExpander'
import { expandFixedMovement } from '@/application/predictions/movementExpander'
import { resolveIRPFRate } from './IRPFCalculator'

export interface ExpandedPayrollOccurrence {
  incomeOccurrence: ExpandedOccurrence
  irpfOccurrence: ExpandedOccurrence | null
  irpfRate: number
  netAmount: number
}

function payrollAsFixedMovement(payroll: Payroll) {
  return {
    id: payroll.id,
    concept: payroll.concept,
    type: 'income' as const,
    amount: payroll.grossAmount,
    frequency: payroll.frequency,
    startDate: payroll.startDate,
    endDate: payroll.endDate,
    effectiveDay: payroll.effectiveDay,
    monteCarloVariance: payroll.monteCarloVariance,
    accountId: payroll.accountId,
    targetAccountId: null,
    label: payroll.label,
    isBasicExpense: false,
  }
}

export function expandPayroll(
  payroll: Payroll,
  year: number,
  month: number,
  getActiveConfig: (date: string) => IRPFConfig | undefined,
): ExpandedPayrollOccurrence[] {
  const baseOccurrences = expandFixedMovement(payrollAsFixedMovement(payroll), year, month)
  if (baseOccurrences.length === 0) return []

  return baseOccurrences.map((occ) => {
    const annualGross = payroll.grossAmount * frequencyToYearlyMultiplier(payroll)
    const activeConfig = getActiveConfig(occ.date)
    const irpfRate = resolveIRPFRate(
      annualGross,
      occ.date,
      payroll.irpfMode,
      payroll.manualIRPFRate,
      activeConfig,
    )
    const irpfAmount = occ.baseAmount * (irpfRate / 100)
    const netAmount = occ.baseAmount - irpfAmount

    let incomeOccurrence: ExpandedOccurrence
    let irpfOccurrence: ExpandedOccurrence | null = null

    if (payroll.displayMode === 'simplified') {
      incomeOccurrence = { ...occ, baseAmount: netAmount, concept: payroll.concept }
    } else {
      incomeOccurrence = { ...occ, concept: `${payroll.concept} (bruto)` }
      irpfOccurrence = {
        ...occ,
        movementId: `${payroll.id}-irpf`,
        concept: `${payroll.concept} (IRPF ${irpfRate.toFixed(1)}%)`,
        type: 'expense',
        baseAmount: irpfAmount,
        monteCarloVariance: 0,
      }
    }

    return { incomeOccurrence, irpfOccurrence, irpfRate, netAmount }
  })
}

function frequencyToYearlyMultiplier(payroll: Payroll): number {
  const { value, unit } = payroll.frequency
  switch (unit) {
    case 'day':   return 365 / value
    case 'week':  return 52 / value
    case 'month': return 12 / value
    case 'year':  return 1 / value
  }
}
