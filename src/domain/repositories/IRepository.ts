export interface IRepository<T extends { id: string }> {
  findAll(): T[]
  findById(id: string): T | undefined
  save(entity: T): void
  delete(id: string): void
  deleteAll(): void
}
