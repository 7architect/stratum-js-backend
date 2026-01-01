import mitt, { type Emitter } from 'mitt'
import type { EventBus, EventHandler, BaseEvent } from './base-event.interface'
import type { AllDomainEvents } from './all-domain-events.type'

export class EventBusAdapter implements EventBus {
  private emitter: Emitter<Record<string, AllDomainEvents>>

  constructor() {
    this.emitter = mitt<Record<string, AllDomainEvents>>()
  }

  async publish(event: BaseEvent): Promise<void> {
    this.emitter.emit(event.eventType, event as unknown as AllDomainEvents)
  }

  async publishAll(events: BaseEvent[]): Promise<void> {
    const promises = events.map(event => this.publish(event))
    await Promise.all(promises)
  }

  subscribe(eventType: string, handler: EventHandler): void {
    this.emitter.on(eventType, handler)
  }

  unsubscribe(eventType: string, handler: EventHandler): void {
    this.emitter.off(eventType, handler)
  }
}
