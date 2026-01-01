export interface BaseEvent {
  readonly eventType: string
}

export type EventHandler = (event: any) => Promise<void> | void

export interface EventBus {
  publish(event: BaseEvent): Promise<void>
  publishAll(events: BaseEvent[]): Promise<void>
  subscribe(eventType: string, handler: EventHandler): void
  unsubscribe(eventType: string, handler: EventHandler): void
}
