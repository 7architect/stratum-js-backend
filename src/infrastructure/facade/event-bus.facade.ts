import { type EventBusPort } from '@/users/application/ports/event-bus.port'
import { EventBusAdapter } from '@root/shared/events/event-bus.adapter'
import { setupEventHandlers } from '@root/infrastructure/event-setup'

export class EventBusFacade {
  private static instance: EventBusPort | null = null

  private constructor() {}

  static getInstance(): EventBusPort {
    if (!EventBusFacade.instance) {
      EventBusFacade.instance = new EventBusAdapter()
      setupEventHandlers(EventBusFacade.instance)
    }
    return EventBusFacade.instance
  }

  static getInstanceSync(): EventBusPort {
    return EventBusFacade.getInstance()
  }
}
