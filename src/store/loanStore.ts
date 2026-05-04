import { create } from 'zustand'
import type { Loan } from '@/domain/entities/Loan'
import type { LoanAmortization } from '@/domain/entities/LoanAmortization'
import { LoanLocalRepository } from '@/infrastructure/persistence/LoanLocalRepository'
import { LoanAmortizationLocalRepository } from '@/infrastructure/persistence/LoanAmortizationLocalRepository'

const loanRepo = new LoanLocalRepository()
const amortRepo = new LoanAmortizationLocalRepository()

interface LoanState {
  loans: Loan[]
  amortizations: LoanAmortization[]
  loadAll: () => void
  saveLoan: (loan: Loan) => void
  deleteLoan: (id: string) => void
  saveAmortization: (amortization: LoanAmortization) => void
  deleteAmortization: (id: string) => void
  getAmortizationsForLoan: (loanId: string) => LoanAmortization[]
}

export const useLoanStore = create<LoanState>((set, get) => ({
  loans: [],
  amortizations: [],

  loadAll: () => {
    set({
      loans: loanRepo.findAll(),
      amortizations: amortRepo.findAll(),
    })
  },

  saveLoan: (loan) => {
    loanRepo.save(loan)
    set({ loans: loanRepo.findAll() })
  },

  deleteLoan: (id) => {
    loanRepo.delete(id)
    amortRepo.findByLoanId(id).forEach((a) => amortRepo.delete(a.id))
    set({ loans: loanRepo.findAll(), amortizations: amortRepo.findAll() })
  },

  saveAmortization: (amortization) => {
    amortRepo.save(amortization)
    set({ amortizations: amortRepo.findAll() })
  },

  deleteAmortization: (id) => {
    amortRepo.delete(id)
    set({ amortizations: amortRepo.findAll() })
  },

  getAmortizationsForLoan: (loanId) =>
    get().amortizations.filter((a) => a.loanId === loanId),
}))
