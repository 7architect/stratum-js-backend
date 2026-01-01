import mongoose from 'mongoose'
import { User } from '@domain/entities/user.entity'
import { UserServicePort } from '@application/ports/user-service.port'
import { Email } from '@domain/value-objects/email.value-object'
import { type EventBusPort } from '@application/ports/event-bus.port'
import { type UserRepoPort } from '@application/ports/user-repository.port'
import { type Allowance } from '@domain/value-objects/allowance.value-object'
import { UserRepoMongoAdapter } from '@infrastructure/adapters/user-repo-mongo.adatper'

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

  private publishEvents(user: User) {
    const events = user.getUncommittedEvents()
    this.eventBus.publishAll(events)
  }

  async create(email: string, password: string) {
    const user = User.create({ email: new Email(email), password })
    await this.userRepo.save(user)
    this.publishEvents(user)
    return user
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const user = await this.userRepo.update(id, userData)
    return user
  }

  async deleteUser(id: string): Promise<User> {
    const user = await this.userRepo.delete(id)
    this.publishEvents(user)
    return user
  }

  async findAll(page: number, perPage: number): Promise<{ users: User[], total: number }> {
    return await this.userRepo.findAll(page, perPage)
  }

  async findById(id: string) {
    return await this.userRepo.findById(id)
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepo.findByEmail(new Email(email))
  }

  async restoreLicense(id: string): Promise<User> {
    const user = await this.userRepo.findById(id)
    if (!user) {
      throw new Error('User not found')
    }
    user.acceptLicense()
    await this.userRepo.save(user)
    this.publishEvents(user)
    return user
  }

  async revokeLicense(id: string): Promise<User> {
    const user = await this.userRepo.findById(id)
    if (!user) {
      throw new Error('User not found')
    }
    user.revokeLicenseAcceptance()
    await this.userRepo.save(user)
    this.publishEvents(user)
    return user
  }

  async revokeAllowances(id: string, allowanceCodes: Allowance['code'][]): Promise<User> {
    const user = await this.userRepo.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    for (const code of allowanceCodes) {
      user.removeAllowance(code)
    }

    await this.userRepo.save(user)
    this.publishEvents(user)
    return user
  }

  async assignAllowances(id: string, allowances: Allowance[]): Promise<User> {
    const user = await this.userRepo.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    for (const allowance of allowances) {
      user.addAllowance(allowance)
    }
    await this.userRepo.save(user)
    this.publishEvents(user)
    return user
  }

  async consumeAllowances(id: string, allowanceCodes: Allowance['code'][], quantities: number[]): Promise<User> {
    const user = await this.userRepo.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    for (const code of allowanceCodes) {
      user.consumeAllowance(code, quantities.shift()!)
    }

    await this.userRepo.save(user)
    this.publishEvents(user)
    return user
  }
}
