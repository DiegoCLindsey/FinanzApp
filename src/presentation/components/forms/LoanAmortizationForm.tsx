import { useState } from 'react'
import type { LoanAmortization, AmortizationType } from '@/domain/entities/LoanAmortization'
import Button from '@/presentation/components/ui/Button'
import Input from '@/presentation/components/ui/Input'

interface LoanAmortizationFormProps {
  loanId: string
  initialValues?: Partial<LoanAmortization>
  onSubmit: (amortization: LoanAmortization) => void
  onCancel: () => void
}

interface FormErrors {
  amount?: string
  date?: string
}

export default function LoanAmortizationForm({
  loanId,
  initialValues,
  onSubmit,
  onCancel,
}: LoanAmortizationFormProps) {
  const [amount, setAmount] = useState(String(initialValues?.amount ?? ''))
  const [date, setDate] = useState(initialValues?.date ?? new Date().toISOString().slice(0, 10))
  const [type, setType] = useState<AmortizationType>(initialValues?.type ?? 'reduce-quota')
  const [note, setNote] = useState(initialValues?.note ?? '')
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): boolean {
    const e: FormErrors = {}
    const a = parseFloat(amount)
    if (isNaN(a) || a <= 0) e.amount = 'Debe ser mayor que 0'
    if (!date) e.date = 'Requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      id: initialValues?.id ?? crypto.randomUUID(),
      loanId,
      date,
      amount: parseFloat(amount),
      type,
      note: note.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="amort-amount"
          label="Importe (€)"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
        />
        <Input
          id="amort-date"
          label="Fecha"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tipo</label>
        <div className="flex gap-3">
          {([
            { value: 'reduce-quota', label: 'Reducir cuota' },
            { value: 'reduce-term', label: 'Reducir plazo' },
          ] as { value: AmortizationType; label: string }[]).map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="amort-type"
                value={value}
                checked={type === value}
                onChange={() => setType(value)}
                className="accent-[var(--color-primary)]"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <Input
        id="amort-note"
        label="Nota — opcional"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ej: herencia, bonus..."
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="primary">Guardar</Button>
      </div>
    </form>
  )
}
