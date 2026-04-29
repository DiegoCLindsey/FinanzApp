import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ExtraordinaryMovementForm from './ExtraordinaryMovementForm'
import type { Account } from '@/domain/entities/Account'
import type { ExtraordinaryMovement } from '@/domain/entities/ExtraordinaryMovement'

const accounts: Account[] = [
  { id: 'acc-1', name: 'Corriente', currency: 'EUR', createdAt: '2024-01-01' },
  { id: 'acc-2', name: 'Ahorro', currency: 'EUR', createdAt: '2024-01-01' },
]

describe('ExtraordinaryMovementForm', () => {
  it('renders core fields', () => {
    render(<ExtraordinaryMovementForm accounts={accounts} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText('Concepto')).toBeDefined()
    expect(screen.getByLabelText('Tipo')).toBeDefined()
    expect(screen.getByLabelText('Cuantía')).toBeDefined()
    expect(screen.getByLabelText('Fecha')).toBeDefined()
  })

  it('shows validation error on empty submit', () => {
    render(<ExtraordinaryMovementForm accounts={accounts} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(screen.getByText('El concepto es obligatorio')).toBeDefined()
  })

  it('calls onSubmit with valid data', () => {
    const onSubmit = vi.fn()
    render(<ExtraordinaryMovementForm accounts={accounts} onSubmit={onSubmit} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('Concepto'), { target: { value: 'Seguro coche' } })
    fireEvent.change(screen.getByLabelText('Cuantía'), { target: { value: '450' } })
    fireEvent.change(screen.getByLabelText('Cuenta'), { target: { value: 'acc-1' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).toHaveBeenCalledOnce()
    const result = onSubmit.mock.calls[0][0] as ExtraordinaryMovement
    expect(result.concept).toBe('Seguro coche')
    expect(result.amount).toBe(450)
    expect(result.id).toBeDefined()
  })

  it('shows target account when type is transfer', () => {
    render(<ExtraordinaryMovementForm accounts={accounts} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.queryByLabelText('Cuenta destino')).toBeNull()
    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'transfer' } })
    expect(screen.getByLabelText('Cuenta destino')).toBeDefined()
  })

  it('pre-fills values when editing', () => {
    const movement: ExtraordinaryMovement = {
      id: '1',
      concept: 'Vacaciones',
      type: 'expense',
      amount: 1200,
      date: '2024-08-15',
      accountId: 'acc-1',
      targetAccountId: null,
      label: 'viajes',
      isBasicExpense: false,
    }
    render(<ExtraordinaryMovementForm initialValues={movement} accounts={accounts} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect((screen.getByLabelText('Concepto') as HTMLInputElement).value).toBe('Vacaciones')
    expect((screen.getByLabelText('Cuantía') as HTMLInputElement).value).toBe('1200')
  })
})
