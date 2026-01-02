import type { User } from '@domain/entities/user.entity'
import type { Allowance } from '@domain/value-objects/allowance.value-object'

export class UserAllowanceDTO {
  constructor(
    public readonly code: string,
    public readonly expiresAt: number | null,
    public readonly quantityTotal: number,
    public readonly quantityRemaining: number,
    public readonly unlimited: boolean
  ) {}

  static fromAllowance(allowance: Allowance) {
    return new UserAllowanceDTO(
      allowance.allowanceCode,
      allowance.allowanceExpiresAt?.getTime() ?? null,
      allowance.totalQuantity,
      allowance.remainingQuantity,
      allowance.isUnlimited
    )
  }
}

export class UserDTO {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password: string,
    public readonly allowances: UserAllowanceDTO[],
    public readonly createdAt: number,
    public readonly deletedAt: number | null,
    public readonly licenseAcceptedAt: number | null,
  ) {}

  static fromEntity(user: User): UserDTO {
    return new UserDTO(
      user.id,
      user.email.value,
      user.password,
      user.allowances.map(UserAllowanceDTO.fromAllowance),
      user.createdAt.getTime(),
      user.deletedAt?.getTime() ?? null,
      user.licenseAcceptedAt?.getTime() ?? null,
    )
  }
}
