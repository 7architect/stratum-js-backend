import { randomUUID } from 'crypto'

export interface DomainEvent {
  readonly eventId: string
  readonly eventType: string
  readonly occurredAt: Date
}

export abstract class BaseDomainEvent implements DomainEvent {
  readonly eventId: string
  readonly occurredAt: Date

  constructor(readonly eventType: string) {
    this.eventId = randomUUID()
    this.occurredAt = new Date()
  }
}
