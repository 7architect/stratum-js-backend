import { UploadIntentEntity } from '@domain/entities/upload-intent.entity'
import { UploadFileEntity } from '@domain/entities/upload-file.entity'

export type CreateUploadIntentOptions = {
  expiresAt?: Date | null
  sizeLimit?: number | null
  mimeType?: string | null
}

export interface UploadIntentServicePort {
  createIntent(options: CreateUploadIntentOptions): Promise<UploadIntentEntity>

  uploadFileWithIntent(intentId: string, file: File): Promise<{
    intent: UploadIntentEntity
    file: UploadFileEntity
  }>

  uploadFileFromUrlWithIntent(intentId: string, url: string): Promise<{
    intent: UploadIntentEntity
    file: UploadFileEntity
  }>

  getIntent(intentId: string): Promise<UploadIntentEntity | null>
}
