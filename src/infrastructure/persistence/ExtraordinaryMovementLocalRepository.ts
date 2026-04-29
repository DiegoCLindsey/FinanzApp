import type { ExtraordinaryMovement } from '@/domain/entities/ExtraordinaryMovement'
import type { IExtraordinaryMovementRepository } from '@/domain/repositories/IExtraordinaryMovementRepository'
import { LocalStorageRepository } from './LocalStorageRepository'

export class ExtraordinaryMovementLocalRepository
  extends LocalStorageRepository<ExtraordinaryMovement>
  implements IExtraordinaryMovementRepository
{
  constructor() {
    super('finanzapp:extraordinary_movements')
  }

  findByAccountId(accountId: string): ExtraordinaryMovement[] {
    return this.findAll().filter((m) => m.accountId === accountId)
  }

  findByDateRange(from: string, to: string): ExtraordinaryMovement[] {
    const fromTime = new Date(from).getTime()
    const toTime = new Date(to).getTime()
    return this.findAll().filter((m) => {
      const t = new Date(m.date).getTime()
      return t >= fromTime && t <= toTime
    })
  }
}
