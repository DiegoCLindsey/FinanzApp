import { useRef, useState } from 'react'
import { useTheme } from '@/presentation/theme/ThemeContext'
import type { ThemeName } from '@/presentation/theme/themes'
import { useAccountStore } from '@/store/accountStore'
import { useMovementStore } from '@/store/movementStore'
import { exportToJson } from '@/application/data/ExportService'
import { readJsonFile } from '@/application/data/ImportService'
import type { AppData } from '@/infrastructure/serialization/AppDataSerializer'
import Button from '@/presentation/components/ui/Button'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [importError, setImportError] = useState('')

  const accountStore = useAccountStore()
  const movementStore = useMovementStore()

  function handleExport() {
    exportToJson({
      accounts: accountStore.accounts,
      accountHistory: accountStore.history,
      fixedMovements: movementStore.fixedMovements,
      extraordinaryMovements: movementStore.extraordinaryMovements,
    })
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportStatus('idle')
    setImportError('')
    try {
      const data: AppData = await readJsonFile(file)
      data.accounts.forEach((a) => accountStore.saveAccount(a))
      data.accountHistory.forEach((h) => accountStore.saveHistoryEntry(h))
      data.fixedMovements.forEach((m) => movementStore.saveFixedMovement(m))
      data.extraordinaryMovements.forEach((m) => movementStore.saveExtraordinaryMovement(m))
      setImportStatus('success')
    } catch (err) {
      setImportStatus('error')
      setImportError(err instanceof Error ? err.message : 'Error desconocido')
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="p-6 max-w-lg space-y-8">
      <h1 className="text-2xl font-bold text-text-primary">Ajustes</h1>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-3">
          Tema
        </h2>
        <div className="flex gap-3">
          {(['dark', 'light'] as ThemeName[]).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors
                ${theme === t
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface text-text-primary border-border hover:border-primary'
                }`}
            >
              {t === 'dark' ? 'Oscuro' : 'Claro'}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-3">
          Datos
        </h2>
        <div className="flex flex-col gap-3">
          <div className="p-4 bg-surface rounded-xl border border-border space-y-2">
            <p className="text-sm text-text-primary font-medium">Exportar copia de seguridad</p>
            <p className="text-xs text-text-secondary">
              Descarga todos tus datos en formato JSON.
            </p>
            <Button onClick={handleExport} variant="secondary" size="sm">
              Exportar JSON
            </Button>
          </div>

          <div className="p-4 bg-surface rounded-xl border border-border space-y-2">
            <p className="text-sm text-text-primary font-medium">Importar copia de seguridad</p>
            <p className="text-xs text-text-secondary">
              Carga un fichero JSON exportado previamente. Los datos existentes no se eliminan.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
              aria-label="Importar fichero JSON"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="secondary"
              size="sm"
            >
              Seleccionar fichero
            </Button>
            {importStatus === 'success' && (
              <p className="text-xs text-positive">Importación completada.</p>
            )}
            {importStatus === 'error' && (
              <p className="text-xs text-negative">{importError}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
