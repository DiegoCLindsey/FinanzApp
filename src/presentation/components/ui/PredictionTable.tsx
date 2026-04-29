import { Fragment } from 'react'
import type { PredictionResult } from '@/application/predictions/PredictionEngine'
import type { Account } from '@/domain/entities/Account'

interface PredictionTableProps {
  predictionResult: PredictionResult
  accounts: Account[]
}

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function formatCurrency(value: number, currency: string): string {
  return value.toLocaleString('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

interface MonthGroup {
  year: number
  month: number
  label: string
  byAccount: Record<string, { p10: number; p50: number; p90: number }>
}

function groupByMonth(
  predictionResult: PredictionResult,
  accounts: Account[],
): MonthGroup[] {
  const map = new Map<string, MonthGroup>()

  for (const mp of predictionResult.months) {
    const key = `${mp.year}-${mp.month}`
    if (!map.has(key)) {
      map.set(key, {
        year: mp.year,
        month: mp.month,
        label: `${MONTH_NAMES_ES[mp.month]} ${mp.year}`,
        byAccount: {},
      })
    }
    const group = map.get(key)!
    const acc = accounts.find((a) => a.id === mp.accountId)
    if (acc) {
      group.byAccount[acc.id] = {
        p10: mp.p10Balance,
        p50: mp.p50Balance,
        p90: mp.p90Balance,
      }
    }
  }

  return Array.from(map.values())
}

export default function PredictionTable({ predictionResult, accounts }: PredictionTableProps) {
  const currency = accounts[0]?.currency ?? 'EUR'
  const groups = groupByMonth(predictionResult, accounts).slice(0, 24)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-surface-elevated text-text-secondary text-left">
            <th className="px-4 py-3 font-medium whitespace-nowrap">Mes</th>
            {accounts.map((acc) => (
              <th key={acc.id} className="px-4 py-3 font-medium whitespace-nowrap" colSpan={3}>
                {acc.name}
              </th>
            ))}
          </tr>
          <tr className="bg-surface-elevated text-text-secondary text-left border-b border-border">
            <th className="px-4 py-2 font-medium" />
            {accounts.map((acc) => (
              <Fragment key={acc.id}>
                <th className="px-4 py-2 font-medium text-negative">P10</th>
                <th className="px-4 py-2 font-medium text-text-primary">P50</th>
                <th className="px-4 py-2 font-medium text-positive">P90</th>
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((group, i) => (
            <tr
              key={`${group.year}-${group.month}`}
              className={`border-t border-border ${i % 2 === 0 ? 'bg-surface' : 'bg-surface-elevated'}`}
            >
              <td className="px-4 py-3 text-text-primary font-medium whitespace-nowrap">
                {group.label}
              </td>
              {accounts.map((acc) => {
                const data = group.byAccount[acc.id]
                if (!data) {
                  return (
                    <Fragment key={acc.id}>
                      <td className="px-4 py-3 text-text-secondary">—</td>
                      <td className="px-4 py-3 text-text-secondary">—</td>
                      <td className="px-4 py-3 text-text-secondary">—</td>
                    </Fragment>
                  )
                }
                return (
                  <Fragment key={acc.id}>
                    <td
                      className={`px-4 py-3 ${data.p10 < 0 ? 'text-negative' : 'text-text-secondary'}`}
                    >
                      {formatCurrency(data.p10, currency)}
                    </td>
                    <td className="px-4 py-3 text-text-primary font-bold">
                      {formatCurrency(data.p50, currency)}
                    </td>
                    <td className="px-4 py-3 text-positive">
                      {formatCurrency(data.p90, currency)}
                    </td>
                  </Fragment>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
