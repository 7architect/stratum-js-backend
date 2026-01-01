import { randomUUID } from 'crypto'
import { Email } from '@domain/value-objects/email.value-object'
import { Allowance } from '@domain/value-objects/allowance.value-object'
import { UserCreatedEvent } from '@domain/events/user-created.event'
import { UserDeletedEvent } from '@domain/events/user-deleted.event'
import { UserEmailChangedEvent } from '@domain/events/user-email-changed.event'
import { UserRevokeLicenseAcceptanceEvent } from '@domain/events/user-revoke-license-acceptance.event'
import { AllowanceAddedEvent } from '@domain/events/allowance-added.event'
import { AllowanceRemovedEvent } from '@domain/events/allowance-removed.event'
import { AllowanceChangedEvent } from '@domain/events/allowance-changed.event'
import { AllowanceConsumedEvent } from '@domain/events/allowance-consumed.event'
import { type ServiceAllowance } from '@domain/value-objects/allowance.value-object'
import { type DomainEvent } from '@domain/events/domain-event.interface'

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
  private events: DomainEvent[] = []

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
    const user = new User(
      randomUUID(),
      fields.email,
      fields.password,
      [],
      new Date(),
      null,
      new Date()
    )
    
    user.events.push(new UserCreatedEvent(user.id))
    
    return user
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
      this.events.push(new AllowanceAddedEvent(this.id, allowance))
    }
  }
  
  removeAllowance(code: ServiceAllowance) {
    const allowance = this.getAllowance(code)
    if (!allowance) return

    this.allowances = this.allowances.filter(allowance => allowance.allowanceCode !== code)
    this.events.push(new AllowanceRemovedEvent(this.id, allowance))
  }

  updateAllowance(code: ServiceAllowance, newAllowance: Allowance<ServiceAllowance>) {
    const index = this.allowances.findIndex(allowance => allowance.allowanceCode === code)
    if (index !== -1) {
      this.allowances[index] = newAllowance
      const decreased = newAllowance.remainingQuantity !== null &&
        this.allowances[index].remainingQuantity !== null &&
        newAllowance.remainingQuantity < this.allowances[index].remainingQuantity

      const increased = newAllowance.remainingQuantity !== null &&
        this.allowances[index].remainingQuantity !== null &&
        newAllowance.remainingQuantity > this.allowances[index].remainingQuantity

      this.events.push(
        new AllowanceChangedEvent(this.id, newAllowance, decreased, increased)
      )
    }
  }

  changeEmail(email: Email) {
    const old = this.email
    this.email = email
    this.events.push(new UserEmailChangedEvent(old, email, this.id))
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
    this.events.push(new AllowanceConsumedEvent(this.id, allowance, code, amount))
  }

  getUncommittedEvents(): DomainEvent[] {
    const events = this.events
    this.events = []
    return events
  }

  delete(): void {
    this.deletedAt = new Date()
    this.events.push(new UserDeletedEvent(this.id))
  }

  revokeLicenseAcceptance(): void {
    const previousAcceptanceDate = this.licenseAcceptedAt
    this.licenseAcceptedAt = null;
    this.events.push(
      new UserRevokeLicenseAcceptanceEvent(
        this.id,
        new Date(),
        previousAcceptanceDate
      )
    )
  }
}