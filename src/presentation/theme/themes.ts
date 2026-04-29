export interface ThemeColors {
  '--color-primary': string
  '--color-primary-hover': string
  '--color-surface': string
  '--color-surface-elevated': string
  '--color-border': string
  '--color-text-primary': string
  '--color-text-secondary': string
  '--color-positive': string
  '--color-negative': string
  '--color-warning': string
  '--color-bg': string
}

export type ThemeName = 'dark' | 'light'

export const themes: Record<ThemeName, ThemeColors> = {
  dark: {
    '--color-primary': '#6366f1',
    '--color-primary-hover': '#4f46e5',
    '--color-surface': '#1e1e2e',
    '--color-surface-elevated': '#2a2a3e',
    '--color-border': '#3b3b55',
    '--color-text-primary': '#e2e8f0',
    '--color-text-secondary': '#94a3b8',
    '--color-positive': '#22c55e',
    '--color-negative': '#ef4444',
    '--color-warning': '#f59e0b',
    '--color-bg': '#131320',
  },
  light: {
    '--color-primary': '#6366f1',
    '--color-primary-hover': '#4f46e5',
    '--color-surface': '#ffffff',
    '--color-surface-elevated': '#f8fafc',
    '--color-border': '#e2e8f0',
    '--color-text-primary': '#0f172a',
    '--color-text-secondary': '#64748b',
    '--color-positive': '#16a34a',
    '--color-negative': '#dc2626',
    '--color-warning': '#d97706',
    '--color-bg': '#f1f5f9',
  },
}
