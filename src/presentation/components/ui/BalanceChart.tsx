import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import type { PredictionResult } from '@/application/predictions/PredictionEngine'
import type { Account } from '@/domain/entities/Account'

interface BalanceChartProps {
  predictionResult: PredictionResult
  accounts: Account[]
  historyByAccount: Record<string, { date: string; balance: number }[]>
  horizonMonths: number
}

const PALETTE = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4']

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatMonthLabel(year: number, month: number): string {
  return `${MONTH_NAMES[month]} ${String(year).slice(2)}`
}

interface ChartDataPoint {
  label: string
  [key: string]: string | number | null
}

function buildChartData(
  predictionResult: PredictionResult,
  accounts: Account[],
  historyByAccount: Record<string, { date: string; balance: number }[]>,
): ChartDataPoint[] {
  const dataMap = new Map<string, ChartDataPoint>()

  for (const acc of accounts) {
    const entries = historyByAccount[acc.id] ?? []
    for (const entry of entries) {
      const d = new Date(entry.date)
      const label = formatMonthLabel(d.getFullYear(), d.getMonth())
      if (!dataMap.has(label)) {
        dataMap.set(label, { label })
      }
      const point = dataMap.get(label)!
      point[`${acc.name} (real)`] = entry.balance
    }
  }

  for (const monthPred of predictionResult.months) {
    const label = formatMonthLabel(monthPred.year, monthPred.month)
    if (!dataMap.has(label)) {
      dataMap.set(label, { label })
    }
    const point = dataMap.get(label)!
    const acc = accounts.find((a) => a.id === monthPred.accountId)
    if (acc) {
      point[`${acc.name} (pred)`] = monthPred.p50Balance
    }
  }

  return Array.from(dataMap.values())
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number | null; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="bg-surface-elevated border border-border rounded-lg p-3 shadow-lg text-sm">
      <p className="text-text-primary font-semibold mb-2">{label}</p>
      {payload.map((entry) => {
        if (entry.value === null || entry.value === undefined) return null
        return (
          <div key={entry.name} className="flex items-center gap-2 text-text-secondary">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span>{entry.name}:</span>
            <span className="text-text-primary font-medium">
              {entry.value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function BalanceChart({
  predictionResult,
  accounts,
  historyByAccount,
}: BalanceChartProps) {
  const chartData = buildChartData(predictionResult, accounts, historyByAccount)

  return (
    <div className="bg-surface rounded-xl p-4 border border-border">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            width={80}
            tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => v.toLocaleString('es-ES')}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          {accounts.map((acc, i) => {
            const color = PALETTE[i % PALETTE.length]
            return [
              <Area
                key={`${acc.id}-pred`}
                type="monotone"
                dataKey={`${acc.name} (pred)`}
                stroke={color}
                fill={color}
                fillOpacity={0.15}
                strokeWidth={2}
                dot={false}
                connectNulls
              />,
              <Line
                key={`${acc.id}-real`}
                type="monotone"
                dataKey={`${acc.name} (real)`}
                stroke={color}
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={{ r: 4, fill: color, strokeWidth: 0 }}
                connectNulls
              />,
            ]
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
