import mongoose from 'mongoose'
import { UserRepoMongoAdapter } from '@infrastructure/adapters/user-repo-mongo.adatper'
import { UserService } from '@application/services/user.service'
import { type EventBusPort } from '@application/ports/event-bus.port'
import { type UserRepoPort } from '@application/ports/user-repository.port'
import { type UserServicePort } from '@application/ports/user-service.port'

export class UserServiceFactory {
  static create(eventBus: EventBusPort, db: mongoose.Mongoose): UserServicePort {
    const userRepo = new UserRepoMongoAdapter(db)
    return new UserService(eventBus, userRepo)
  }

  static createWithExternalRepo(eventBus: EventBusPort, userRepo: UserRepoPort): UserServicePort {
    return new UserService(eventBus, userRepo)
  }
}
