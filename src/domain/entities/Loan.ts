export interface Loan {
  id: string
  concept: string
  amount: number
  openingCommission: number
  tin: number
  tae: number | null
  termMonths: number
  startDate: string
  accountId: string
  label: string
}
