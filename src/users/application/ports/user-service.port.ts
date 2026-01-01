import { type User } from "@domain/entities/user.entity"
import { type UserRepoPort } from "@application/ports/user-repository.port"
import { type EventBusPort } from "@application/ports/event-bus.port"
import { type Allowance } from "@domain/value-objects/allowance.value-object"

export interface UserServiceConstructor {
  new (): UserServicePort
}

export abstract class UserServicePort {
  protected eventBus: EventBusPort
  protected userRepo: UserRepoPort

  constructor(
    eventBus: EventBusPort,
    userRepo: UserRepoPort,
  ) {
    this.eventBus = eventBus
    this.userRepo = userRepo
  }

  abstract create(email: string, password: string): Promise<User>

  abstract updateUser(id: string, userData: Partial<User>): Promise<User>
  abstract deleteUser(id: string): Promise<User>
  abstract findById(id: string): Promise<User | null>
  abstract findByEmail(email: string): Promise<User | null>
  abstract findAll(page: number, perPage: number): Promise<{
    users: User[],
    total: number
  }>

  abstract revokeLicense(id: string): Promise<User>
  abstract restoreLicense(id: string): Promise<User>

  abstract assignAllowances(id: string, allowances: Allowance[]): Promise<User>
  abstract revokeAllowances(id: string, allowanceCodes: Allowance['code'][]): Promise<User>
  abstract consumeAllowances(id: string, allowanceCodes: Allowance['code'][], quantities: number[]): Promise<User>
}
