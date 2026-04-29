import { NavLink } from 'react-router-dom'
import { useState } from 'react'

const NAV_ITEMS = [
  { to: '/accounts', label: 'Cuentas', icon: '🏦' },
  { to: '/fixed-movements', label: 'Mov. Fijos', icon: '🔄' },
  { to: '/extraordinary-movements', label: 'Mov. Extraordinarios', icon: '⚡' },
  { to: '/predictions', label: 'Predicciones', icon: '📈' },
  { to: '/settings', label: 'Ajustes', icon: '⚙️' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`flex flex-col bg-surface border-r border-border transition-all duration-200
        ${collapsed ? 'w-14' : 'w-56'} min-h-screen`}
    >
      <div className="flex items-center justify-between p-3 border-b border-border">
        {!collapsed && (
          <span className="text-primary font-bold text-lg tracking-tight">FinanzApp</span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-1 rounded hover:bg-surface-elevated text-text-secondary"
          aria-label="Toggle sidebar"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="flex-1 py-3 space-y-1 px-2">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors
              ${isActive
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
              }`
            }
          >
            <span className="text-base w-5 text-center">{icon}</span>
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
