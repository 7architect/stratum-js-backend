import { type AuthorizationContextPort, type AbstractAllowance } from '@application/ports/authorization-context.port'
import { type UserDTO } from '@users/presentation/dto/user.dto'
import { type UserServicePort } from '@users/application/ports/user-service.port'

export class AuthorizationContext implements AuthorizationContextPort {
  constructor(
    private readonly userDTO: UserDTO,
    private readonly userService: UserServicePort
  ) {}

  can(allowance: AbstractAllowance): boolean {
    return this.userDTO.allowances.some(
      userAllowance => userAllowance.code === allowance.code &&
        (userAllowance.unlimited || (userAllowance.quantityRemaining ?? 0) > 0)
    )
  }

  get user(): UserDTO {
    return this.userDTO
  }

  async refresh(): Promise<void> {
    const freshUser = await this.userService.findById(this.userDTO.id)
    if (!freshUser) {
      throw new Error(`User ${this.userDTO.id} not found`)
    }
    Object.assign(this.userDTO, freshUser)
  }
}
