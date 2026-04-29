export interface IRPFBracket {
  from: number
  to: number | null
  rate: number
}

export interface IRPFConfig {
  id: string
  validFrom: string
  brackets: IRPFBracket[]
}
