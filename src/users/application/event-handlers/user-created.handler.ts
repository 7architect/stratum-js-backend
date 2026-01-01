import { type EventHandler } from '@domain/events/event-handler.interface'
import { UserCreatedEvent } from '@domain/events/user-created.event'
import { NotificationService } from '@application/services/notification.service'
import { LoggerAdapter } from '@shared/logger/logger.adapter'

export class UserCreatedHandler implements EventHandler<UserCreatedEvent> {
  constructor(private notificationService: NotificationService) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    LoggerAdapter.info('User created', event)
    // await this.notificationService.sendWelcomeNotifications(event.createdUserId)
  }
}
