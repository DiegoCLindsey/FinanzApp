import type { Loan } from '@/domain/entities/Loan'
import type { IRepository } from './IRepository'

export interface ILoanRepository extends IRepository<Loan> {
  findByAccountId(accountId: string): Loan[]
}
