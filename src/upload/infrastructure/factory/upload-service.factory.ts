import mongoose from 'mongoose'
import { type S3UploadAdapterConfig } from '@infrastructure/adapters/s3-upload.adapter'
import { UploadService } from '@application/services/upload.service'
import { type UploadServicePort } from '@application/ports/upload-service.port'
import { type EventBusPort } from '@application/ports/event-bus.port'
import { type UploadAdapterPort } from '@application/ports/upload-adapter.port'
import { S3AdapterFactory } from '@infrastructure/factory/s3-adapter.factory'
import { type UploadRepoPort } from '@application/ports/upload-repository.port'
import { UploadRepoFactory } from '@infrastructure/factory/upload-repo.factory'

export class UploadServiceFactory {
  static create(
    eventBus: EventBusPort,
    config: S3UploadAdapterConfig,
    db: mongoose.Mongoose,
    adapter?: UploadAdapterPort,
    uploadRepo?: UploadRepoPort,
  ): UploadServicePort {
    const _adapter = adapter || S3AdapterFactory.create(config)
    const _uploadRepo = uploadRepo || UploadRepoFactory.create(db)
    return new UploadService(eventBus, _adapter, _uploadRepo)
  }
}
