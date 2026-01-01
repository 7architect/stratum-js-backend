import { BaseDomainEvent } from '@domain/events/domain-event.interface'
import type { Allowance } from '@domain/value-objects/allowance.value-object'

export class AllowanceChangedEvent extends BaseDomainEvent {
  constructor(
    public readonly userId: string,
    public readonly changedAllowance: Allowance,
    public readonly decreased: boolean,
    public readonly increased: boolean
  ) {
    super('user:allowance-changed')
  }
}
