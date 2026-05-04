import type { Loan } from '@/domain/entities/Loan'
import type { LoanAmortization } from '@/domain/entities/LoanAmortization'

export interface AmortizationRow {
  month: number
  date: string
  principalPayment: number
  interestPayment: number
  quota: number
  remainingPrincipal: number
}

export interface LoanSchedule {
  quota: number
  totalPayments: number
  totalInterest: number
  rows: AmortizationRow[]
}

/** TAE = (1 + TIN/12)^12 - 1, expressed as percentage */
export function calculateTAE(tinPercent: number): number {
  const r = tinPercent / 100 / 12
  return ((1 + r) ** 12 - 1) * 100
}

/** French amortization quota: P * r*(1+r)^n / ((1+r)^n - 1) */
function frenchQuota(principal: number, monthlyRate: number, months: number): number {
  if (monthlyRate === 0) return principal / months
  const factor = (1 + monthlyRate) ** months
  return (principal * monthlyRate * factor) / (factor - 1)
}

function addMonths(dateStr: string, n: number): string {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + n)
  return d.toISOString().slice(0, 10)
}

/**
 * Builds the full French amortization schedule for a loan, applying
 * any amortizations (sorted by date) that fall within the schedule.
 */
export function buildLoanSchedule(loan: Loan, amortizations: LoanAmortization[] = []): LoanSchedule {
  const monthlyRate = loan.tin / 100 / 12
  const sorted = [...amortizations].sort((a, b) => a.date.localeCompare(b.date))

  let principal = loan.amount
  let remainingMonths = loan.termMonths
  let quota = frenchQuota(principal, monthlyRate, remainingMonths)

  const rows: AmortizationRow[] = []
  let month = 0

  while (remainingMonths > 0 && principal > 0.005) {
    month++
    const date = addMonths(loan.startDate, month - 1)

    // Apply amortizations that occur before or on this payment date
    for (const amort of sorted) {
      if (amort.date > date) break
      if ((amort as LoanAmortization & { _applied?: boolean })._applied) continue
      ;(amort as LoanAmortization & { _applied?: boolean })._applied = true

      principal = Math.max(0, principal - amort.amount)

      if (amort.type === 'reduce-quota') {
        quota = frenchQuota(principal, monthlyRate, remainingMonths)
      } else {
        // reduce-term: keep quota, reduce months
        if (monthlyRate === 0) {
          remainingMonths = Math.ceil(principal / quota)
        } else {
          const r = monthlyRate
          const q = quota
          remainingMonths = Math.ceil(Math.log(q / (q - r * principal)) / Math.log(1 + r))
        }
        remainingMonths = Math.max(1, remainingMonths)
      }
    }

    if (principal <= 0.005) break

    const interest = principal * monthlyRate
    const principalPayment = Math.min(quota - interest, principal)
    const actualQuota = principalPayment + interest

    rows.push({
      month,
      date,
      principalPayment,
      interestPayment: interest,
      quota: actualQuota,
      remainingPrincipal: Math.max(0, principal - principalPayment),
    })

    principal = Math.max(0, principal - principalPayment)
    remainingMonths--
  }

  // Clean up _applied markers
  for (const amort of sorted) {
    delete (amort as LoanAmortization & { _applied?: boolean })._applied
  }

  const totalPayments = rows.reduce((s, r) => s + r.quota, 0)
  const totalInterest = rows.reduce((s, r) => s + r.interestPayment, 0)

  return { quota, totalPayments, totalInterest, rows }
}

/**
 * Returns only the rows that fall within [year, month] (1-indexed month).
 * Used by the prediction engine to find the quota due in a given month.
 */
export function getScheduleRowForMonth(
  schedule: LoanSchedule,
  year: number,
  month: number,
): AmortizationRow | undefined {
  const target = `${year}-${String(month).padStart(2, '0')}`
  return schedule.rows.find((r) => r.date.startsWith(target))
}

export function resolveTAE(loan: Loan): number {
  return loan.tae !== null ? loan.tae : calculateTAE(loan.tin)
}
