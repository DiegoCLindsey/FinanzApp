import type { FixedMovement } from '@/domain/entities/FixedMovement'
import type { IRepository } from './IRepository'

export interface IFixedMovementRepository extends IRepository<FixedMovement> {
  findByAccountId(accountId: string): FixedMovement[]
}
