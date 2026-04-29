import type { FixedMovement } from '@/domain/entities/FixedMovement'
import type { Account } from '@/domain/entities/Account'
import type { MovementType } from '@/domain/value-objects/MovementType'
import Badge from '@/presentation/components/ui/Badge'
import Button from '@/presentation/components/ui/Button'

interface MovementsTableProps {
  movements: FixedMovement[]
  accounts: Account[]
  onEdit: (m: FixedMovement) => void
  onDelete: (id: string) => void
}

const TYPE_LABELS: Record<MovementType, string> = {
  expense: 'Gasto',
  income: 'Ingreso',
  transfer: 'Transferencia',
}

function formatFrequency(value: number, unit: string): string {
  const unitLabel =
    unit === 'day'
      ? 'día(s)'
      : unit === 'week'
      ? 'semana(s)'
      : unit === 'month'
      ? 'mes(es)'
      : 'año(s)'
  return `cada ${value} ${unitLabel}`
}

function formatAmount(amount: number, currency: string): string {
  try {
    return amount.toLocaleString('es-ES', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

export default function MovementsTable({
  movements,
  accounts,
  onEdit,
  onDelete,
}: MovementsTableProps) {
  const accountMap = new Map(accounts.map((a) => [a.id, a]))

  if (movements.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-text-secondary text-sm">
        No hay movimientos fijos.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-elevated text-text-secondary text-left">
            <th className="px-4 py-3 font-medium whitespace-nowrap">Concepto</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">Tipo</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">Cuantía</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">Frecuencia</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">Cuenta</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">Etiqueta</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">Básico</th>
            <th className="px-4 py-3 font-medium whitespace-nowrap">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m, index) => {
            const account = accountMap.get(m.accountId)
            const currency = account?.currency ?? 'EUR'
            const accountName = account?.name ?? m.accountId

            return (
              <tr
                key={m.id}
                className={`border-t border-border ${
                  index % 2 === 0 ? 'bg-surface' : 'bg-surface-elevated'
                }`}
              >
                <td className="px-4 py-3 text-text-primary font-medium whitespace-nowrap">
                  {m.concept}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge variant={m.type}>{TYPE_LABELS[m.type]}</Badge>
                </td>
                <td className="px-4 py-3 text-text-primary whitespace-nowrap">
                  {formatAmount(m.amount, currency)}
                </td>
                <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                  {formatFrequency(m.frequency.value, m.frequency.unit)}
                </td>
                <td className="px-4 py-3 text-text-primary whitespace-nowrap">{accountName}</td>
                <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                  {m.label || '—'}
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  {m.isBasicExpense ? (
                    <span className="text-positive font-medium">✓</span>
                  ) : (
                    <span className="text-text-secondary">–</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => onEdit(m)}>
                      Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => onDelete(m.id)}>
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
