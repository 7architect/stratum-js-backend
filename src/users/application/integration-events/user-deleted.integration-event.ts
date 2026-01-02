import { BaseDomainEvent } from '@domain/events/domain-event.interface'
import type { UserDTO } from '../../presentation/dto/user.dto'

export class UserDeletedIntegrationEvent extends BaseDomainEvent {
  constructor(
    readonly payload: UserDTO
  ) {
    super('user:deleted')
  }
}
