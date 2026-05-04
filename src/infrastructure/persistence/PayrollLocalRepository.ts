import type { Payroll } from '@/domain/entities/Payroll'
import type { IPayrollRepository } from '@/domain/repositories/IPayrollRepository'
import { LocalStorageRepository } from './LocalStorageRepository'

export class PayrollLocalRepository
  extends LocalStorageRepository<Payroll>
  implements IPayrollRepository
{
  constructor() {
    super('finanzapp:payrolls')
  }

  findByAccountId(accountId: string): Payroll[] {
    return this.findAll().filter((p) => p.accountId === accountId)
  }
}
