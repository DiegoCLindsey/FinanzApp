import { describe, expect, it } from 'vitest'
import { expandPayroll } from './PayrollExpander'
import type { Payroll } from '@/domain/entities/Payroll'

function makePayroll(overrides: Partial<Payroll> = {}): Payroll {
  return {
    id: 'p1',
    concept: 'Salario',
    grossAmount: 2000,
    accountId: 'acc-1',
    frequency: { value: 1, unit: 'month' },
    startDate: '2024-01-01',
    endDate: null,
    effectiveDay: { mode: 'day-of-month', day: 28 },
    label: '',
    irpfMode: 'manual',
    manualIRPFRate: 20,
    displayMode: 'simplified',
    monteCarloVariance: 0,
    ...overrides,
  }
}

describe('expandPayroll', () => {
  const noConfig = () => undefined

  it('simplified mode: income is net amount', () => {
    const result = expandPayroll(makePayroll(), 2024, 0, noConfig)
    expect(result).toHaveLength(1)
    expect(result[0].incomeOccurrence.type).toBe('income')
    expect(result[0].incomeOccurrence.baseAmount).toBeCloseTo(1600, 1) // 2000 * (1 - 0.20)
    expect(result[0].irpfOccurrence).toBeNull()
  })

  it('detailed mode: produces gross income + IRPF expense', () => {
    const result = expandPayroll(makePayroll({ displayMode: 'detailed' }), 2024, 0, noConfig)
    expect(result).toHaveLength(1)
    expect(result[0].incomeOccurrence.baseAmount).toBe(2000) // gross
    expect(result[0].irpfOccurrence).not.toBeNull()
    expect(result[0].irpfOccurrence!.type).toBe('expense')
    expect(result[0].irpfOccurrence!.baseAmount).toBeCloseTo(400, 1) // 20% of 2000
  })

  it('returns empty when payroll not active in month', () => {
    const result = expandPayroll(
      makePayroll({ startDate: '2025-01-01' }),
      2024, 0, noConfig
    )
    expect(result).toHaveLength(0)
  })

  it('auto mode uses active IRPF config', () => {
    const config = {
      id: '1',
      validFrom: '2024-01-01',
      brackets: [{ from: 0, to: null, rate: 15 }],
    }
    const result = expandPayroll(
      makePayroll({ irpfMode: 'auto', manualIRPFRate: null, displayMode: 'simplified' }),
      2024, 0,
      () => config
    )
    expect(result[0].irpfRate).toBeCloseTo(15, 1)
    expect(result[0].netAmount).toBeCloseTo(2000 * 0.85, 1)
  })

  it('concept labels in detailed mode include bruto/IRPF tags', () => {
    const result = expandPayroll(makePayroll({ displayMode: 'detailed' }), 2024, 0, noConfig)
    expect(result[0].incomeOccurrence.concept).toContain('bruto')
    expect(result[0].irpfOccurrence!.concept).toContain('IRPF')
  })
})
