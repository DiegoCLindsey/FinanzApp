import { useState } from 'react'
import type { FixedMovement } from '@/domain/entities/FixedMovement'
import type { Account } from '@/domain/entities/Account'
import type { MovementType } from '@/domain/value-objects/MovementType'
import type { FrequencyUnit } from '@/domain/value-objects/Frequency'
import type { EffectiveDayMode, Weekday } from '@/domain/value-objects/EffectiveDay'
import Button from '@/presentation/components/ui/Button'
import Input from '@/presentation/components/ui/Input'

interface FixedMovementFormProps {
  initialValues?: Partial<FixedMovement>
  accounts: Account[]
  onSubmit: (m: FixedMovement) => void
  onCancel: () => void
}

interface FormErrors {
  concept?: string
  amount?: string
  accountId?: string
  targetAccountId?: string
  effectiveDayValue?: string
}

const WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: 'monday', label: 'Lunes' },
  { value: 'tuesday', label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday', label: 'Jueves' },
  { value: 'friday', label: 'Viernes' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
]

const NTH_OPTIONS: { value: 1 | 2 | 3 | 4 | 5; label: string }[] = [
  { value: 1, label: '1º' },
  { value: 2, label: '2º' },
  { value: 3, label: '3º' },
  { value: 4, label: '4º' },
  { value: 5, label: '5º' },
]

function getInitialEffectiveMode(m?: Partial<FixedMovement>): EffectiveDayMode {
  return m?.effectiveDay?.mode ?? 'day-of-month'
}

function getInitialEffectiveDay(m?: Partial<FixedMovement>): number {
  if (m?.effectiveDay?.mode === 'day-of-month') return m.effectiveDay.day
  return 1
}

function getInitialEffectiveWeekday(m?: Partial<FixedMovement>): Weekday {
  if (
    m?.effectiveDay?.mode === 'day-of-week' ||
    m?.effectiveDay?.mode === 'nth-weekday' ||
    m?.effectiveDay?.mode === 'last-weekday'
  ) {
    return m.effectiveDay.weekday
  }
  return 'monday'
}

function getInitialNth(m?: Partial<FixedMovement>): 1 | 2 | 3 | 4 | 5 {
  if (m?.effectiveDay?.mode === 'nth-weekday') return m.effectiveDay.nth
  return 1
}

export default function FixedMovementForm({
  initialValues,
  accounts,
  onSubmit,
  onCancel,
}: FixedMovementFormProps) {
  const [concept, setConcept] = useState(initialValues?.concept ?? '')
  const [type, setType] = useState<MovementType>(initialValues?.type ?? 'expense')
  const [amount, setAmount] = useState(
    initialValues?.amount !== undefined ? String(initialValues.amount) : ''
  )
  const [freqValue, setFreqValue] = useState(
    initialValues?.frequency?.value !== undefined ? String(initialValues.frequency.value) : '1'
  )
  const [freqUnit, setFreqUnit] = useState<FrequencyUnit>(
    initialValues?.frequency?.unit ?? 'month'
  )
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? '')
  const [noEndDate, setNoEndDate] = useState(initialValues?.endDate === null || initialValues?.endDate === undefined)
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? '')
  const [effectiveMode, setEffectiveMode] = useState<EffectiveDayMode>(
    getInitialEffectiveMode(initialValues)
  )
  const [effectiveDayNum, setEffectiveDayNum] = useState(
    getInitialEffectiveDay(initialValues)
  )
  const [effectiveWeekday, setEffectiveWeekday] = useState<Weekday>(
    getInitialEffectiveWeekday(initialValues)
  )
  const [effectiveNth, setEffectiveNth] = useState<1 | 2 | 3 | 4 | 5>(
    getInitialNth(initialValues)
  )
  const [variance, setVariance] = useState(
    initialValues?.monteCarloVariance !== undefined
      ? String(initialValues.monteCarloVariance)
      : '0'
  )
  const [accountId, setAccountId] = useState(initialValues?.accountId ?? '')
  const [targetAccountId, setTargetAccountId] = useState(
    initialValues?.targetAccountId ?? ''
  )
  const [label, setLabel] = useState(initialValues?.label ?? '')
  const [isBasicExpense, setIsBasicExpense] = useState(
    initialValues?.isBasicExpense ?? false
  )
  const [errors, setErrors] = useState<FormErrors>({})

  const selectClass =
    'w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary'

  function validate(): boolean {
    const next: FormErrors = {}
    if (!concept.trim()) next.concept = 'El concepto es obligatorio'
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) next.amount = 'La cuantía debe ser mayor que 0'
    if (!accountId) next.accountId = 'La cuenta es obligatoria'
    if (type === 'transfer') {
      if (!targetAccountId) {
        next.targetAccountId = 'La cuenta destino es obligatoria para transferencias'
      } else if (targetAccountId === accountId) {
        next.targetAccountId = 'La cuenta destino debe ser diferente a la cuenta origen'
      }
    }
    if (effectiveMode === 'day-of-month' && (effectiveDayNum < 1 || effectiveDayNum > 31)) {
      next.effectiveDayValue = 'El día debe estar entre 1 y 31'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function buildEffectiveDay() {
    switch (effectiveMode) {
      case 'day-of-month':
        return { mode: 'day-of-month' as const, day: effectiveDayNum }
      case 'day-of-week':
        return { mode: 'day-of-week' as const, weekday: effectiveWeekday }
      case 'nth-weekday':
        return { mode: 'nth-weekday' as const, nth: effectiveNth, weekday: effectiveWeekday }
      case 'last-weekday':
        return { mode: 'last-weekday' as const, weekday: effectiveWeekday }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const movement: FixedMovement = {
      id: initialValues?.id ?? crypto.randomUUID(),
      concept: concept.trim(),
      type,
      amount: parseFloat(amount),
      frequency: { value: parseInt(freqValue, 10) || 1, unit: freqUnit },
      startDate,
      endDate: noEndDate ? null : endDate || null,
      effectiveDay: buildEffectiveDay(),
      monteCarloVariance: parseInt(variance, 10) || 0,
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
          id="fm-concept"
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          error={errors.concept}
          placeholder="Ej. Alquiler"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="fm-type" className="text-sm font-medium text-text-primary">
          Tipo
        </label>
        <select
          id="fm-type"
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
          id="fm-amount"
          type="number"
          min={0}
          step={0.01}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          placeholder="0.00"
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text-primary">Frecuencia</span>
        <div className="flex gap-2">
          <input
            id="fm-freq-value"
            type="number"
            min={1}
            value={freqValue}
            onChange={(e) => setFreqValue(e.target.value)}
            className="w-24 px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            id="fm-freq-unit"
            className={`flex-1 ${selectClass}`}
            value={freqUnit}
            onChange={(e) => setFreqUnit(e.target.value as FrequencyUnit)}
          >
            <option value="day">Día(s)</option>
            <option value="week">Semana(s)</option>
            <option value="month">Mes(es)</option>
            <option value="year">Año(s)</option>
          </select>
        </div>
      </div>

      <div>
        <Input
          label="Fecha inicio"
          id="fm-start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="fm-end-date" className="text-sm font-medium text-text-primary">
          Fecha fin
        </label>
        <div className="flex items-center gap-3">
          <input
            id="fm-end-date"
            type="date"
            value={noEndDate ? '' : endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={noEndDate}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <label className="flex items-center gap-1.5 text-sm text-text-secondary whitespace-nowrap cursor-pointer">
            <input
              type="checkbox"
              checked={noEndDate}
              onChange={(e) => setNoEndDate(e.target.checked)}
              className="accent-primary"
            />
            Sin fecha fin
          </label>
        </div>
      </div>

      <div className="md:col-span-2 flex flex-col gap-1">
        <span className="text-sm font-medium text-text-primary">Día efectivo</span>
        <div className="flex flex-col gap-2">
          <select
            id="fm-effective-mode"
            className={selectClass}
            value={effectiveMode}
            onChange={(e) => setEffectiveMode(e.target.value as EffectiveDayMode)}
          >
            <option value="day-of-month">Día del mes</option>
            <option value="day-of-week">Día de la semana</option>
            <option value="nth-weekday">N-ésimo día de la semana</option>
            <option value="last-weekday">Último día de la semana</option>
          </select>

          {effectiveMode === 'day-of-month' && (
            <div className="flex flex-col gap-1">
              <input
                id="fm-effective-day"
                type="number"
                min={1}
                max={31}
                value={effectiveDayNum}
                onChange={(e) => setEffectiveDayNum(parseInt(e.target.value, 10))}
                className="w-24 px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="1–31"
              />
              {errors.effectiveDayValue && (
                <span className="text-xs text-negative">{errors.effectiveDayValue}</span>
              )}
            </div>
          )}

          {effectiveMode === 'day-of-week' && (
            <select
              id="fm-effective-weekday"
              className={`max-w-xs ${selectClass}`}
              value={effectiveWeekday}
              onChange={(e) => setEffectiveWeekday(e.target.value as Weekday)}
            >
              {WEEKDAYS.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
          )}

          {effectiveMode === 'nth-weekday' && (
            <div className="flex gap-2">
              <select
                id="fm-effective-nth"
                className={`w-24 ${selectClass}`}
                value={effectiveNth}
                onChange={(e) => setEffectiveNth(parseInt(e.target.value, 10) as 1 | 2 | 3 | 4 | 5)}
              >
                {NTH_OPTIONS.map((n) => (
                  <option key={n.value} value={n.value}>
                    {n.label}
                  </option>
                ))}
              </select>
              <select
                id="fm-effective-nth-weekday"
                className={`flex-1 max-w-xs ${selectClass}`}
                value={effectiveWeekday}
                onChange={(e) => setEffectiveWeekday(e.target.value as Weekday)}
              >
                {WEEKDAYS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {effectiveMode === 'last-weekday' && (
            <select
              id="fm-effective-last-weekday"
              className={`max-w-xs ${selectClass}`}
              value={effectiveWeekday}
              onChange={(e) => setEffectiveWeekday(e.target.value as Weekday)}
            >
              {WEEKDAYS.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div>
        <Input
          label="% Varianza Monte Carlo"
          id="fm-variance"
          type="number"
          min={0}
          max={100}
          step={1}
          value={variance}
          onChange={(e) => setVariance(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="fm-account" className="text-sm font-medium text-text-primary">
          Cuenta
        </label>
        <select
          id="fm-account"
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
          <label htmlFor="fm-target-account" className="text-sm font-medium text-text-primary">
            Cuenta destino
          </label>
          <select
            id="fm-target-account"
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
          id="fm-label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ej. Hogar"
        />
      </div>

      <div className="md:col-span-2 flex items-center gap-2">
        <input
          id="fm-basic"
          type="checkbox"
          checked={isBasicExpense}
          onChange={(e) => setIsBasicExpense(e.target.checked)}
          className="accent-primary w-4 h-4"
        />
        <label htmlFor="fm-basic" className="text-sm text-text-primary cursor-pointer">
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
