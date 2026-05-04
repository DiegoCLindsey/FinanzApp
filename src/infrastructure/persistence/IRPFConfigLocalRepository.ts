import type { IRPFConfig } from '@/domain/entities/IRPFConfig'
import type { IIRPFConfigRepository } from '@/domain/repositories/IIRPFConfigRepository'
import { LocalStorageRepository } from './LocalStorageRepository'

export class IRPFConfigLocalRepository
  extends LocalStorageRepository<IRPFConfig>
  implements IIRPFConfigRepository
{
  constructor() {
    super('finanzapp:irpf_configs')
  }

  findActiveForDate(date: string): IRPFConfig | undefined {
    return this.findAll()
      .filter((c) => c.validFrom <= date)
      .sort((a, b) => b.validFrom.localeCompare(a.validFrom))[0]
  }
}
