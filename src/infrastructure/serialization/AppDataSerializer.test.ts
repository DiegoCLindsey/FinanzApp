import { describe, expect, it } from 'vitest'
import { serializeAppData, deserializeAppData } from './AppDataSerializer'
import type { Account } from '@/domain/entities/Account'

describe('AppDataSerializer', () => {
  const baseData = {
    accounts: [{ id: '1', name: 'Checking', currency: 'EUR', createdAt: '2024-01-01' }] as Account[],
    accountHistory: [],
    fixedMovements: [],
    extraordinaryMovements: [],
  }

  it('serializes data with version and exportedAt', () => {
    const json = serializeAppData(baseData)
    const parsed = JSON.parse(json)
    expect(parsed.version).toBe('0.1.0')
    expect(parsed.exportedAt).toBeDefined()
    expect(parsed.accounts).toHaveLength(1)
  })

  it('round-trips correctly', () => {
    const json = serializeAppData(baseData)
    const restored = deserializeAppData(json)
    expect(restored.accounts[0].name).toBe('Checking')
    expect(restored.fixedMovements).toEqual([])
  })

  it('throws on invalid JSON', () => {
    expect(() => deserializeAppData('not json')).toThrow()
  })

  it('throws on missing required fields', () => {
    const incomplete = JSON.stringify({ version: '0.1.0' })
    expect(() => deserializeAppData(incomplete)).toThrow('Invalid FinanzApp export file')
  })
})
