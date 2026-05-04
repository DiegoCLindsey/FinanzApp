import type { Loan } from '@/domain/entities/Loan'
import type { ILoanRepository } from '@/domain/repositories/ILoanRepository'
import { LocalStorageRepository } from './LocalStorageRepository'

export class LoanLocalRepository
  extends LocalStorageRepository<Loan>
  implements ILoanRepository
{
  constructor() {
    super('finanzapp:loans')
  }

  findByAccountId(accountId: string): Loan[] {
    return this.findAll().filter((l) => l.accountId === accountId)
  }
}
