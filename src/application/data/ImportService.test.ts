import { describe, expect, it } from 'vitest'
import { readJsonFile } from './ImportService'
import { serializeAppData } from '@/infrastructure/serialization/AppDataSerializer'

function makeFile(content: string, name = 'test.json'): File {
  return new File([content], name, { type: 'application/json' })
}

describe('ImportService', () => {
  it('parses a valid JSON export file', async () => {
    const json = serializeAppData({
      accounts: [{ id: '1', name: 'Corriente', currency: 'EUR', createdAt: '2024-01-01' }],
      accountHistory: [],
      fixedMovements: [],
      extraordinaryMovements: [],
    })
    const file = makeFile(json)
    const result = await readJsonFile(file)
    expect(result.accounts).toHaveLength(1)
    expect(result.accounts[0].name).toBe('Corriente')
  })

  it('rejects on invalid JSON', async () => {
    const file = makeFile('not valid json')
    await expect(readJsonFile(file)).rejects.toThrow()
  })

  it('rejects on missing required fields', async () => {
    const file = makeFile(JSON.stringify({ version: '0.1.0' }))
    await expect(readJsonFile(file)).rejects.toThrow('Invalid FinanzApp export file')
  })
})
