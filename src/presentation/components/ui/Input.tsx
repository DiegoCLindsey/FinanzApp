import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
  error?: string
  className?: string
}

export default function Input({ label, id, error, className = '', ...rest }: InputProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-text-primary">
        {label}
      </label>
      <input
        id={id}
        {...rest}
        className={`w-full px-3 py-2 rounded-lg border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
          error ? 'border-negative' : 'border-border'
        }`}
      />
      {error && <span className="text-xs text-negative">{error}</span>}
    </div>
  )
}
