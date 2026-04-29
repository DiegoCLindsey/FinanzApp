import type { ExtraordinaryMovement } from '@/domain/entities/ExtraordinaryMovement'
import type { IRepository } from './IRepository'

export interface IExtraordinaryMovementRepository extends IRepository<ExtraordinaryMovement> {
  findByAccountId(accountId: string): ExtraordinaryMovement[]
  findByDateRange(from: string, to: string): ExtraordinaryMovement[]
}
