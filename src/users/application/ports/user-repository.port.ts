import { User } from '@domain/entities/user.entity'
import { Email } from '@domain/value-objects/email.value-object'
import { Mongoose } from 'mongoose'

export abstract class UserRepoPort {
  constructor(
    protected mongoClient: Mongoose
  ) {}

  abstract save(user: User): Promise<User>
  abstract delete(id: string): Promise<User>
  abstract update(id: string, userData: Partial<User>): Promise<User>
  abstract findById(id: string): Promise<User | null>
  abstract findByEmail(email: Email): Promise<User | null>
  abstract findAll(page: number, perPage: number): Promise<{ users: User[], total: number }>
}
