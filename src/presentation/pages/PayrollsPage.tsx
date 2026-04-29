import { useEffect, useState } from 'react'
import { usePayrollStore } from '@/store/payrollStore'
import { useAccountStore } from '@/store/accountStore'
import type { Payroll } from '@/domain/entities/Payroll'
import type { IRPFConfig } from '@/domain/entities/IRPFConfig'
import Button from '@/presentation/components/ui/Button'
import Modal from '@/presentation/components/ui/Modal'
import Badge from '@/presentation/components/ui/Badge'
import ConfirmDialog from '@/presentation/components/ui/ConfirmDialog'
import PayrollForm from '@/presentation/components/forms/PayrollForm'
import IRPFConfigForm from '@/presentation/components/forms/IRPFConfigForm'

interface PayrollModalState {
  open: boolean
  payroll?: Payroll
}

interface IRPFModalState {
  open: boolean
  config?: IRPFConfig
}

interface DeleteState {
  open: boolean
  id?: string
}

function formatFrequency(payroll: Payroll): string {
  const unitLabels: Record<string, string> = {
    day: 'día(s)',
    week: 'semana(s)',
    month: 'mes(es)',
    year: 'año(s)',
  }
  return `cada ${payroll.frequency.value} ${unitLabels[payroll.frequency.unit] ?? payroll.frequency.unit}`
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export default function PayrollsPage() {
  const { payrolls, irpfConfigs, loadAll, savePayroll, deletePayroll, saveIRPFConfig, deleteIRPFConfig } =
    usePayrollStore()
  const { accounts, loadAll: loadAccounts } = useAccountStore()

  const [payrollModal, setPayrollModal] = useState<PayrollModalState>({ open: false })
  const [irpfModal, setIrpfModal] = useState<IRPFModalState>({ open: false })
  const [deletePayrollDialog, setDeletePayrollDialog] = useState<DeleteState>({ open: false })
  const [deleteIRPFDialog, setDeleteIRPFDialog] = useState<DeleteState>({ open: false })

  useEffect(() => {
    loadAll()
    loadAccounts()
  }, [loadAll, loadAccounts])

  function handleSavePayroll(payroll: Payroll) {
    savePayroll(payroll)
    setPayrollModal({ open: false })
  }

  function handleSaveIRPFConfig(config: IRPFConfig) {
    saveIRPFConfig(config)
    setIrpfModal({ open: false })
  }

  function handleConfirmDeletePayroll() {
    if (deletePayrollDialog.id) {
      deletePayroll(deletePayrollDialog.id)
    }
    setDeletePayrollDialog({ open: false })
  }

  function handleConfirmDeleteIRPF() {
    if (deleteIRPFDialog.id) {
      deleteIRPFConfig(deleteIRPFDialog.id)
    }
    setDeleteIRPFDialog({ open: false })
  }

  function getAccountCurrency(accountId: string): string {
    return accounts.find((a) => a.id === accountId)?.currency ?? 'EUR'
  }

  function getAccountName(accountId: string): string {
    return accounts.find((a) => a.id === accountId)?.name ?? '—'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Nóminas</h1>
          <Button
            variant="primary"
            onClick={() => setPayrollModal({ open: true, payroll: undefined })}
            disabled={accounts.length === 0}
          >
            Nueva nómina
          </Button>
        </div>

        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <p className="text-text-secondary text-sm">Primero debes crear una cuenta.</p>
          </div>
        ) : payrolls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <p className="text-text-secondary text-sm">No hay nóminas configuradas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-elevated">
                <tr className="text-text-secondary text-xs">
                  <th className="text-left px-4 py-3 font-medium">Concepto</th>
                  <th className="text-left px-4 py-3 font-medium">Bruto</th>
                  <th className="text-left px-4 py-3 font-medium">IRPF</th>
                  <th className="text-left px-4 py-3 font-medium">Representación</th>
                  <th className="text-left px-4 py-3 font-medium">Frecuencia</th>
                  <th className="text-left px-4 py-3 font-medium">Cuenta</th>
                  <th className="text-left px-4 py-3 font-medium">Etiqueta</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payrolls.map((p) => (
                  <tr key={p.id} className="bg-surface hover:bg-surface-elevated transition-colors">
                    <td className="px-4 py-3 text-text-primary font-medium">{p.concept}</td>
                    <td className="px-4 py-3 text-text-primary">
                      {formatAmount(p.grossAmount, getAccountCurrency(p.accountId))}
                    </td>
                    <td className="px-4 py-3">
                      {p.irpfMode === 'auto' ? (
                        <Badge variant="default">Auto</Badge>
                      ) : (
                        <Badge variant="default">
                          Manual {p.manualIRPFRate !== null ? p.manualIRPFRate.toFixed(1) : '0.0'}%
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.displayMode === 'simplified' ? (
                        <Badge variant="default">Simplificado</Badge>
                      ) : (
                        <Badge variant="transfer">Detallado</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{formatFrequency(p)}</td>
                    <td className="px-4 py-3 text-text-secondary">{getAccountName(p.accountId)}</td>
                    <td className="px-4 py-3 text-text-secondary">{p.label || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setPayrollModal({ open: true, payroll: p })}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeletePayrollDialog({ open: true, id: p.id })}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">Configuración IRPF</h2>
          <Button
            variant="primary"
            onClick={() => setIrpfModal({ open: true, config: undefined })}
          >
            Nueva configuración
          </Button>
        </div>

        {irpfConfigs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <p className="text-text-secondary text-sm">No hay configuraciones IRPF personalizadas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-elevated">
                <tr className="text-text-secondary text-xs">
                  <th className="text-left px-4 py-3 font-medium">Válido desde</th>
                  <th className="text-left px-4 py-3 font-medium">Nº tramos</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {irpfConfigs.map((c) => (
                  <tr key={c.id} className="bg-surface hover:bg-surface-elevated transition-colors">
                    <td className="px-4 py-3 text-text-primary font-medium">{c.validFrom}</td>
                    <td className="px-4 py-3 text-text-secondary">{c.brackets.length}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setIrpfModal({ open: true, config: c })}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteIRPFDialog({ open: true, id: c.id })}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-text-secondary">
          Si no hay configuración activa, se usan los tramos oficiales de España 2024.
        </p>
      </section>

      <Modal
        isOpen={payrollModal.open}
        onClose={() => setPayrollModal({ open: false })}
        title={payrollModal.payroll ? 'Editar nómina' : 'Nueva nómina'}
      >
        <PayrollForm
          initialValues={payrollModal.payroll}
          accounts={accounts}
          onSubmit={handleSavePayroll}
          onCancel={() => setPayrollModal({ open: false })}
        />
      </Modal>

      <Modal
        isOpen={irpfModal.open}
        onClose={() => setIrpfModal({ open: false })}
        title={irpfModal.config ? 'Editar configuración IRPF' : 'Nueva configuración IRPF'}
      >
        <IRPFConfigForm
          initialValues={irpfModal.config}
          onSubmit={handleSaveIRPFConfig}
          onCancel={() => setIrpfModal({ open: false })}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deletePayrollDialog.open}
        onClose={() => setDeletePayrollDialog({ open: false })}
        onConfirm={handleConfirmDeletePayroll}
        title="Eliminar nómina"
        message="¿Seguro que quieres eliminar esta nómina? Esta acción no se puede deshacer."
      />

      <ConfirmDialog
        isOpen={deleteIRPFDialog.open}
        onClose={() => setDeleteIRPFDialog({ open: false })}
        onConfirm={handleConfirmDeleteIRPF}
        title="Eliminar configuración IRPF"
        message="¿Seguro que quieres eliminar esta configuración IRPF? Esta acción no se puede deshacer."
      />
    </div>
  )
}
