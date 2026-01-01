import { Allowance } from "@/users/domain/value-objects/allowance.value-object"
import { User } from "@/users/domain/entities/user.entity"

export class UserAllowanceDTO {
  constructor(
    public readonly code: string,
    public readonly expiresAt: number | null,
    public readonly quantity: number,
    public readonly unlimited: boolean
  ) {}

  static fromAllowance(allowance: Allowance) {
    return new UserAllowanceDTO(
      allowance.allowanceCode,
      allowance.allowanceExpiresAt?.getTime() || null,
      allowance.remainingQuantity,
      allowance.isUnlimited
    )
  }
}

export class UserDTO {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly allowances: UserAllowanceDTO[],
    public readonly createdAt: number,
    public readonly deletedAt: number | null,
    public readonly licenseAcceptedAt: number | null,
  ) {}

  static fromUser(user: User): UserDTO {
    return new UserDTO(
      user.id,
      user.email.value,
      user.allowances.map(UserAllowanceDTO.fromAllowance),
      user.createdAt.getTime(),
      user.deletedAt?.getTime() || null,
      user.licenseAcceptedAt?.getTime() || null,
    )
  }
}