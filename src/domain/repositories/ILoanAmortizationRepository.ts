import type { LoanAmortization } from '@/domain/entities/LoanAmortization'
import type { IRepository } from './IRepository'

export interface ILoanAmortizationRepository extends IRepository<LoanAmortization> {
  findByLoanId(loanId: string): LoanAmortization[]
}
