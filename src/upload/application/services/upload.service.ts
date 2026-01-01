import { UploadServicePort } from '@application/ports/upload-service.port'
import { UploadFileEntity } from '@domain/entities/upload-file.entity'
import { type UploadAdapterPort, type UploadResult } from '@application/ports/upload-adapter.port'
import { type EventBusPort } from '@application/ports/event-bus.port'

export class UploadService extends UploadServicePort {
  constructor(
    eventBus: EventBusPort,
    uploadAdapter: UploadAdapterPort,
  ) {
    super(eventBus, uploadAdapter)
  }

  async uploadFile(file: File): Promise<UploadFileEntity> {
    const uploadResult = await this.uploadAdapter.uploadFile(file)
    return await this.persistUploadedFile(uploadResult)
  }

  async uploadFileFromUrl(url: string): Promise<UploadFileEntity> {
    const uploadResult = await this.uploadAdapter.uploadFileFromUrl(url)
    return await this.persistUploadedFile(uploadResult)
  }

  async deleteFile(file: UploadFileEntity): Promise<UploadFileEntity> {
    if (!file.isDeleted) {
      await this.uploadAdapter.deleteFile(file.storageKey)
      file.delete()
      await this.publishEvents(file)
    }

    return file
  }

  private async persistUploadedFile(upload: UploadResult): Promise<UploadFileEntity> {
    const file = UploadFileEntity.create({
      uri: upload.uri,
      size: upload.size,
      mimeType: upload.mimeType,
      storageKey: upload.key,
    })
    file.markUploaded()
    await this.publishEvents(file)

    return file
  }

  private async publishEvents(file: UploadFileEntity): Promise<void> {
    const events = file.getUncommittedEvents()
    if (events.length > 0) {
      await this.eventBus.publishAll(events)
    }
  }
}
