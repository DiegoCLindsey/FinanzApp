import { useState } from 'react'
import type { Account } from '@/domain/entities/Account'
import Button from '@/presentation/components/ui/Button'
import Input from '@/presentation/components/ui/Input'

interface AccountFormProps {
  initialValues?: Partial<Account>
  onSubmit: (account: Account) => void
  onCancel: () => void
}

interface FormErrors {
  name?: string
  currency?: string
}

export default function AccountForm({ initialValues, onSubmit, onCancel }: AccountFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [currency, setCurrency] = useState(initialValues?.currency ?? 'EUR')
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): boolean {
    const next: FormErrors = {}
    if (!name.trim()) next.name = 'El nombre es obligatorio'
    if (!currency.trim()) next.currency = 'La divisa es obligatoria'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const account: Account = {
      id: initialValues?.id ?? crypto.randomUUID(),
      name: name.trim(),
      currency: currency.trim(),
      createdAt: initialValues?.createdAt ?? new Date().toISOString(),
    }
    onSubmit(account)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nombre"
        id="account-name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="Ej. Cuenta corriente"
      />
      <Input
        label="Divisa"
        id="account-currency"
        type="text"
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        error={errors.currency}
        placeholder="EUR"
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
