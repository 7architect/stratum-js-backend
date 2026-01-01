import { UploadService } from '@application/services/upload.service'
import { type UploadServicePort } from '@application/ports/upload-service.port'
import { type EventBusPort } from '@application/ports/event-bus.port'
import { S3UploadAdapter, type S3UploadAdapterConfig } from '@infrastructure/adapters/s3-upload.adapter'
import { type UploadAdapterPort } from '@application/ports/upload-adapter.port'

export class UploadServiceFactory {
  static create(
    eventBus: EventBusPort,
    config: S3UploadAdapterConfig,
  ): UploadServicePort {
    const adapter = new S3UploadAdapter(config)
    return new UploadService(eventBus, adapter)
  }

  static createAdapter(config: S3UploadAdapterConfig): UploadAdapterPort {
    return new S3UploadAdapter(config)
  }

  static createWithAdapter(
    eventBus: EventBusPort,
    adapter: UploadAdapterPort,
  ): UploadServicePort {
    return new UploadService(eventBus, adapter)
  }
}
