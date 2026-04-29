import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AccountForm from './AccountForm'

describe('AccountForm', () => {
  it('renders name and currency fields', () => {
    render(<AccountForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByLabelText('Nombre')).toBeDefined()
    expect(screen.getByLabelText('Divisa')).toBeDefined()
  })

  it('shows validation errors when submitted empty', () => {
    render(<AccountForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    const nameInput = screen.getByLabelText('Nombre') as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(screen.getByText('El nombre es obligatorio')).toBeDefined()
  })

  it('calls onSubmit with valid data', () => {
    const onSubmit = vi.fn()
    render(<AccountForm onSubmit={onSubmit} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Corriente' } })
    fireEvent.change(screen.getByLabelText('Divisa'), { target: { value: 'EUR' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))
    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0][0].name).toBe('Corriente')
    expect(onSubmit.mock.calls[0][0].currency).toBe('EUR')
    expect(onSubmit.mock.calls[0][0].id).toBeDefined()
  })

  it('pre-fills values when editing', () => {
    const account = { id: '1', name: 'Ahorro', currency: 'USD', createdAt: '2024-01-01' }
    render(<AccountForm initialValues={account} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect((screen.getByLabelText('Nombre') as HTMLInputElement).value).toBe('Ahorro')
    expect((screen.getByLabelText('Divisa') as HTMLInputElement).value).toBe('USD')
  })

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn()
    render(<AccountForm onSubmit={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
