import type { IRPFConfig, IRPFBracket } from '@/domain/entities/IRPFConfig'

export const DEFAULT_IRPF_BRACKETS_ES_2024: IRPFBracket[] = [
  { from: 0,      to: 12450,  rate: 19 },
  { from: 12450,  to: 20200,  rate: 24 },
  { from: 20200,  to: 35200,  rate: 30 },
  { from: 35200,  to: 60000,  rate: 37 },
  { from: 60000,  to: 300000, rate: 45 },
  { from: 300000, to: null,   rate: 47 },
]

export function calculateEffectiveIRPFRate(annualGross: number, brackets: IRPFBracket[]): number {
  if (annualGross <= 0) return 0
  let totalTax = 0
  const sorted = [...brackets].sort((a, b) => a.from - b.from)
  for (const bracket of sorted) {
    const bracketFrom = bracket.from
    const bracketTo = bracket.to ?? Infinity
    if (annualGross <= bracketFrom) break
    const taxable = Math.min(annualGross, bracketTo) - bracketFrom
    totalTax += taxable * (bracket.rate / 100)
  }
  return (totalTax / annualGross) * 100
}

export function resolveIRPFRate(
  annualGross: number,
  _date: string,
  irpfMode: 'auto' | 'manual',
  manualRate: number | null,
  activeConfig: IRPFConfig | undefined,
): number {
  if (irpfMode === 'manual' && manualRate !== null) return manualRate
  const brackets = activeConfig?.brackets ?? DEFAULT_IRPF_BRACKETS_ES_2024
  return calculateEffectiveIRPFRate(annualGross, brackets)
}
