import { BaseDomainEvent } from '@domain/events/domain-event.interface'
export class UserCreatedEvent extends BaseDomainEvent {
  constructor(
    public readonly createdUserId: string
  ) {
    super('user:created')
  }
}
