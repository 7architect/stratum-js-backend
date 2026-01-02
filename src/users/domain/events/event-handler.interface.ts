import { type DomainEvent } from '@domain/events/domain-event.interface'

export interface EventHandler<T extends DomainEvent = DomainEvent> {
  handle(event: T): Promise<void>
}
