import { type EventBusPort } from '@application/ports/event-bus.port'
import { UploadServiceFactory } from '@infrastructure/factory/upload-service.factory'
import { type UploadServicePort } from '@application/ports/upload-service.port'
import { UploadIntentService } from '@application/services/upload-intent.service'
import { type UploadIntentServicePort, type CreateUploadIntentOptions } from '@application/ports/upload-intent.service'
import { type S3UploadAdapterConfig } from '@infrastructure/adapters/s3-upload.adapter'
import { type UploadAdapterPort } from '@application/ports/upload-adapter.port'

export class UploadIntentServiceFactory {
  static create(
    eventBus: EventBusPort,
    s3Config: S3UploadAdapterConfig,
  ): UploadIntentServicePort {
    const uploadService = UploadServiceFactory.create(eventBus, s3Config)
    const adapter = UploadServiceFactory.createAdapter(s3Config)
    return new UploadIntentService(uploadService, adapter)
  }

  static createWithUploadService(uploadService: UploadServicePort, adapter: UploadAdapterPort): UploadIntentServicePort {
    return new UploadIntentService(uploadService, adapter)
  }

  static createWithAdapter(
    eventBus: EventBusPort,
    adapter: UploadAdapterPort,
  ): UploadIntentServicePort {
    const uploadService = UploadServiceFactory.createWithAdapter(eventBus, adapter)
    return new UploadIntentService(uploadService, adapter)
  }
}
