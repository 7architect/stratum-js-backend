import { randomUUID } from 'crypto'
import { Email } from '@domain/value-objects/email.value-object'
import { Allowance } from '@domain/value-objects/allowance.value-object'
import { type ServiceAllowance } from '@domain/value-objects/allowance.value-object'

export type UserCreateFields = {
  email: Email
  password: string
  allowances?: Allowance[]
}

export type UserUpdateFields = Partial<UserCreateFields>

export type UserPersistenceFields = {
  id: string
  email: Email
  password: string
  allowances: Allowance[]
  createdAt: Date
  deletedAt: Date | null
  licenseAcceptedAt: Date | null
}

export class User {
  constructor(
    public id: string,
    public email: Email,
    public password: string,
    public allowances: Allowance[],
    public createdAt: Date,
    public deletedAt: Date | null,
    public licenseAcceptedAt: Date | null
  ) {}

  public static create(fields: UserCreateFields) {
    return new User(
      randomUUID(),
      fields.email,
      fields.password,
      [],
      new Date(),
      null,
      new Date()
    )
  }

  public static fromPersistence(fields: UserPersistenceFields) {
    return new User(
      fields.id,
      fields.email,
      fields.password,
      fields.allowances,
      fields.createdAt,
      fields.deletedAt,
      fields.licenseAcceptedAt
    )
  }

  get isDeleted() {
    return !!this.deletedAt
  }

  get isAdmin() {
    return this.hasAllowance('admin')
  }

  acceptLicense() {
    this.licenseAcceptedAt = new Date()
  }

  hasAllowance(code: ServiceAllowance): boolean {
    return this.allowances.some(allowance => allowance.allowanceCode === code)
  }

  getAllowance(code: ServiceAllowance): Allowance<ServiceAllowance> | null {
    return this.allowances.find(allowance => allowance.allowanceCode === code) || null
  }

  addAllowance(allowance: Allowance<ServiceAllowance>) {
    if (!this.hasAllowance(allowance.allowanceCode)) {
      this.allowances.push(allowance)
    }
  }

  removeAllowance(code: ServiceAllowance) {
    const allowance = this.getAllowance(code)
    if (!allowance) return

    this.allowances = this.allowances.filter(allowance => allowance.allowanceCode !== code)
  }

  updateAllowance(code: ServiceAllowance, newAllowance: Allowance<ServiceAllowance>) {
    const index = this.allowances.findIndex(allowance => allowance.allowanceCode === code)
    if (index !== -1) {
      this.allowances[index] = newAllowance
    }
  }

  changeEmail(email: Email) {
    this.email = email
  }

  consumeAllowance(code: ServiceAllowance, amount: number = 1): void {
    const allowance = this.getAllowance(code)
    if (!allowance) {
      throw new Error(`User does not have ${code} allowance`)
    }

    if (allowance.isExpired) {
      throw new Error(`${code} allowance has expired`)
    }

    allowance.decreaseQuantity(amount)
  }

  delete(): void {
    this.deletedAt = new Date()
  }

  revokeLicenseAcceptance(): void {
    this.licenseAcceptedAt = null
  }
}
