import { UserDTO } from '@users/presentation/dto/user.dto'

export type AbstractAllowance = {
  code: string
  isUnlimited: boolean
  quantityRemaining: number | null
}

export abstract class AuthorizationContextPort {
 abstract can(allowance: AbstractAllowance): boolean
 abstract get user(): UserDTO
}
