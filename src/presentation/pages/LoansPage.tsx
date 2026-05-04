import { useEffect, useState } from 'react'
import { useLoanStore } from '@/store/loanStore'
import { useAccountStore } from '@/store/accountStore'
import type { Loan } from '@/domain/entities/Loan'
import type { LoanAmortization } from '@/domain/entities/LoanAmortization'
import { buildLoanSchedule, resolveTAE } from '@/application/loans/LoanCalculator'
import Button from '@/presentation/components/ui/Button'
import Modal from '@/presentation/components/ui/Modal'
import Badge from '@/presentation/components/ui/Badge'
import ConfirmDialog from '@/presentation/components/ui/ConfirmDialog'
import LoanForm from '@/presentation/components/forms/LoanForm'
import LoanAmortizationForm from '@/presentation/components/forms/LoanAmortizationForm'

interface LoanModalState { isOpen: boolean; loan?: Loan }
interface AmortModalState { isOpen: boolean; loanId?: string; amortization?: LoanAmortization }
interface DeleteState { isOpen: boolean; id?: string; type?: 'loan' | 'amortization' }
interface ScheduleState { isOpen: boolean; loan?: Loan }

function fmt(n: number): string {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function pct(n: number): string {
  return n.toFixed(4) + '%'
}

export default function LoansPage() {
  const { loans, loadAll, saveLoan, deleteLoan, saveAmortization, deleteAmortization, getAmortizationsForLoan } =
    useLoanStore()
  const { accounts, loadAll: loadAccounts } = useAccountStore()

  const [loanModal, setLoanModal] = useState<LoanModalState>({ isOpen: false })
  const [amortModal, setAmortModal] = useState<AmortModalState>({ isOpen: false })
  const [deleteState, setDeleteState] = useState<DeleteState>({ isOpen: false })
  const [scheduleState, setScheduleState] = useState<ScheduleState>({ isOpen: false })
  const [expandedLoan, setExpandedLoan] = useState<string | null>(null)

  useEffect(() => {
    loadAll()
    loadAccounts()
  }, [loadAll, loadAccounts])

  function getAccountName(id: string): string {
    return accounts.find((a) => a.id === id)?.name ?? id
  }

  function handleSaveLoan(loan: Loan) {
    saveLoan(loan)
    setLoanModal({ isOpen: false })
  }

  function handleSaveAmortization(amort: LoanAmortization) {
    saveAmortization(amort)
    setAmortModal({ isOpen: false })
  }

  function handleDelete() {
    if (!deleteState.id) return
    if (deleteState.type === 'loan') deleteLoan(deleteState.id)
    else deleteAmortization(deleteState.id)
    setDeleteState({ isOpen: false })
  }

  const scheduleLoanAmorts = scheduleState.loan
    ? getAmortizationsForLoan(scheduleState.loan.id)
    : []
  const schedule = scheduleState.loan
    ? buildLoanSchedule(scheduleState.loan, scheduleLoanAmorts)
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Préstamos</h1>
        <Button variant="primary" onClick={() => setLoanModal({ isOpen: true })}>+ Nuevo préstamo</Button>
      </div>

      {loans.length === 0 ? (
        <div className="text-center py-16 text-[var(--color-muted)]">
          <p className="text-4xl mb-3">🏦</p>
          <p>No hay préstamos registrados.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => {
            const loanAmorts = getAmortizationsForLoan(loan.id)
            const loanSchedule = buildLoanSchedule(loan, loanAmorts)
            const tae = resolveTAE(loan)
            const isExpanded = expandedLoan === loan.id

            return (
              <div key={loan.id} className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-lg">{loan.concept}</span>
                        {loan.label && <Badge>{loan.label}</Badge>}
                      </div>
                      <div className="text-[var(--color-muted)] text-sm mt-1">{getAccountName(loan.accountId)}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-lg">{fmt(loan.amount)} €</div>
                      <div className="text-sm text-[var(--color-muted)]">Cuota: {fmt(loanSchedule.quota)} €/mes</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
                    <div>
                      <div className="text-[var(--color-muted)]">TIN</div>
                      <div className="font-medium">{pct(loan.tin)}</div>
                    </div>
                    <div>
                      <div className="text-[var(--color-muted)]">TAE</div>
                      <div className="font-medium">{pct(tae)}</div>
                    </div>
                    <div>
                      <div className="text-[var(--color-muted)]">Plazo</div>
                      <div className="font-medium">{loan.termMonths} meses</div>
                    </div>
                    <div>
                      <div className="text-[var(--color-muted)]">Inicio</div>
                      <div className="font-medium">{loan.startDate}</div>
                    </div>
                  </div>

                  {loan.openingCommission > 0 && (
                    <div className="mt-2 text-sm text-[var(--color-muted)]">
                      Comisión apertura: {fmt(loan.openingCommission)} €
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button variant="ghost" size="sm" onClick={() => setExpandedLoan(isExpanded ? null : loan.id)}>
                      {isExpanded ? 'Ocultar amortizaciones' : `Amortizaciones (${loanAmorts.length})`}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setScheduleState({ isOpen: true, loan })}>
                      Ver cuadro
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setLoanModal({ isOpen: true, loan })}>
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => setDeleteState({ isOpen: true, id: loan.id, type: 'loan' })}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-[var(--color-border)] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">Amortizaciones anticipadas</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAmortModal({ isOpen: true, loanId: loan.id })}
                      >
                        + Añadir
                      </Button>
                    </div>

                    {loanAmorts.length === 0 ? (
                      <p className="text-[var(--color-muted)] text-sm">Sin amortizaciones registradas.</p>
                    ) : (
                      <div className="space-y-2">
                        {loanAmorts
                          .sort((a, b) => a.date.localeCompare(b.date))
                          .map((amort) => (
                            <div
                              key={amort.id}
                              className="flex items-center justify-between bg-[var(--color-bg)] rounded-lg p-3 text-sm"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-[var(--color-muted)]">{amort.date}</span>
                                <Badge variant={amort.type === 'reduce-quota' ? 'default' : 'success'}>
                                  {amort.type === 'reduce-quota' ? 'Reducir cuota' : 'Reducir plazo'}
                                </Badge>
                                {amort.note && <span className="text-[var(--color-muted)]">{amort.note}</span>}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-medium">{fmt(amort.amount)} €</span>
                                <button
                                  className="text-[var(--color-muted)] hover:text-red-400 transition-colors"
                                  onClick={() => setDeleteState({ isOpen: true, id: amort.id, type: 'amortization' })}
                                  aria-label="Eliminar amortización"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Loan modal */}
      <Modal
        isOpen={loanModal.isOpen}
        onClose={() => setLoanModal({ isOpen: false })}
        title={loanModal.loan ? 'Editar préstamo' : 'Nuevo préstamo'}
      >
        <LoanForm
          initialValues={loanModal.loan}
          accounts={accounts}
          onSubmit={handleSaveLoan}
          onCancel={() => setLoanModal({ isOpen: false })}
        />
      </Modal>

      {/* Amortization modal */}
      <Modal
        isOpen={amortModal.isOpen}
        onClose={() => setAmortModal({ isOpen: false })}
        title="Nueva amortización anticipada"
      >
        {amortModal.loanId && (
          <LoanAmortizationForm
            loanId={amortModal.loanId}
            initialValues={amortModal.amortization}
            onSubmit={handleSaveAmortization}
            onCancel={() => setAmortModal({ isOpen: false })}
          />
        )}
      </Modal>

      {/* Schedule modal */}
      <Modal
        isOpen={scheduleState.isOpen}
        onClose={() => setScheduleState({ isOpen: false })}
        title={`Cuadro de amortización: ${scheduleState.loan?.concept ?? ''}`}
      >
        {schedule && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-[var(--color-bg)] rounded-lg p-3 text-center">
                <div className="text-[var(--color-muted)]">Cuota mensual</div>
                <div className="font-bold text-lg">{fmt(schedule.quota)} €</div>
              </div>
              <div className="bg-[var(--color-bg)] rounded-lg p-3 text-center">
                <div className="text-[var(--color-muted)]">Total pagado</div>
                <div className="font-bold text-lg">{fmt(schedule.totalPayments)} €</div>
              </div>
              <div className="bg-[var(--color-bg)] rounded-lg p-3 text-center">
                <div className="text-[var(--color-muted)]">Total intereses</div>
                <div className="font-bold text-lg">{fmt(schedule.totalInterest)} €</div>
              </div>
            </div>

            <div className="overflow-auto max-h-96">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[var(--color-muted)] border-b border-[var(--color-border)]">
                    <th className="text-left py-2 pr-3">Nº</th>
                    <th className="text-left py-2 pr-3">Fecha</th>
                    <th className="text-right py-2 pr-3">Capital</th>
                    <th className="text-right py-2 pr-3">Interés</th>
                    <th className="text-right py-2 pr-3">Cuota</th>
                    <th className="text-right py-2">Pendiente</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.rows.map((row) => (
                    <tr key={row.month} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface)]">
                      <td className="py-1.5 pr-3">{row.month}</td>
                      <td className="py-1.5 pr-3">{row.date}</td>
                      <td className="py-1.5 pr-3 text-right">{fmt(row.principalPayment)}</td>
                      <td className="py-1.5 pr-3 text-right">{fmt(row.interestPayment)}</td>
                      <td className="py-1.5 pr-3 text-right font-medium">{fmt(row.quota)}</td>
                      <td className="py-1.5 text-right">{fmt(row.remainingPrincipal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState({ isOpen: false })}
        onConfirm={handleDelete}
        title="Confirmar eliminación"
        message={
          deleteState.type === 'loan'
            ? '¿Eliminar este préstamo y todas sus amortizaciones?'
            : '¿Eliminar esta amortización?'
        }
      />
    </div>
  )
}
