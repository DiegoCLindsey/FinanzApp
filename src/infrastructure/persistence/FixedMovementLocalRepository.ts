import type { FixedMovement } from '@/domain/entities/FixedMovement'
import type { IFixedMovementRepository } from '@/domain/repositories/IFixedMovementRepository'
import { LocalStorageRepository } from './LocalStorageRepository'

export class FixedMovementLocalRepository
  extends LocalStorageRepository<FixedMovement>
  implements IFixedMovementRepository
{
  constructor() {
    super('finanzapp:fixed_movements')
  }

  findByAccountId(accountId: string): FixedMovement[] {
    return this.findAll().filter((m) => m.accountId === accountId)
  }
}
