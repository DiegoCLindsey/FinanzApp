import type { Payroll } from '@/domain/entities/Payroll'
import type { IRepository } from './IRepository'

export interface IPayrollRepository extends IRepository<Payroll> {
  findByAccountId(accountId: string): Payroll[]
}
