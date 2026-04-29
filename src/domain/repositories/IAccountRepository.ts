import type { Account } from '@/domain/entities/Account'
import type { IRepository } from './IRepository'

export interface IAccountRepository extends IRepository<Account> {}
