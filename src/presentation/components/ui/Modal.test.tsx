import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Modal from './Modal'

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(<Modal isOpen={false} onClose={vi.fn()} title="Test"><p>Content</p></Modal>)
    expect(screen.queryByText('Content')).toBeNull()
  })

  it('renders content when open', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} title="My Modal"><p>Hello</p></Modal>)
    expect(screen.getByText('My Modal')).toBeDefined()
    expect(screen.getByText('Hello')).toBeDefined()
  })

  it('calls onClose when × button clicked', () => {
    const onClose = vi.fn()
    render(<Modal isOpen={true} onClose={onClose} title="Modal"><p>Content</p></Modal>)
    fireEvent.click(screen.getByRole('button', { name: '×' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
