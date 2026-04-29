import { beforeEach, describe, expect, it } from 'vitest'
import { LocalStorageRepository } from './LocalStorageRepository'

interface TestEntity {
  id: string
  name: string
  value: number
}

describe('LocalStorageRepository', () => {
  let repo: LocalStorageRepository<TestEntity>

  beforeEach(() => {
    localStorage.clear()
    repo = new LocalStorageRepository<TestEntity>('test:entities')
  })

  it('returns empty array when no data stored', () => {
    expect(repo.findAll()).toEqual([])
  })

  it('saves and retrieves an entity', () => {
    const entity: TestEntity = { id: '1', name: 'Test', value: 42 }
    repo.save(entity)
    expect(repo.findAll()).toEqual([entity])
  })

  it('updates an existing entity', () => {
    const entity: TestEntity = { id: '1', name: 'Original', value: 1 }
    repo.save(entity)
    const updated: TestEntity = { ...entity, name: 'Updated', value: 99 }
    repo.save(updated)
    expect(repo.findAll()).toHaveLength(1)
    expect(repo.findAll()[0].name).toBe('Updated')
  })

  it('finds entity by id', () => {
    repo.save({ id: '1', name: 'A', value: 1 })
    repo.save({ id: '2', name: 'B', value: 2 })
    expect(repo.findById('2')).toMatchObject({ name: 'B' })
  })

  it('returns undefined for unknown id', () => {
    expect(repo.findById('nonexistent')).toBeUndefined()
  })

  it('deletes an entity by id', () => {
    repo.save({ id: '1', name: 'A', value: 1 })
    repo.save({ id: '2', name: 'B', value: 2 })
    repo.delete('1')
    expect(repo.findAll()).toHaveLength(1)
    expect(repo.findById('1')).toBeUndefined()
  })

  it('deleteAll clears all entities', () => {
    repo.save({ id: '1', name: 'A', value: 1 })
    repo.save({ id: '2', name: 'B', value: 2 })
    repo.deleteAll()
    expect(repo.findAll()).toEqual([])
  })

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('test:entities', 'INVALID_JSON{{{')
    expect(repo.findAll()).toEqual([])
  })

  it('persists multiple entities independently by key', () => {
    const repoA = new LocalStorageRepository<TestEntity>('test:a')
    const repoB = new LocalStorageRepository<TestEntity>('test:b')
    repoA.save({ id: '1', name: 'A', value: 1 })
    repoB.save({ id: '2', name: 'B', value: 2 })
    expect(repoA.findAll()).toHaveLength(1)
    expect(repoB.findAll()).toHaveLength(1)
    expect(repoA.findById('2')).toBeUndefined()
  })
})
