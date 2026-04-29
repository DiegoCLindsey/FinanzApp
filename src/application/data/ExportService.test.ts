import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { exportToJson } from './ExportService'
import type { ExportPayload } from './ExportService'

describe('ExportService', () => {
  let createObjectURLMock: ReturnType<typeof vi.fn>
  let revokeObjectURLMock: ReturnType<typeof vi.fn>
  let clickMock: ReturnType<typeof vi.fn>
  let appendChildMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    createObjectURLMock = vi.fn(() => 'blob:test-url')
    revokeObjectURLMock = vi.fn()
    clickMock = vi.fn()
    appendChildMock = vi.fn()

    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURLMock, writable: true })
    Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectURLMock, writable: true })

    const fakeAnchor = { href: '', download: '', click: clickMock }
    vi.spyOn(document, 'createElement').mockReturnValue(fakeAnchor as unknown as HTMLElement)
    vi.spyOn(document.body, 'appendChild').mockImplementation(appendChildMock)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const payload: ExportPayload = {
    accounts: [{ id: '1', name: 'Test', currency: 'EUR', createdAt: '2024-01-01' }],
    accountHistory: [],
    fixedMovements: [],
    extraordinaryMovements: [],
  }

  it('creates a blob URL and triggers download', () => {
    exportToJson(payload)
    expect(createObjectURLMock).toHaveBeenCalledOnce()
    expect(clickMock).toHaveBeenCalledOnce()
    expect(revokeObjectURLMock).toHaveBeenCalledOnce()
  })

  it('download filename includes current date', () => {
    const anchor = { href: '', download: '', click: vi.fn() }
    vi.spyOn(document, 'createElement').mockReturnValue(anchor as unknown as HTMLElement)
    exportToJson(payload)
    expect(anchor.download).toMatch(/finanzapp-backup-\d{4}-\d{2}-\d{2}\.json/)
  })
})
