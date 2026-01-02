import { type AuthServicePort } from '@auth/application/ports/auth-service.port'
import { AuthServiceFactory } from '@auth/infrastructure/factory/auth-service.factory'
import { settings } from '@config/settings'

export class AuthServiceFacade {
  private static instance: AuthServicePort

  static getInstance() {
    if (!AuthServiceFacade.instance) {
      AuthServiceFacade.instance = AuthServiceFactory.create(settings.getJwtConfig())
    }
    return AuthServiceFacade.instance
  }
}
