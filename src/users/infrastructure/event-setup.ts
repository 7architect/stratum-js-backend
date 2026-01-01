import { type EventBusPort } from '@application/ports/event-bus.port'
import { UserCreatedHandler } from '@application/event-handlers/user-created.handler'
import { isUserCreatedEvent } from '@domain/events/event.guards'
import { NotificationService } from '@application/services/notification.service'

export function setupUsersEventHandlers(eventBus: EventBusPort): { shutdownEventHandlers: () => void } {
  const notificationService = new NotificationService()
  const userCreatedHandler = new UserCreatedHandler(notificationService)

  const userCreatedCallback = async (event: any) => {
    if (isUserCreatedEvent(event)) {
      await userCreatedHandler.handle(event)
    }
  }

  eventBus.subscribe('user:created', userCreatedCallback)

  return {
    shutdownEventHandlers: () => {
      eventBus.unsubscribe('user:created', userCreatedCallback)
    }
  }
}
