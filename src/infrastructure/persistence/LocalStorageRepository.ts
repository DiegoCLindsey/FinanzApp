import type { IRepository } from '@/domain/repositories/IRepository'

export class LocalStorageRepository<T extends { id: string }>
  implements IRepository<T>
{
  constructor(private readonly storageKey: string) {}

  private read(): T[] {
    try {
      const raw = localStorage.getItem(this.storageKey)
      return raw ? (JSON.parse(raw) as T[]) : []
    } catch {
      return []
    }
  }

  private write(items: T[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items))
  }

  findAll(): T[] {
    return this.read()
  }

  findById(id: string): T | undefined {
    return this.read().find((item) => item.id === id)
  }

  save(entity: T): void {
    const items = this.read()
    const index = items.findIndex((item) => item.id === entity.id)
    if (index >= 0) {
      items[index] = entity
    } else {
      items.push(entity)
    }
    this.write(items)
  }

  delete(id: string): void {
    this.write(this.read().filter((item) => item.id !== id))
  }

  deleteAll(): void {
    this.write([])
  }
}
