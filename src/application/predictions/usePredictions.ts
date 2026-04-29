import { useMemo } from 'react'
import { useAccountStore } from '@/store/accountStore'
import { useMovementStore } from '@/store/movementStore'
import { usePayrollStore } from '@/store/payrollStore'
import { PredictionEngine, buildStartingBalances } from '@/application/predictions/PredictionEngine'
import type { PredictionResult } from '@/application/predictions/PredictionEngine'

interface UsePredictionsResult {
  result: PredictionResult | null
  isLoading: boolean
}

export function usePredictions(horizonMonths: number): UsePredictionsResult {
  const accounts = useAccountStore((s) => s.accounts)
  const history = useAccountStore((s) => s.history)
  const fixedMovements = useMovementStore((s) => s.fixedMovements)
  const extraordinaryMovements = useMovementStore((s) => s.extraordinaryMovements)
  const payrolls = usePayrollStore((s) => s.payrolls)
  const irpfConfigs = usePayrollStore((s) => s.irpfConfigs)

  const isLoading = accounts.length === 0 && history.length === 0

  const result = useMemo<PredictionResult | null>(() => {
    if (accounts.length === 0) return null

    const accountIds = accounts.map((a) => a.id)
    const startingBalances = buildStartingBalances(accountIds, history)
    const engine = new PredictionEngine()

    return engine.run(
      fixedMovements,
      extraordinaryMovements,
      accountIds,
      startingBalances,
      horizonMonths,
      new Date(),
      { payrolls, irpfConfigs },
    )
  }, [accounts, history, fixedMovements, extraordinaryMovements, payrolls, irpfConfigs, horizonMonths])

  return { result, isLoading }
}
