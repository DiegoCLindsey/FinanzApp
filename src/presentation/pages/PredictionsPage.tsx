import { useEffect, useMemo, useState } from 'react'
import { useAccountStore } from '@/store/accountStore'
import { useMovementStore } from '@/store/movementStore'
import { usePredictions } from '@/application/predictions/usePredictions'
import BalanceChart from '@/presentation/components/ui/BalanceChart'
import PredictionTable from '@/presentation/components/ui/PredictionTable'

const HORIZON_OPTIONS = [3, 6, 12, 24] as const

export default function PredictionsPage() {
  const [horizonMonths, setHorizonMonths] = useState<number>(12)

  const accounts = useAccountStore((s) => s.accounts)
  const history = useAccountStore((s) => s.history)
  const loadAccounts = useAccountStore((s) => s.loadAll)
  const fixedMovements = useMovementStore((s) => s.fixedMovements)
  const extraordinaryMovements = useMovementStore((s) => s.extraordinaryMovements)
  const loadMovements = useMovementStore((s) => s.loadAll)

  useEffect(() => {
    loadAccounts()
    loadMovements()
  }, [loadAccounts, loadMovements])

  const { result, isLoading } = usePredictions(horizonMonths)

  const historyByAccount = useMemo(() => {
    const map: Record<string, { date: string; balance: number }[]> = {}
    for (const entry of history) {
      if (!map[entry.accountId]) map[entry.accountId] = []
      map[entry.accountId].push({ date: entry.date, balance: entry.balance })
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }
    return map
  }, [history])

  const hasData = accounts.length > 0 && (fixedMovements.length > 0 || extraordinaryMovements.length > 0)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Predicciones</h1>
        <div className="flex items-center gap-2">
          {HORIZON_OPTIONS.map((months) => (
            <button
              key={months}
              onClick={() => setHorizonMonths(months)}
              className={[
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border',
                horizonMonths === months
                  ? 'bg-primary text-white border-transparent'
                  : 'bg-surface text-text-secondary border-border hover:text-text-primary',
              ].join(' ')}
            >
              {months}m
            </button>
          ))}
        </div>
      </div>

      {!hasData && !isLoading ? (
        <div className="flex items-center justify-center h-48 rounded-xl border border-border bg-surface text-text-secondary text-sm">
          Añade cuentas y movimientos para ver predicciones.
        </div>
      ) : isLoading || !result ? (
        <div className="animate-pulse bg-surface-elevated rounded-xl h-64" />
      ) : (
        <div className="flex flex-col gap-6">
          <BalanceChart
            predictionResult={result}
            accounts={accounts}
            historyByAccount={historyByAccount}
            horizonMonths={horizonMonths}
          />
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <PredictionTable predictionResult={result} accounts={accounts} />
          </div>
        </div>
      )}
    </div>
  )
}
