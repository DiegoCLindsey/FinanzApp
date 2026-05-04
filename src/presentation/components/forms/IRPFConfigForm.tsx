import { useState } from 'react'
import type { IRPFConfig, IRPFBracket } from '@/domain/entities/IRPFConfig'
import { DEFAULT_IRPF_BRACKETS_ES_2024 } from '@/application/payroll/IRPFCalculator'
import Button from '@/presentation/components/ui/Button'
import Input from '@/presentation/components/ui/Input'

interface IRPFConfigFormProps {
  initialValues?: Partial<IRPFConfig>
  onSubmit: (c: IRPFConfig) => void
  onCancel: () => void
}

interface BracketRow {
  from: string
  to: string
  rate: string
}

function bracketsToRows(brackets: IRPFBracket[]): BracketRow[] {
  return brackets.map((b) => ({
    from: String(b.from),
    to: b.to !== null ? String(b.to) : '',
    rate: String(b.rate),
  }))
}

export default function IRPFConfigForm({
  initialValues,
  onSubmit,
  onCancel,
}: IRPFConfigFormProps) {
  const [validFrom, setValidFrom] = useState(initialValues?.validFrom ?? '')
  const [rows, setRows] = useState<BracketRow[]>(() => {
    if (initialValues?.brackets && initialValues.brackets.length > 0) {
      return bracketsToRows(initialValues.brackets)
    }
    return bracketsToRows(DEFAULT_IRPF_BRACKETS_ES_2024)
  })
  const [validFromError, setValidFromError] = useState<string | undefined>()
  const [bracketsError, setBracketsError] = useState<string | undefined>()

  const inputClass =
    'w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary'

  function updateRow(index: number, field: keyof BracketRow, value: string) {
    setRows((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  function addRow() {
    setRows((prev) => [...prev, { from: '', to: '', rate: '' }])
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  function validate(): boolean {
    let valid = true
    if (!validFrom) {
      setValidFromError('La fecha es obligatoria')
      valid = false
    } else {
      setValidFromError(undefined)
    }
    if (rows.length === 0) {
      setBracketsError('Debe haber al menos un tramo')
      valid = false
    } else {
      setBracketsError(undefined)
    }
    return valid
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const brackets: IRPFBracket[] = rows.map((r) => ({
      from: parseFloat(r.from) || 0,
      to: r.to.trim() === '' ? null : parseFloat(r.to),
      rate: parseFloat(r.rate) || 0,
    }))
    const config: IRPFConfig = {
      id: initialValues?.id ?? crypto.randomUUID(),
      validFrom,
      brackets,
    }
    onSubmit(config)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Válido desde"
        id="irpf-valid-from"
        type="date"
        value={validFrom}
        onChange={(e) => setValidFrom(e.target.value)}
        error={validFromError}
      />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text-primary">Tramos IRPF</span>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-secondary text-xs">
                <th className="text-left pb-2 pr-2 font-medium">Desde (€)</th>
                <th className="text-left pb-2 pr-2 font-medium">Hasta (€) o ∞</th>
                <th className="text-left pb-2 pr-2 font-medium">Tipo (%)</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row, i) => (
                <tr key={i} className="align-middle">
                  <td className="py-1.5 pr-2">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={row.from}
                      onChange={(e) => updateRow(i, 'from', e.target.value)}
                      className={inputClass}
                      placeholder="0"
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={row.to}
                      onChange={(e) => updateRow(i, 'to', e.target.value)}
                      className={inputClass}
                      placeholder="∞"
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      value={row.rate}
                      onChange={(e) => updateRow(i, 'rate', e.target.value)}
                      className={inputClass}
                      placeholder="0"
                    />
                  </td>
                  <td className="py-1.5">
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="text-negative hover:opacity-70 transition-opacity text-base leading-none px-1"
                      aria-label="Eliminar tramo"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {bracketsError && (
          <span className="text-xs text-negative">{bracketsError}</span>
        )}
        <div>
          <Button type="button" variant="secondary" size="sm" onClick={addRow}>
            + Añadir tramo
          </Button>
        </div>
      </div>

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
