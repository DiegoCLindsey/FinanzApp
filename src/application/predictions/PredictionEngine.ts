import type { FixedMovement } from '@/domain/entities/FixedMovement'
import type { ExtraordinaryMovement } from '@/domain/entities/ExtraordinaryMovement'
import type { AccountHistoryEntry } from '@/domain/entities/AccountHistoryEntry'
import { expandFixedMovement } from './movementExpander'
import type { ExpandedOccurrence } from './movementExpander'
import { sampleAmounts, percentile } from './monteCarloSampler'

export interface MonthlyAccountPrediction {
  accountId: string
  year: number
  month: number
  occurrences: ExpandedOccurrence[]
  p10Balance: number
  p50Balance: number
  p90Balance: number
}

export interface PredictionResult {
  months: MonthlyAccountPrediction[]
}

const MONTE_CARLO_RUNS = 200

function applyAmount(
  balance: number,
  occurrence: ExpandedOccurrence,
  targetAccountId: string | null,
  accountId: string,
  sampledAmount: number,
): number {
  if (occurrence.type === 'transfer') {
    if (occurrence.accountId === accountId) return balance - sampledAmount
    if (targetAccountId === accountId) return balance + sampledAmount
    return balance
  }
  if (occurrence.type === 'expense') return balance - sampledAmount
  if (occurrence.type === 'income') return balance + sampledAmount
  return balance
}

export class PredictionEngine {
  run(
    fixedMovements: FixedMovement[],
    extraordinaryMovements: ExtraordinaryMovement[],
    accountIds: string[],
    startingBalances: Record<string, number>,
    horizonMonths: number,
    referenceDate: Date = new Date(),
  ): PredictionResult {
    const startYear = referenceDate.getFullYear()
    const startMonth = referenceDate.getMonth()
    const results: MonthlyAccountPrediction[] = []

    const runningBalances: Record<string, number> = { ...startingBalances }

    for (let i = 0; i < horizonMonths; i++) {
      const totalMonths = startMonth + i
      const year = startYear + Math.floor(totalMonths / 12)
      const month = totalMonths % 12

      for (const accountId of accountIds) {
        const fixed = fixedMovements.flatMap((m) => expandFixedMovement(m, year, month))
        const relevant = fixed.filter(
          (o) => o.accountId === accountId || o.targetAccountId === accountId,
        )

        const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`
        const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate().toString().padStart(2, '0')}`
        const extraordinary = extraordinaryMovements.filter((m) => {
          return (
            m.date >= monthStart &&
            m.date <= monthEnd &&
            (m.accountId === accountId || m.targetAccountId === accountId)
          )
        })

        const baseBalance = runningBalances[accountId] ?? 0

        const allRuns = Array.from({ length: MONTE_CARLO_RUNS }, () => {
          let balance = baseBalance
          for (const occ of relevant) {
            const sampled = sampleAmounts(occ.baseAmount, occ.monteCarloVariance, 1)[0]
            balance = applyAmount(balance, occ, occ.targetAccountId, accountId, sampled)
          }
          for (const ext of extraordinary) {
            if (ext.type === 'expense') balance -= ext.amount
            else if (ext.type === 'income') balance += ext.amount
            else if (ext.type === 'transfer') {
              if (ext.accountId === accountId) balance -= ext.amount
              else if (ext.targetAccountId === accountId) balance += ext.amount
            }
          }
          return balance
        })

        allRuns.sort((a, b) => a - b)

        const p50 = percentile(allRuns, 50)
        runningBalances[accountId] = p50

        const extraordinaryOccurrences: ExpandedOccurrence[] = extraordinary.map((m) => ({
          movementId: m.id,
          concept: m.concept,
          type: m.type,
          baseAmount: m.amount,
          monteCarloVariance: 0,
          accountId: m.accountId,
          targetAccountId: m.targetAccountId,
          date: m.date,
          label: m.label,
          isBasicExpense: m.isBasicExpense,
        }))

        results.push({
          accountId,
          year,
          month,
          occurrences: [...relevant, ...extraordinaryOccurrences],
          p10Balance: percentile(allRuns, 10),
          p50Balance: p50,
          p90Balance: percentile(allRuns, 90),
        })
      }
    }

    return { months: results }
  }
}

export function buildStartingBalances(
  accountIds: string[],
  historyEntries: AccountHistoryEntry[],
): Record<string, number> {
  const result: Record<string, number> = {}
  for (const id of accountIds) {
    const entries = historyEntries
      .filter((e) => e.accountId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    result[id] = entries[0]?.balance ?? 0
  }
  return result
}
