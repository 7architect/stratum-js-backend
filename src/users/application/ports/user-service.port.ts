import { type UserDTO } from "@presentation/dto/user.dto"
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

  abstract create(email: string, password: string): Promise<UserDTO>

  abstract updateUser(id: string, userData: Partial<any>): Promise<UserDTO>
  abstract deleteUser(id: string): Promise<UserDTO>
  abstract findById(id: string): Promise<UserDTO | null>
  abstract findByEmail(email: string): Promise<UserDTO | null>
  abstract findAll(page: number, perPage: number): Promise<{
    users: UserDTO[],
    total: number
  }>

  abstract revokeLicense(id: string): Promise<UserDTO>
  abstract restoreLicense(id: string): Promise<UserDTO>

  abstract assignAllowances(id: string, allowances: Allowance[]): Promise<UserDTO>
  abstract revokeAllowances(id: string, allowanceCodes: Allowance['code'][]): Promise<UserDTO>
  abstract consumeAllowances(id: string, allowanceCodes: Allowance['code'][], quantities: number[]): Promise<UserDTO>
}
