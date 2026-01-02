import { UploadFileEntity } from '@domain/entities/upload-file.entity'
import { UploadDto } from '../../presentation/upload.dto'
import { PresignedUrl } from '@domain/value-objects/presigned-url.value-object'
import { type UploadAdapterPort } from './upload-adapter.port'
import { type EventBusPort } from './event-bus.port'
import { type UploadRepoPort } from './upload-repository.port'

export abstract class UploadServicePort {
  constructor(
    protected readonly eventBus: EventBusPort,
    protected readonly uploadAdapter: UploadAdapterPort,
    protected readonly uploadRepo: UploadRepoPort,
  ) {}

  abstract uploadFile(file: File): Promise<UploadDto>
  abstract uploadFileFromUrl(url: string): Promise<UploadDto>
  abstract deleteFile(file: UploadFileEntity): Promise<UploadDto>
  abstract deleteFileByKey(storageKey: string): Promise<UploadDto | null>
  abstract getFile(storageKey: string): Promise<UploadDto | null>
  abstract listFiles(prefix?: string): Promise<UploadDto[]>
  abstract getFileMetadata(storageKey: string): Promise<UploadDto | null>
  abstract trackUpload(uploadFile: UploadFileEntity): Promise<UploadDto>
  abstract renameFile(oldKey: string, newKey: string): Promise<void>
  abstract updateFileMetadata(storageKey: string, metadata: Record<string, string>): Promise<void>
  abstract generateDownloadUrl(storageKey: string, expiresIn?: number): Promise<PresignedUrl>
  abstract getPublicUrl(storageKey: string): Promise<string>
}
