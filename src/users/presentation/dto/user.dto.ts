import type { User } from "@domain/entities/user.entity";

export class AllowanceDTOShape {
  constructor(
    public code: string,
    public expiresIn: number,
    public isUnlimited: boolean,
    public quantityTotal: number,
    public quantityRemaining: number
  ) {}
}

export class UserDTO {
  constructor(
    public id: string,
    public allowances: AllowanceDTOShape[],
    public email: string,
    public createrAt: number,
    public licenseAcceptedAt: number,
  ) {}

  static fromEntity(user: User) {
    return new UserDTO(
      user.id,
      user.allowances.map(allowance => new AllowanceDTOShape(
        allowance.allowanceCode,
        allowance.allowanceExpiresAt?.getTime() ?? 0,
        allowance.isUnlimited,
        allowance.totalQuantity,
        allowance.remainingQuantity
      )),
      user.email.value,
      user.createdAt.getTime(),
      user.licenseAcceptedAt?.getTime() ?? 0
    );
  }
}