import { BaseDomainEvent } from '@domain/events/domain-event.interface'

export class UserDeletedEvent extends BaseDomainEvent {
  constructor(
    public readonly deletedUserId: string,
  ) {
    super('user:deleted')
  }
}
