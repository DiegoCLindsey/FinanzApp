import { create } from 'zustand'
import type { FixedMovement } from '@/domain/entities/FixedMovement'
import type { ExtraordinaryMovement } from '@/domain/entities/ExtraordinaryMovement'
import { FixedMovementLocalRepository } from '@/infrastructure/persistence/FixedMovementLocalRepository'
import { ExtraordinaryMovementLocalRepository } from '@/infrastructure/persistence/ExtraordinaryMovementLocalRepository'

const fixedRepo = new FixedMovementLocalRepository()
const extraordinaryRepo = new ExtraordinaryMovementLocalRepository()

interface MovementState {
  fixedMovements: FixedMovement[]
  extraordinaryMovements: ExtraordinaryMovement[]
  loadAll: () => void
  saveFixedMovement: (movement: FixedMovement) => void
  deleteFixedMovement: (id: string) => void
  saveExtraordinaryMovement: (movement: ExtraordinaryMovement) => void
  deleteExtraordinaryMovement: (id: string) => void
}

export const useMovementStore = create<MovementState>((set) => ({
  fixedMovements: [],
  extraordinaryMovements: [],

  loadAll: () => {
    set({
      fixedMovements: fixedRepo.findAll(),
      extraordinaryMovements: extraordinaryRepo.findAll(),
    })
  },

  saveFixedMovement: (movement) => {
    fixedRepo.save(movement)
    set({ fixedMovements: fixedRepo.findAll() })
  },

  deleteFixedMovement: (id) => {
    fixedRepo.delete(id)
    set({ fixedMovements: fixedRepo.findAll() })
  },

  saveExtraordinaryMovement: (movement) => {
    extraordinaryRepo.save(movement)
    set({ extraordinaryMovements: extraordinaryRepo.findAll() })
  },

  deleteExtraordinaryMovement: (id) => {
    extraordinaryRepo.delete(id)
    set({ extraordinaryMovements: extraordinaryRepo.findAll() })
  },
}))
