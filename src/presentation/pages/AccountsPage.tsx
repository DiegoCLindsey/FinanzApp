import { useEffect, useState } from 'react'
import { useAccountStore } from '@/store/accountStore'
import type { Account } from '@/domain/entities/Account'
import type { AccountHistoryEntry } from '@/domain/entities/AccountHistoryEntry'
import Button from '@/presentation/components/ui/Button'
import Modal from '@/presentation/components/ui/Modal'
import ConfirmDialog from '@/presentation/components/ui/ConfirmDialog'
import AccountForm from '@/presentation/components/forms/AccountForm'
import AccountHistoryForm from '@/presentation/components/forms/AccountHistoryForm'

interface AccountModalState {
  open: boolean
  account?: Account
}

interface HistoryModalState {
  open: boolean
  accountId?: string
}

interface DeleteAccountState {
  open: boolean
  accountId?: string
}

interface DeleteHistoryState {
  open: boolean
  entryId?: string
}

export default function AccountsPage() {
  const {
    accounts,
    history,
    loadAll,
    saveAccount,
    deleteAccount,
    saveHistoryEntry,
    deleteHistoryEntry,
    getLatestBalance,
  } = useAccountStore()

  const [accountModal, setAccountModal] = useState<AccountModalState>({ open: false })
  const [historyModal, setHistoryModal] = useState<HistoryModalState>({ open: false })
  const [deleteAccountDialog, setDeleteAccountDialog] = useState<DeleteAccountState>({ open: false })
  const [deleteHistoryDialog, setDeleteHistoryDialog] = useState<DeleteHistoryState>({ open: false })

  useEffect(() => {
    loadAll()
  }, [loadAll])

  function handleSaveAccount(account: Account) {
    saveAccount(account)
    setAccountModal({ open: false })
  }

  function handleSaveHistoryEntry(entry: AccountHistoryEntry) {
    saveHistoryEntry(entry)
    setHistoryModal({ open: false })
  }

  function handleConfirmDeleteAccount() {
    if (deleteAccountDialog.accountId) {
      deleteAccount(deleteAccountDialog.accountId)
    }
    setDeleteAccountDialog({ open: false })
  }

  function handleConfirmDeleteHistory() {
    if (deleteHistoryDialog.entryId) {
      deleteHistoryEntry(deleteHistoryDialog.entryId)
    }
    setDeleteHistoryDialog({ open: false })
  }

  function formatBalance(balance: number, currency: string): string {
    return balance.toLocaleString('es-ES', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const accountById = Object.fromEntries(accounts.map((a) => [a.id, a]))

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Cuentas</h1>
        <Button
          variant="primary"
          onClick={() => setAccountModal({ open: true, account: undefined })}
        >
          Nueva cuenta
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-text-secondary text-sm">
          No hay cuentas. Crea una para empezar.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {accounts.map((account) => {
            const balance = getLatestBalance(account.id)
            const balanceColor =
              balance > 0
                ? 'text-positive'
                : balance < 0
                ? 'text-negative'
                : 'text-text-secondary'

            return (
              <div
                key={account.id}
                className="bg-surface-elevated border border-border rounded-xl p-5 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">{account.name}</h2>
                    <span className="text-xs text-text-secondary">{account.currency}</span>
                  </div>
                  <span className={`text-lg font-bold ${balanceColor}`}>
                    {formatBalance(balance, account.currency)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setHistoryModal({ open: true, accountId: account.id })
                    }
                  >
                    Añadir entrada histórica
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setAccountModal({ open: true, account })}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      setDeleteAccountDialog({ open: true, accountId: account.id })
                    }
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {history.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-4">Histórico de Saldos</h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-elevated text-text-secondary text-left">
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Cuenta</th>
                  <th className="px-4 py-3 font-medium">Saldo</th>
                  <th className="px-4 py-3 font-medium">Nota</th>
                  <th className="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedHistory.map((entry, index) => {
                  const account = accountById[entry.accountId]
                  const balanceColor =
                    entry.balance > 0
                      ? 'text-positive'
                      : entry.balance < 0
                      ? 'text-negative'
                      : 'text-text-secondary'

                  return (
                    <tr
                      key={entry.id}
                      className={`border-t border-border ${
                        index % 2 === 0 ? 'bg-surface' : 'bg-surface-elevated'
                      }`}
                    >
                      <td className="px-4 py-3 text-text-primary">{formatDate(entry.date)}</td>
                      <td className="px-4 py-3 text-text-primary">
                        {account?.name ?? entry.accountId}
                      </td>
                      <td className={`px-4 py-3 font-medium ${balanceColor}`}>
                        {account
                          ? formatBalance(entry.balance, account.currency)
                          : entry.balance.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{entry.note || '—'}</td>
                      <td className="px-4 py-3">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            setDeleteHistoryDialog({ open: true, entryId: entry.id })
                          }
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={accountModal.open}
        onClose={() => setAccountModal({ open: false })}
        title={accountModal.account ? 'Editar cuenta' : 'Nueva cuenta'}
      >
        <AccountForm
          initialValues={accountModal.account}
          onSubmit={handleSaveAccount}
          onCancel={() => setAccountModal({ open: false })}
        />
      </Modal>

      <Modal
        isOpen={historyModal.open}
        onClose={() => setHistoryModal({ open: false })}
        title="Añadir entrada histórica"
      >
        {historyModal.accountId && (
          <AccountHistoryForm
            accountId={historyModal.accountId}
            onSubmit={handleSaveHistoryEntry}
            onCancel={() => setHistoryModal({ open: false })}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deleteAccountDialog.open}
        onClose={() => setDeleteAccountDialog({ open: false })}
        onConfirm={handleConfirmDeleteAccount}
        title="Eliminar cuenta"
        message="¿Seguro que quieres eliminar esta cuenta? Esta acción no se puede deshacer."
      />

      <ConfirmDialog
        isOpen={deleteHistoryDialog.open}
        onClose={() => setDeleteHistoryDialog({ open: false })}
        onConfirm={handleConfirmDeleteHistory}
        title="Eliminar entrada histórica"
        message="¿Seguro que quieres eliminar esta entrada? Esta acción no se puede deshacer."
      />
    </div>
  )
}
