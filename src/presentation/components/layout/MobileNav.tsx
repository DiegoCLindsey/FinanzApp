import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/accounts', icon: '🏦', label: 'Cuentas' },
  { to: '/fixed-movements', icon: '🔄', label: 'Fijos' },
  { to: '/extraordinary-movements', icon: '⚡', label: 'Extra.' },
  { to: '/payrolls', icon: '💼', label: 'Nóminas' },
  { to: '/predictions', icon: '📈', label: 'Predicc.' },
  { to: '/settings', icon: '⚙️', label: 'Ajustes' },
]

export default function MobileNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border
        flex justify-around py-2 z-50"
    >
      {NAV_ITEMS.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded text-xs transition-colors
            ${isActive ? 'text-primary' : 'text-text-secondary'}`
          }
        >
          <span className="text-lg">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
