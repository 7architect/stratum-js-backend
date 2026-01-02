import mongoose from 'mongoose'
import { User } from '@domain/entities/user.entity'
import { UserServicePort } from '@application/ports/user-service.port'
import { Email } from '@domain/value-objects/email.value-object'
import { type EventBusPort } from '@application/ports/event-bus.port'
import { type UserRepoPort } from '@application/ports/user-repository.port'
import { type Allowance } from '@domain/value-objects/allowance.value-object'
import { UserRepoMongoAdapter } from '@infrastructure/adapters/user-repo-mongo.adatper'
import { UserDTO } from '@presentation/dto/user.dto'
import {
  UserCreatedIntegrationEvent,
  UserDeletedIntegrationEvent,
  UserLicenseChangedIntegrationEvent,
  UserAllowancesChangedIntegrationEvent
} from '@application/integration-events'

export class UserService extends UserServicePort {
  constructor(
    eventBus: EventBusPort,
    userRepo: UserRepoPort,
  ) {
    super(eventBus, userRepo)
  }

  static factory(eventBus: EventBusPort, db: mongoose.Mongoose) {
    const userRepo = new UserRepoMongoAdapter(db)
    return new UserService(eventBus, userRepo)
  }

  private mapToDTO(user: User): UserDTO {
    return UserDTO.fromEntity(user)
  }

  async create(email: string, password: string): Promise<UserDTO> {
    const user = User.create({ email: new Email(email), password })
    await this.userRepo.save(user)

    // Create and publish Integration Event
    const userDto = this.mapToDTO(user)
    const event = new UserCreatedIntegrationEvent(userDto)
    await this.eventBus.publish(event)

    return userDto
  }

  async updateUser(id: string, userData: Partial<User>): Promise<UserDTO> {
    const user = await this.userRepo.update(id, userData)
    return this.mapToDTO(user)
  }

  async deleteUser(id: string): Promise<UserDTO> {
    const user = await this.userRepo.delete(id)

    // Create and publish Integration Event
    const userDto = this.mapToDTO(user)
    const event = new UserDeletedIntegrationEvent(userDto)
    await this.eventBus.publish(event)

    return userDto
  }

  async findAll(page: number, perPage: number): Promise<{ users: UserDTO[], total: number }> {
    const result = await this.userRepo.findAll(page, perPage)
    return {
      users: result.users.map(user => this.mapToDTO(user)),
      total: result.total
    }
  }

  async findById(id: string): Promise<UserDTO | null> {
    const user = await this.userRepo.findById(id)
    return user ? this.mapToDTO(user) : null
  }

  async findByEmail(email: string): Promise<UserDTO | null> {
    const user = await this.userRepo.findByEmail(new Email(email))
    return user ? this.mapToDTO(user) : null
  }

  async restoreLicense(id: string): Promise<UserDTO> {
    const user = await this.userRepo.findById(id)
    if (!user) {
      throw new Error('User not found')
    }
    user.acceptLicense()
    await this.userRepo.save(user)

    // Create and publish Integration Event
    const userDto = this.mapToDTO(user)
    const event = new UserLicenseChangedIntegrationEvent(userDto)
    await this.eventBus.publish(event)

    return userDto
  }

  async revokeLicense(id: string): Promise<UserDTO> {
    const user = await this.userRepo.findById(id)
    if (!user) {
      throw new Error('User not found')
    }
    user.revokeLicenseAcceptance()
    await this.userRepo.save(user)

    // Create and publish Integration Event
    const userDto = this.mapToDTO(user)
    const event = new UserLicenseChangedIntegrationEvent(userDto)
    await this.eventBus.publish(event)

    return userDto
  }

  async revokeAllowances(id: string, allowanceCodes: Allowance['code'][]): Promise<UserDTO> {
    const user = await this.userRepo.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    for (const code of allowanceCodes) {
      user.removeAllowance(code)
    }

    await this.userRepo.save(user)

    // Create and publish Integration Event
    const userDto = this.mapToDTO(user)
    const event = new UserAllowancesChangedIntegrationEvent(userDto)
    await this.eventBus.publish(event)

    return userDto
  }

  async assignAllowances(id: string, allowances: Allowance[]): Promise<UserDTO> {
    const user = await this.userRepo.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    for (const allowance of allowances) {
      user.addAllowance(allowance)
    }

    await this.userRepo.save(user)

    // Create and publish Integration Event
    const userDto = this.mapToDTO(user)
    const event = new UserAllowancesChangedIntegrationEvent(userDto)
    await this.eventBus.publish(event)

    return userDto
  }

  async consumeAllowances(id: string, allowanceCodes: Allowance['code'][], quantities: number[]): Promise<UserDTO> {
    const user = await this.userRepo.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    for (let i = 0; i < allowanceCodes.length; i++) {
      const code = allowanceCodes[i]
      const quantity = quantities[i] || 1
      // TODO: validate allowance code
      if (!code) {
        throw new Error('Allowance code is required')
      }

      user.consumeAllowance(code, quantity)
    }

    await this.userRepo.save(user)

    // Create and publish Integration Event
    const userDto = this.mapToDTO(user)
    const event = new UserAllowancesChangedIntegrationEvent(userDto)
    await this.eventBus.publish(event)

    return userDto
  }
}
