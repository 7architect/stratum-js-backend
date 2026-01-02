import { type UserServicePort } from '@/users/application/ports/user-service.port'
import { UserServiceFactory } from '@/users/infrastructure/factory/user-service.factory'
import { EventBusFacade } from '@/infrastructure/facade/event-bus.facade'
import { mongoConnection } from '@/infrastructure/adapters/mongo'

export class UserServiceFacade {
  private static instance: UserServicePort

  static getInstance(): UserServicePort {
    if (!UserServiceFacade.instance) {
      UserServiceFacade.instance = UserServiceFactory.create(
        EventBusFacade.getInstance(),
        mongoConnection.getDb()
      )
    }
    return UserServiceFacade.instance
  }
}
