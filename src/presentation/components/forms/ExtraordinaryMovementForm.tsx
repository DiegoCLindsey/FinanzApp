import { useState } from 'react'
import type { ExtraordinaryMovement } from '@/domain/entities/ExtraordinaryMovement'
import type { Account } from '@/domain/entities/Account'
import type { MovementType } from '@/domain/value-objects/MovementType'
import Button from '@/presentation/components/ui/Button'
import Input from '@/presentation/components/ui/Input'

interface ExtraordinaryMovementFormProps {
  initialValues?: Partial<ExtraordinaryMovement>
  accounts: Account[]
  onSubmit: (m: ExtraordinaryMovement) => void
  onCancel: () => void
}

interface FormErrors {
  concept?: string
  amount?: string
  accountId?: string
  targetAccountId?: string
}

const TODAY = new Date().toISOString().slice(0, 10)

const selectClass =
  'w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary'

export default function ExtraordinaryMovementForm({
  initialValues,
  accounts,
  onSubmit,
  onCancel,
}: ExtraordinaryMovementFormProps) {
  const [concept, setConcept] = useState(initialValues?.concept ?? '')
  const [type, setType] = useState<MovementType>(initialValues?.type ?? 'expense')
  const [amount, setAmount] = useState(
    initialValues?.amount !== undefined ? String(initialValues.amount) : ''
  )
  const [date, setDate] = useState(initialValues?.date ?? TODAY)
  const [accountId, setAccountId] = useState(initialValues?.accountId ?? '')
  const [targetAccountId, setTargetAccountId] = useState(
    initialValues?.targetAccountId ?? ''
  )
  const [label, setLabel] = useState(initialValues?.label ?? '')
  const [isBasicExpense, setIsBasicExpense] = useState(
    initialValues?.isBasicExpense ?? false
  )
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): boolean {
    const next: FormErrors = {}
    if (!concept.trim()) next.concept = 'El concepto es obligatorio'
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0)
      next.amount = 'La cuantía debe ser mayor que 0'
    if (!accountId) next.accountId = 'La cuenta es obligatoria'
    if (type === 'transfer') {
      if (!targetAccountId) {
        next.targetAccountId = 'La cuenta destino es obligatoria para transferencias'
      } else if (targetAccountId === accountId) {
        next.targetAccountId = 'La cuenta destino debe ser diferente a la cuenta origen'
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const movement: ExtraordinaryMovement = {
      id: initialValues?.id ?? crypto.randomUUID(),
      concept: concept.trim(),
      type,
      amount: parseFloat(amount),
      date,
      accountId,
      targetAccountId: type === 'transfer' ? targetAccountId : null,
      label: label.trim(),
      isBasicExpense,
    }
    onSubmit(movement)
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <Input
          label="Concepto"
          id="em-concept"
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          error={errors.concept}
          placeholder="Ej. Reparación coche"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="em-type" className="text-sm font-medium text-text-primary">
          Tipo
        </label>
        <select
          id="em-type"
          className={selectClass}
          value={type}
          onChange={(e) => setType(e.target.value as MovementType)}
        >
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
          <option value="transfer">Transferencia</option>
        </select>
      </div>

      <div>
        <Input
          label="Cuantía"
          id="em-amount"
          type="number"
          min={0}
          step={0.01}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          placeholder="0.00"
        />
      </div>

      <div>
        <Input
          label="Fecha"
          id="em-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="em-account" className="text-sm font-medium text-text-primary">
          Cuenta
        </label>
        <select
          id="em-account"
          className={selectClass}
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        >
          <option value="">Seleccionar cuenta…</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        {errors.accountId && (
          <span className="text-xs text-negative">{errors.accountId}</span>
        )}
      </div>

      {type === 'transfer' && (
        <div className="flex flex-col gap-1">
          <label htmlFor="em-target-account" className="text-sm font-medium text-text-primary">
            Cuenta destino
          </label>
          <select
            id="em-target-account"
            className={selectClass}
            value={targetAccountId}
            onChange={(e) => setTargetAccountId(e.target.value)}
          >
            <option value="">Seleccionar cuenta…</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          {errors.targetAccountId && (
            <span className="text-xs text-negative">{errors.targetAccountId}</span>
          )}
        </div>
      )}

      <div>
        <Input
          label="Etiqueta"
          id="em-label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ej. Vacaciones"
        />
      </div>

      <div className="md:col-span-2 flex items-center gap-2">
        <input
          id="em-basic"
          type="checkbox"
          checked={isBasicExpense}
          onChange={(e) => setIsBasicExpense(e.target.checked)}
          className="accent-primary w-4 h-4"
        />
        <label htmlFor="em-basic" className="text-sm text-text-primary cursor-pointer">
          Gasto básico
        </label>
      </div>

      <div className="md:col-span-2 flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Guardar
        </Button>
      </div>
    </form>
  )
}
