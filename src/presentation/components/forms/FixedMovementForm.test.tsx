import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FixedMovementForm from './FixedMovementForm'
import type { Account } from '@/domain/entities/Account'
import type { FixedMovement } from '@/domain/entities/FixedMovement'

const accounts: Account[] = [
  { id: 'acc-1', name: 'Corriente', currency: 'EUR', createdAt: '2024-01-01' },
  { id: 'acc-2', name: 'Ahorro', currency: 'EUR', createdAt: '2024-01-01' },
]

function fillMinimumValid() {
  fireEvent.change(screen.getByLabelText('Concepto'), { target: { value: 'Alquiler' } })
  fireEvent.change(screen.getByLabelText('Cuantía'), { target: { value: '800' } })
  fireEvent.change(screen.getByLabelText('Cuenta'), { target: { value: 'acc-1' } })
  fireEvent.change(screen.getByLabelText('Fecha inicio'), { target: { value: '2024-01-01' } })
}

describe('FixedMovementForm', () => {
  it('renders main fields', () => {
    render(<FixedMovementForm accounts={accounts} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText('Concepto')).toBeDefined()
    expect(screen.getByLabelText('Tipo')).toBeDefined()
    expect(screen.getByLabelText('Cuantía')).toBeDefined()
    expect(screen.getByLabelText('Cuenta')).toBeDefined()
  })

  it('shows validation error when concept is empty', () => {
    render(<FixedMovementForm accounts={accounts} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(screen.getByText('El concepto es obligatorio')).toBeDefined()
  })

  it('calls onSubmit with valid data', () => {
    const onSubmit = vi.fn()
    render(<FixedMovementForm accounts={accounts} onSubmit={onSubmit} onCancel={vi.fn()} />)
    fillMinimumValid()
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).toHaveBeenCalledOnce()
    const result = onSubmit.mock.calls[0][0] as FixedMovement
    expect(result.concept).toBe('Alquiler')
    expect(result.amount).toBe(800)
    expect(result.accountId).toBe('acc-1')
    expect(result.id).toBeDefined()
  })

  it('shows target account field when type is transfer', () => {
    render(<FixedMovementForm accounts={accounts} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.queryByLabelText('Cuenta destino')).toBeNull()
    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'transfer' } })
    expect(screen.getByLabelText('Cuenta destino')).toBeDefined()
  })

  it('calls onCancel when cancel clicked', () => {
    const onCancel = vi.fn()
    render(<FixedMovementForm accounts={accounts} onSubmit={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('pre-fills values when editing', () => {
    const movement: FixedMovement = {
      id: '1',
      concept: 'Netflix',
      type: 'expense',
      amount: 15.99,
      frequency: { value: 1, unit: 'month' },
      startDate: '2024-01-01',
      endDate: null,
      effectiveDay: { mode: 'day-of-month', day: 1 },
      monteCarloVariance: 0,
      accountId: 'acc-1',
      targetAccountId: null,
      label: 'ocio',
      isBasicExpense: false,
    }
    render(<FixedMovementForm initialValues={movement} accounts={accounts} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect((screen.getByLabelText('Concepto') as HTMLInputElement).value).toBe('Netflix')
    expect((screen.getByLabelText('Cuantía') as HTMLInputElement).value).toBe('15.99')
  })
})
