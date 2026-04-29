import { useTheme } from '@/presentation/theme/ThemeContext'
import type { ThemeName } from '@/presentation/theme/themes'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-2xl font-bold text-text-primary">Ajustes</h1>

      <section className="mt-6">
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
    </div>
  )
}
