import { BaseDomainEvent } from '@domain/events/domain-event.interface'
import { Email } from '@domain/value-objects/email.value-object'

export class UserEmailChangedEvent extends BaseDomainEvent {
  constructor(
    public readonly oldEmail: Email,
    public readonly newEmail: Email,
    public readonly userId: string
  ) {
    super('user:change-email')
  }
}
