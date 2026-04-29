import { describe, expect, it } from 'vitest'
import {
  calculateEffectiveIRPFRate,
  resolveIRPFRate,
  DEFAULT_IRPF_BRACKETS_ES_2024,
} from './IRPFCalculator'

describe('calculateEffectiveIRPFRate', () => {
  it('returns 0 for zero income', () => {
    expect(calculateEffectiveIRPFRate(0, DEFAULT_IRPF_BRACKETS_ES_2024)).toBe(0)
  })

  it('applies only first bracket for income within it', () => {
    // 10000 is fully in the 19% bracket (0–12450)
    const rate = calculateEffectiveIRPFRate(10000, DEFAULT_IRPF_BRACKETS_ES_2024)
    expect(rate).toBeCloseTo(19, 1)
  })

  it('blends brackets for income spanning multiple', () => {
    // 20200 gross: 12450@19% + (20200-12450)@24%
    const tax = 12450 * 0.19 + (20200 - 12450) * 0.24
    const expected = (tax / 20200) * 100
    const rate = calculateEffectiveIRPFRate(20200, DEFAULT_IRPF_BRACKETS_ES_2024)
    expect(rate).toBeCloseTo(expected, 3)
  })

  it('effective rate is always less than top marginal rate', () => {
    const rate = calculateEffectiveIRPFRate(500000, DEFAULT_IRPF_BRACKETS_ES_2024)
    expect(rate).toBeLessThan(47)
    expect(rate).toBeGreaterThan(0)
  })

  it('handles custom brackets', () => {
    const brackets = [
      { from: 0, to: 10000, rate: 10 },
      { from: 10000, to: null, rate: 20 },
    ]
    // 15000: 10000@10% + 5000@20% = 1000 + 1000 = 2000 tax → 13.33%
    const rate = calculateEffectiveIRPFRate(15000, brackets)
    expect(rate).toBeCloseTo(13.33, 1)
  })
})

describe('resolveIRPFRate', () => {
  it('returns manual rate when mode is manual', () => {
    const rate = resolveIRPFRate(50000, '2024-06-01', 'manual', 25, undefined)
    expect(rate).toBe(25)
  })

  it('calculates auto rate from config brackets when mode is auto', () => {
    const config = {
      id: '1',
      validFrom: '2024-01-01',
      brackets: [{ from: 0, to: null, rate: 20 }],
    }
    const rate = resolveIRPFRate(50000, '2024-06-01', 'auto', null, config)
    expect(rate).toBeCloseTo(20, 1)
  })

  it('falls back to default ES brackets when no config and mode is auto', () => {
    const rate = resolveIRPFRate(30000, '2024-06-01', 'auto', null, undefined)
    expect(rate).toBeGreaterThan(0)
    expect(rate).toBeLessThan(47)
  })
})
