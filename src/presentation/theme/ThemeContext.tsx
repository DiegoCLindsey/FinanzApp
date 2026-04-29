import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { themes } from './themes'
import type { ThemeName } from './themes'

interface ThemeContextValue {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'finanzapp:theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    return (localStorage.getItem(STORAGE_KEY) as ThemeName) ?? 'dark'
  })

  const applyTheme = (t: ThemeName) => {
    const root = document.documentElement
    const colors = themes[t]
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
    root.classList.toggle('dark', t === 'dark')
    root.classList.toggle('light', t === 'light')
  }

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const setTheme = (t: ThemeName) => setThemeState(t)

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
