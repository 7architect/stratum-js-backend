import { type AuthServicePort } from '@auth/application/ports/auth-service.port'
import { AuthServiceFactory } from '@auth/infrastructure/factory/auth-service.factory'

export class AuthServiceFacade {
  private static instance: AuthServicePort | null = null

  static getInstance() {
    if (!AuthServiceFacade.instance) {
      AuthServiceFacade.instance = AuthServiceFactory.create({ secret: 'secret' })
    }
    return AuthServiceFacade.instance
  }
}
