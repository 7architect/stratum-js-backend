import { BaseDomainEvent } from '@domain/events/domain-event.interface'
import type { Allowance, ServiceAllowance } from '@domain/value-objects/allowance.value-object'

export class AllowanceConsumedEvent extends BaseDomainEvent {
  constructor(
    public readonly userId: string,
    public readonly allowance: Allowance,
    public readonly allowanceCode: ServiceAllowance,
    public readonly consumedAmount: number
  ) {
    super('user:allowance-consumed')
  }
}
