import { type EventBusPort } from '@application/ports/event-bus.port'
import { UploadIntentService } from '@application/services/upload-intent.service'
import { type UploadIntentServicePort } from '@application/ports/upload-intent.service'
import { type UploadAdapterPort } from '@application/ports/upload-adapter.port'
import { type UploadServicePort } from '@application/ports/upload-service.port'

export class UploadIntentServiceFactory {
  static create(
    eventBus: EventBusPort,
    adapter: UploadAdapterPort,
    uploadService: UploadServicePort,
  ): UploadIntentServicePort {
    return new UploadIntentService(eventBus, adapter, uploadService)
  }
}
