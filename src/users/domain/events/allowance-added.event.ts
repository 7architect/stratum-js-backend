import { BaseDomainEvent } from '@domain/events/domain-event.interface'
import type { Allowance } from '@domain/value-objects/allowance.value-object'

export class AllowanceAddedEvent extends BaseDomainEvent {
  constructor(
    public readonly userId: string,
    public readonly addedAllowance: Allowance
  ) {
    super('user:allowance-added')
  }
}
