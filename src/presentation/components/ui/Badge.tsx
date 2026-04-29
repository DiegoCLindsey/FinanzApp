type BadgeVariant = 'income' | 'expense' | 'transfer' | 'default'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  income: 'bg-positive/20 text-positive',
  expense: 'bg-negative/20 text-negative',
  transfer: 'bg-primary/20 text-primary',
  default: 'bg-surface-elevated text-text-secondary',
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  )
}
