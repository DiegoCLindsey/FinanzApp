import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePredictions } from './usePredictions'
import type { Account } from '@/domain/entities/Account'
import type { AccountHistoryEntry } from '@/domain/entities/AccountHistoryEntry'

vi.mock('@/store/accountStore', () => ({
  useAccountStore: vi.fn(),
}))
vi.mock('@/store/movementStore', () => ({
  useMovementStore: vi.fn(),
}))

import { useAccountStore } from '@/store/accountStore'
import { useMovementStore } from '@/store/movementStore'

const mockAccounts: Account[] = [
  { id: 'acc-1', name: 'Corriente', currency: 'EUR', createdAt: '2024-01-01' },
]
const mockHistory: AccountHistoryEntry[] = [
  { id: 'h1', accountId: 'acc-1', date: '2024-01-01', balance: 2000, note: '' },
]

const accountState = {
  accounts: mockAccounts,
  history: mockHistory,
  loadAll: vi.fn(),
  saveAccount: vi.fn(),
  deleteAccount: vi.fn(),
  saveHistoryEntry: vi.fn(),
  deleteHistoryEntry: vi.fn(),
  getLatestBalance: vi.fn(() => 2000),
}

const movementState = {
  fixedMovements: [],
  extraordinaryMovements: [],
  loadAll: vi.fn(),
  saveFixedMovement: vi.fn(),
  deleteFixedMovement: vi.fn(),
  saveExtraordinaryMovement: vi.fn(),
  deleteExtraordinaryMovement: vi.fn(),
}

describe('usePredictions', () => {
  beforeEach(() => {
    vi.mocked(useAccountStore).mockImplementation((selector: (s: typeof accountState) => unknown) =>
      selector(accountState)
    )
    vi.mocked(useMovementStore).mockImplementation((selector: (s: typeof movementState) => unknown) =>
      selector(movementState)
    )
  })

  it('returns a PredictionResult with correct month count', () => {
    const { result } = renderHook(() => usePredictions(3))
    expect(result.current.result).not.toBeNull()
    expect(result.current.result?.months).toHaveLength(3)
  })

  it('returns isLoading false when accounts are present', () => {
    const { result } = renderHook(() => usePredictions(6))
    expect(result.current.isLoading).toBe(false)
  })

  it('returns isLoading true when no accounts', () => {
    const emptyState = { ...accountState, accounts: [], history: [] }
    vi.mocked(useAccountStore).mockImplementation((selector: (s: typeof emptyState) => unknown) =>
      selector(emptyState)
    )
    const { result } = renderHook(() => usePredictions(6))
    expect(result.current.isLoading).toBe(true)
  })
})
