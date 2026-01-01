
import { type EventHandler } from '@domain/events/event-handler.interface'
import { UserCreatedEvent } from '@domain/events/user-created.event'
import { User } from '@domain/entities/user.entity'

export class NotificationHandler implements EventHandler<UserCreatedEvent> {
  constructor(private notificationService: NotificationService) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    await this.notificationService.sendWelcomeNotifications(event.createdUser)
  }
}

export class NotificationService {
  constructor(
    // private emailService: EmailService,
    // private smsService: SmsService,
    // private pushService: PushService
  ) {}

  async sendWelcomeNotifications(user: User): Promise<void> {
    // Отправляем все типы уведомлений
    await Promise.all([
      // this.emailService.sendWelcome(user.email),
      // this.smsService.sendWelcome(user.phone),
      // this.pushService.sendWelcome(user.id)
    ])
  }
}