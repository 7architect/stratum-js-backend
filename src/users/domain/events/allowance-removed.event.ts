import { BaseDomainEvent } from '@domain/events/domain-event.interface'
import type { Allowance } from '@domain/value-objects/allowance.value-object'

export class AllowanceRemovedEvent extends BaseDomainEvent {
  constructor(
    public readonly userId: string,
    public readonly removedAllowance: Allowance
  ) {
    super('user:allowance-removed')
  }
}
