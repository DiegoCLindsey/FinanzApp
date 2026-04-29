function boxMullerSample(): number {
  const u1 = Math.random()
  const u2 = Math.random()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

export function sampleAmount(baseAmount: number, variancePercent: number): number {
  if (variancePercent === 0) return baseAmount
  const sigma = (variancePercent / 100) * Math.abs(baseAmount)
  return baseAmount + sigma * boxMullerSample()
}

export function sampleAmounts(baseAmount: number, variancePercent: number, n: number): number[] {
  return Array.from({ length: n }, () => sampleAmount(baseAmount, variancePercent))
}

export function percentile(sortedValues: number[], p: number): number {
  const index = (p / 100) * (sortedValues.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  if (lower === upper) return sortedValues[lower]
  return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * (index - lower)
}
