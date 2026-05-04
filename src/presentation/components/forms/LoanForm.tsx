import { useState, useEffect } from 'react'
import type { Loan } from '@/domain/entities/Loan'
import type { Account } from '@/domain/entities/Account'
import { calculateTAE } from '@/application/loans/LoanCalculator'
import Button from '@/presentation/components/ui/Button'
import Input from '@/presentation/components/ui/Input'

interface LoanFormProps {
  initialValues?: Partial<Loan>
  accounts: Account[]
  onSubmit: (loan: Loan) => void
  onCancel: () => void
}

interface FormErrors {
  concept?: string
  amount?: string
  tin?: string
  termMonths?: string
  accountId?: string
  startDate?: string
}

export default function LoanForm({ initialValues, accounts, onSubmit, onCancel }: LoanFormProps) {
  const [concept, setConcept] = useState(initialValues?.concept ?? '')
  const [amount, setAmount] = useState(String(initialValues?.amount ?? ''))
  const [openingCommission, setOpeningCommission] = useState(String(initialValues?.openingCommission ?? '0'))
  const [tin, setTin] = useState(String(initialValues?.tin ?? ''))
  const [taeManual, setTaeManual] = useState<string>(
    initialValues?.tae !== null && initialValues?.tae !== undefined ? String(initialValues.tae) : '',
  )
  const [taeAuto, setTaeAuto] = useState<number | null>(null)
  const [termMonths, setTermMonths] = useState(String(initialValues?.termMonths ?? ''))
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? new Date().toISOString().slice(0, 10))
  const [accountId, setAccountId] = useState(initialValues?.accountId ?? accounts[0]?.id ?? '')
  const [label, setLabel] = useState(initialValues?.label ?? '')
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    const t = parseFloat(tin)
    if (!isNaN(t) && t > 0) {
      setTaeAuto(parseFloat(calculateTAE(t).toFixed(4)))
    } else {
      setTaeAuto(null)
    }
  }, [tin])

  function validate(): boolean {
    const e: FormErrors = {}
    if (!concept.trim()) e.concept = 'Requerido'
    const a = parseFloat(amount)
    if (isNaN(a) || a <= 0) e.amount = 'Debe ser mayor que 0'
    const t = parseFloat(tin)
    if (isNaN(t) || t < 0) e.tin = 'TIN inválido'
    const months = parseInt(termMonths)
    if (isNaN(months) || months < 1) e.termMonths = 'Mínimo 1 mes'
    if (!accountId) e.accountId = 'Selecciona una cuenta'
    if (!startDate) e.startDate = 'Requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const taeValue = taeManual !== '' ? parseFloat(taeManual) : null

    const loan: Loan = {
      id: initialValues?.id ?? crypto.randomUUID(),
      concept: concept.trim(),
      amount: parseFloat(amount),
      openingCommission: parseFloat(openingCommission) || 0,
      tin: parseFloat(tin),
      tae: taeValue,
      termMonths: parseInt(termMonths),
      startDate,
      accountId,
      label: label.trim(),
    }
    onSubmit(loan)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <Input
          id="loan-concept"
          label="Concepto"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="Ej: Hipoteca"
          error={errors.concept}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="loan-amount"
          label="Cuantía (€)"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
        />
        <Input
          id="loan-commission"
          label="Comisión apertura (€)"
          type="number"
          min="0"
          step="0.01"
          value={openingCommission}
          onChange={(e) => setOpeningCommission(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Input
            id="loan-tin"
            label="TIN (%)"
            type="number"
            min="0"
            step="0.001"
            value={tin}
            onChange={(e) => setTin(e.target.value)}
            error={errors.tin}
          />
          {taeAuto !== null && (
            <p className="text-[var(--color-muted)] text-xs mt-1">TAE auto: {taeAuto.toFixed(2)}%</p>
          )}
        </div>
        <Input
          id="loan-tae"
          label="TAE (%) — opcional"
          type="number"
          min="0"
          step="0.001"
          value={taeManual}
          onChange={(e) => setTaeManual(e.target.value)}
          placeholder={taeAuto !== null ? String(taeAuto) : 'Autocalculado'}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="loan-term"
          label="Plazo (meses)"
          type="number"
          min="1"
          step="1"
          value={termMonths}
          onChange={(e) => setTermMonths(e.target.value)}
          error={errors.termMonths}
        />
        <Input
          id="loan-start"
          label="Fecha inicio"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          error={errors.startDate}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Cuenta</label>
        <select
          className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        {errors.accountId && <p className="text-red-400 text-xs mt-1">{errors.accountId}</p>}
      </div>

      <Input
        id="loan-label"
        label="Etiqueta — opcional"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Ej: hipoteca, coche..."
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="primary">Guardar</Button>
      </div>
    </form>
  )
}
