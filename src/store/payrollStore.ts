import { create } from 'zustand'
import type { Payroll } from '@/domain/entities/Payroll'
import type { IRPFConfig } from '@/domain/entities/IRPFConfig'
import { PayrollLocalRepository } from '@/infrastructure/persistence/PayrollLocalRepository'
import { IRPFConfigLocalRepository } from '@/infrastructure/persistence/IRPFConfigLocalRepository'

const payrollRepo = new PayrollLocalRepository()
const irpfRepo = new IRPFConfigLocalRepository()

interface PayrollState {
  payrolls: Payroll[]
  irpfConfigs: IRPFConfig[]
  loadAll: () => void
  savePayroll: (payroll: Payroll) => void
  deletePayroll: (id: string) => void
  saveIRPFConfig: (config: IRPFConfig) => void
  deleteIRPFConfig: (id: string) => void
  getActiveIRPFConfig: (date: string) => IRPFConfig | undefined
}

export const usePayrollStore = create<PayrollState>((set) => ({
  payrolls: [],
  irpfConfigs: [],

  loadAll: () => {
    set({
      payrolls: payrollRepo.findAll(),
      irpfConfigs: irpfRepo.findAll(),
    })
  },

  savePayroll: (payroll) => {
    payrollRepo.save(payroll)
    set({ payrolls: payrollRepo.findAll() })
  },

  deletePayroll: (id) => {
    payrollRepo.delete(id)
    set({ payrolls: payrollRepo.findAll() })
  },

  saveIRPFConfig: (config) => {
    irpfRepo.save(config)
    set({ irpfConfigs: irpfRepo.findAll() })
  },

  deleteIRPFConfig: (id) => {
    irpfRepo.delete(id)
    set({ irpfConfigs: irpfRepo.findAll() })
  },

  getActiveIRPFConfig: (date) => irpfRepo.findActiveForDate(date),
}))
