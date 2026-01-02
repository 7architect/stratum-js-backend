import { UploadIntentEntity } from '@domain/entities/upload-intent.entity'

export type CreateUploadIntentOptions = {
  expiresAt?: Date | null
  sizeLimit?: number | null
  mimeType?: string | null
}

export interface UploadIntentServicePort {
  createIntent(options: CreateUploadIntentOptions): Promise<UploadIntentEntity>

  validateIntent(intentId: string): Promise<void>

  confirmIntent(intentId: string): Promise<UploadIntentEntity>

  getIntent(intentId: string): Promise<UploadIntentEntity | null>
}
