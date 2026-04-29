import { useEffect, useState } from 'react'
import { useMovementStore } from '@/store/movementStore'
import { useAccountStore } from '@/store/accountStore'
import type { ExtraordinaryMovement } from '@/domain/entities/ExtraordinaryMovement'
import Button from '@/presentation/components/ui/Button'
import Modal from '@/presentation/components/ui/Modal'
import ConfirmDialog from '@/presentation/components/ui/ConfirmDialog'
import ExtraordinaryMovementForm from '@/presentation/components/forms/ExtraordinaryMovementForm'
import ExtraordinaryMovementsTable from '@/presentation/components/ui/ExtraordinaryMovementsTable'

interface MovementModalState {
  open: boolean
  movement?: ExtraordinaryMovement
}

interface DeleteState {
  open: boolean
  id?: string
}

export default function ExtraordinaryMovementsPage() {
  const {
    extraordinaryMovements,
    loadAll,
    saveExtraordinaryMovement,
    deleteExtraordinaryMovement,
  } = useMovementStore()
  const { accounts, loadAll: loadAccounts } = useAccountStore()

  const [movementModal, setMovementModal] = useState<MovementModalState>({ open: false })
  const [deleteDialog, setDeleteDialog] = useState<DeleteState>({ open: false })

  useEffect(() => {
    loadAll()
    loadAccounts()
  }, [loadAll, loadAccounts])

  function handleSave(movement: ExtraordinaryMovement) {
    saveExtraordinaryMovement(movement)
    setMovementModal({ open: false })
  }

  function handleConfirmDelete() {
    if (deleteDialog.id) {
      deleteExtraordinaryMovement(deleteDialog.id)
    }
    setDeleteDialog({ open: false })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Movimientos Extraordinarios</h1>
        <Button
          variant="primary"
          onClick={() => setMovementModal({ open: true, movement: undefined })}
          disabled={accounts.length === 0}
        >
          Nuevo movimiento
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2">
          <p className="text-text-secondary text-sm">Primero debes crear una cuenta.</p>
          <p className="text-text-secondary text-xs">
            Ve a la sección{' '}
            <span className="text-primary font-medium">Cuentas</span>{' '}
            para añadir una cuenta antes de crear movimientos extraordinarios.
          </p>
        </div>
      ) : (
        <ExtraordinaryMovementsTable
          movements={extraordinaryMovements}
          accounts={accounts}
          onEdit={(m) => setMovementModal({ open: true, movement: m })}
          onDelete={(id) => setDeleteDialog({ open: true, id })}
        />
      )}

      <Modal
        isOpen={movementModal.open}
        onClose={() => setMovementModal({ open: false })}
        title={
          movementModal.movement
            ? 'Editar movimiento extraordinario'
            : 'Nuevo movimiento extraordinario'
        }
      >
        <ExtraordinaryMovementForm
          initialValues={movementModal.movement}
          accounts={accounts}
          onSubmit={handleSave}
          onCancel={() => setMovementModal({ open: false })}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false })}
        onConfirm={handleConfirmDelete}
        title="Eliminar movimiento extraordinario"
        message="¿Seguro que quieres eliminar este movimiento extraordinario? Esta acción no se puede deshacer."
      />
    </div>
  )
}
