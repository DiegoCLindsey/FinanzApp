import { useState } from 'react'
import type { AccountHistoryEntry } from '@/domain/entities/AccountHistoryEntry'
import Button from '@/presentation/components/ui/Button'
import Input from '@/presentation/components/ui/Input'

interface AccountHistoryFormProps {
  accountId: string
  onSubmit: (entry: AccountHistoryEntry) => void
  onCancel: () => void
}

interface FormErrors {
  date?: string
  balance?: string
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function AccountHistoryForm({
  accountId,
  onSubmit,
  onCancel,
}: AccountHistoryFormProps) {
  const [date, setDate] = useState(todayISO())
  const [balance, setBalance] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): boolean {
    const next: FormErrors = {}
    if (!date) next.date = 'La fecha es obligatoria'
    if (balance === '' || isNaN(Number(balance))) next.balance = 'El saldo es obligatorio'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const entry: AccountHistoryEntry = {
      id: crypto.randomUUID(),
      accountId,
      date,
      balance: Number(balance),
      note: note.trim(),
    }
    onSubmit(entry)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Fecha"
        id="history-date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
      />
      <Input
        label="Saldo"
        id="history-balance"
        type="number"
        step="0.01"
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
        error={errors.balance}
        placeholder="0.00"
      />
      <Input
        label="Nota (opcional)"
        id="history-note"
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ej. Revisión mensual"
      />
      <div className="flex gap-3 justify-end pt-2">
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
