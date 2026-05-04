import { useState } from 'react'
import type { Payroll, IRPFMode, PayrollDisplayMode } from '@/domain/entities/Payroll'
import type { Account } from '@/domain/entities/Account'
import type { FrequencyUnit } from '@/domain/value-objects/Frequency'
import type { EffectiveDayMode, Weekday } from '@/domain/value-objects/EffectiveDay'
import Button from '@/presentation/components/ui/Button'
import Input from '@/presentation/components/ui/Input'

interface PayrollFormProps {
  initialValues?: Partial<Payroll>
  accounts: Account[]
  onSubmit: (p: Payroll) => void
  onCancel: () => void
}

interface FormErrors {
  concept?: string
  grossAmount?: string
  accountId?: string
  effectiveDayValue?: string
  manualIRPFRate?: string
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

function getInitialEffectiveMode(m?: Partial<Payroll>): EffectiveDayMode {
  return m?.effectiveDay?.mode ?? 'day-of-month'
}

function getInitialEffectiveDay(m?: Partial<Payroll>): number {
  if (m?.effectiveDay?.mode === 'day-of-month') return m.effectiveDay.day
  return 1
}

function getInitialEffectiveWeekday(m?: Partial<Payroll>): Weekday {
  if (
    m?.effectiveDay?.mode === 'day-of-week' ||
    m?.effectiveDay?.mode === 'nth-weekday' ||
    m?.effectiveDay?.mode === 'last-weekday'
  ) {
    return m.effectiveDay.weekday
  }
  return 'monday'
}

function getInitialNth(m?: Partial<Payroll>): 1 | 2 | 3 | 4 | 5 {
  if (m?.effectiveDay?.mode === 'nth-weekday') return m.effectiveDay.nth
  return 1
}

export default function PayrollForm({
  initialValues,
  accounts,
  onSubmit,
  onCancel,
}: PayrollFormProps) {
  const [concept, setConcept] = useState(initialValues?.concept ?? '')
  const [grossAmount, setGrossAmount] = useState(
    initialValues?.grossAmount !== undefined ? String(initialValues.grossAmount) : ''
  )
  const [accountId, setAccountId] = useState(initialValues?.accountId ?? '')
  const [freqValue, setFreqValue] = useState(
    initialValues?.frequency?.value !== undefined ? String(initialValues.frequency.value) : '1'
  )
  const [freqUnit, setFreqUnit] = useState<FrequencyUnit>(
    initialValues?.frequency?.unit ?? 'month'
  )
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? '')
  const [noEndDate, setNoEndDate] = useState(
    initialValues?.endDate === null || initialValues?.endDate === undefined
  )
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? '')
  const [effectiveMode, setEffectiveMode] = useState<EffectiveDayMode>(
    getInitialEffectiveMode(initialValues)
  )
  const [effectiveDayNum, setEffectiveDayNum] = useState(getInitialEffectiveDay(initialValues))
  const [effectiveWeekday, setEffectiveWeekday] = useState<Weekday>(
    getInitialEffectiveWeekday(initialValues)
  )
  const [effectiveNth, setEffectiveNth] = useState<1 | 2 | 3 | 4 | 5>(
    getInitialNth(initialValues)
  )
  const [irpfMode, setIrpfMode] = useState<IRPFMode>(initialValues?.irpfMode ?? 'auto')
  const [manualIRPFRate, setManualIRPFRate] = useState(
    initialValues?.manualIRPFRate !== null && initialValues?.manualIRPFRate !== undefined
      ? String(initialValues.manualIRPFRate)
      : ''
  )
  const [variance, setVariance] = useState(
    initialValues?.monteCarloVariance !== undefined
      ? String(initialValues.monteCarloVariance)
      : '0'
  )
  const [displayMode, setDisplayMode] = useState<PayrollDisplayMode>(
    initialValues?.displayMode ?? 'simplified'
  )
  const [label, setLabel] = useState(initialValues?.label ?? '')
  const [errors, setErrors] = useState<FormErrors>({})

  const selectClass =
    'w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary'

  function validate(): boolean {
    const next: FormErrors = {}
    if (!concept.trim()) next.concept = 'El concepto es obligatorio'
    const parsed = parseFloat(grossAmount)
    if (isNaN(parsed) || parsed <= 0) next.grossAmount = 'El salario bruto debe ser mayor que 0'
    if (!accountId) next.accountId = 'La cuenta es obligatoria'
    if (effectiveMode === 'day-of-month' && (effectiveDayNum < 1 || effectiveDayNum > 31)) {
      next.effectiveDayValue = 'El día debe estar entre 1 y 31'
    }
    if (irpfMode === 'manual') {
      const rate = parseFloat(manualIRPFRate)
      if (isNaN(rate) || rate < 0 || rate > 100) {
        next.manualIRPFRate = 'El tipo debe estar entre 0 y 100'
      }
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
    const payroll: Payroll = {
      id: initialValues?.id ?? crypto.randomUUID(),
      concept: concept.trim(),
      grossAmount: parseFloat(grossAmount),
      accountId,
      frequency: { value: parseInt(freqValue, 10) || 1, unit: freqUnit },
      startDate,
      endDate: noEndDate ? null : endDate || null,
      effectiveDay: buildEffectiveDay(),
      label: label.trim(),
      irpfMode,
      manualIRPFRate: irpfMode === 'manual' ? parseFloat(manualIRPFRate) : null,
      displayMode,
      monteCarloVariance: parseInt(variance, 10) || 0,
    }
    onSubmit(payroll)
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <Input
          label="Concepto"
          id="pf-concept"
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          error={errors.concept}
          placeholder="Ej. Nómina principal"
        />
      </div>

      <div>
        <Input
          label="Salario bruto por período"
          id="pf-gross"
          type="number"
          min={0.01}
          step={0.01}
          value={grossAmount}
          onChange={(e) => setGrossAmount(e.target.value)}
          error={errors.grossAmount}
          placeholder="0.00"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="pf-account" className="text-sm font-medium text-text-primary">
          Cuenta
        </label>
        <select
          id="pf-account"
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

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-text-primary">Frecuencia</span>
        <div className="flex gap-2">
          <input
            id="pf-freq-value"
            type="number"
            min={1}
            value={freqValue}
            onChange={(e) => setFreqValue(e.target.value)}
            className="w-24 px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            id="pf-freq-unit"
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
          id="pf-start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="pf-end-date" className="text-sm font-medium text-text-primary">
          Fecha fin
        </label>
        <div className="flex items-center gap-3">
          <input
            id="pf-end-date"
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
            id="pf-effective-mode"
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
                id="pf-effective-day"
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
              id="pf-effective-weekday"
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
                id="pf-effective-nth"
                className={`w-24 ${selectClass}`}
                value={effectiveNth}
                onChange={(e) =>
                  setEffectiveNth(parseInt(e.target.value, 10) as 1 | 2 | 3 | 4 | 5)
                }
              >
                {NTH_OPTIONS.map((n) => (
                  <option key={n.value} value={n.value}>
                    {n.label}
                  </option>
                ))}
              </select>
              <select
                id="pf-effective-nth-weekday"
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
              id="pf-effective-last-weekday"
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

      <div className="md:col-span-2 flex flex-col gap-2">
        <span className="text-sm font-medium text-text-primary">Modo IRPF</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
            <input
              type="radio"
              name="pf-irpf-mode"
              value="auto"
              checked={irpfMode === 'auto'}
              onChange={() => setIrpfMode('auto')}
              className="accent-primary"
            />
            Automático
          </label>
          <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
            <input
              type="radio"
              name="pf-irpf-mode"
              value="manual"
              checked={irpfMode === 'manual'}
              onChange={() => setIrpfMode('manual')}
              className="accent-primary"
            />
            Manual
          </label>
        </div>
        {irpfMode === 'manual' && (
          <div className="max-w-xs">
            <Input
              label="Tipo efectivo IRPF (%)"
              id="pf-manual-irpf"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={manualIRPFRate}
              onChange={(e) => setManualIRPFRate(e.target.value)}
              error={errors.manualIRPFRate}
              placeholder="0.0"
            />
          </div>
        )}
      </div>

      <div>
        <Input
          label="Varianza Monte Carlo (%)"
          id="pf-variance"
          type="number"
          min={0}
          max={100}
          step={1}
          value={variance}
          onChange={(e) => setVariance(e.target.value)}
        />
      </div>

      <div className="md:col-span-2 flex flex-col gap-2">
        <span className="text-sm font-medium text-text-primary">Modo representación</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDisplayMode('simplified')}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              displayMode === 'simplified'
                ? 'bg-primary text-white border-primary'
                : 'bg-surface-elevated text-text-primary border-border hover:border-primary'
            }`}
          >
            Simplificado
          </button>
          <button
            type="button"
            onClick={() => setDisplayMode('detailed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              displayMode === 'detailed'
                ? 'bg-primary text-white border-primary'
                : 'bg-surface-elevated text-text-primary border-border hover:border-primary'
            }`}
          >
            Detallado
          </button>
        </div>
        <p className="text-xs text-text-secondary">
          {displayMode === 'simplified'
            ? 'Se muestra el neto en las predicciones.'
            : 'Se muestran el bruto y el IRPF como movimientos separados.'}
        </p>
      </div>

      <div>
        <Input
          label="Etiqueta"
          id="pf-label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ej. Empresa principal"
        />
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
