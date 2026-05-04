export type AmortizationType = 'reduce-quota' | 'reduce-term'

export interface LoanAmortization {
  id: string
  loanId: string
  date: string
  amount: number
  type: AmortizationType
  note: string
}
