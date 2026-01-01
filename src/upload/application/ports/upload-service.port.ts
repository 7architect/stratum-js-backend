import { UploadFileEntity } from '@domain/entities/upload-file.entity'
import { type UploadAdapterPort } from './upload-adapter.port'
import { type EventBusPort } from './event-bus.port'

export abstract class UploadServicePort {
  constructor(
    protected readonly eventBus: EventBusPort,
    protected readonly uploadAdapter: UploadAdapterPort,
  ) {}

  abstract uploadFile(file: File): Promise<UploadFileEntity>

  abstract uploadFileFromUrl(url: string): Promise<UploadFileEntity>

  abstract deleteFile(file: UploadFileEntity): Promise<UploadFileEntity>
}
