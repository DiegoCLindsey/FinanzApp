import type { LoanAmortization } from '@/domain/entities/LoanAmortization'
import type { ILoanAmortizationRepository } from '@/domain/repositories/ILoanAmortizationRepository'
import { LocalStorageRepository } from './LocalStorageRepository'

export class LoanAmortizationLocalRepository
  extends LocalStorageRepository<LoanAmortization>
  implements ILoanAmortizationRepository
{
  constructor() {
    super('finanzapp:loan-amortizations')
  }

  findByLoanId(loanId: string): LoanAmortization[] {
    return this.findAll().filter((a) => a.loanId === loanId)
  }
}
