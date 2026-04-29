import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { ThemeProvider, useTheme } from './ThemeContext'

function ThemeConsumer() {
  const { theme, setTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('style')
  })

  it('defaults to dark theme', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )
    expect(screen.getByTestId('theme').textContent).toBe('dark')
  })

  it('switches to light theme on button click', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )
    fireEvent.click(screen.getByText('Set Light'))
    expect(screen.getByTestId('theme').textContent).toBe('light')
  })

  it('persists theme to localStorage', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    )
    fireEvent.click(screen.getByText('Set Light'))
    expect(localStorage.getItem('finanzapp:theme')).toBe('light')
  })

  it('throws when useTheme is used outside ThemeProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<ThemeConsumer />)).toThrow()
    consoleSpy.mockRestore()
  })
})
