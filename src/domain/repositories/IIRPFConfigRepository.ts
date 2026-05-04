import type { IRPFConfig } from '@/domain/entities/IRPFConfig'
import type { IRepository } from './IRepository'

export interface IIRPFConfigRepository extends IRepository<IRPFConfig> {
  findActiveForDate(date: string): IRPFConfig | undefined
}
