import { describe, expect, it } from 'vitest'
import { sampleAmount, sampleAmounts, percentile } from './monteCarloSampler'

describe('monteCarloSampler', () => {
  it('returns exact amount when variance is 0', () => {
    expect(sampleAmount(100, 0)).toBe(100)
    expect(sampleAmount(250.50, 0)).toBe(250.50)
  })

  it('sampleAmounts returns correct count', () => {
    const samples = sampleAmounts(100, 10, 500)
    expect(samples).toHaveLength(500)
  })

  it('samples are distributed around base amount', () => {
    const samples = sampleAmounts(1000, 10, 1000)
    const mean = samples.reduce((s, v) => s + v, 0) / samples.length
    expect(mean).toBeGreaterThan(900)
    expect(mean).toBeLessThan(1100)
  })

  it('percentile: p50 of sorted values is median', () => {
    const values = [1, 2, 3, 4, 5].sort((a, b) => a - b)
    expect(percentile(values, 50)).toBe(3)
  })

  it('percentile: p0 is min, p100 is max', () => {
    const values = [10, 20, 30, 40, 50]
    expect(percentile(values, 0)).toBe(10)
    expect(percentile(values, 100)).toBe(50)
  })

  it('percentile: interpolates between values', () => {
    const values = [0, 100]
    expect(percentile(values, 50)).toBe(50)
  })
})
