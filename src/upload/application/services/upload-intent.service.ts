import { randomUUID } from 'crypto'
import { UploadIntentEntity } from '@domain/entities/upload-intent.entity'
import { UploadFileEntity } from '@domain/entities/upload-file.entity'
import { type UploadServicePort } from '@application/ports/upload-service.port'
import { type UploadAdapterPort } from '@application/ports/upload-adapter.port'
import { type UploadIntentServicePort, type CreateUploadIntentOptions } from '@application/ports/upload-intent.service'

export class UploadIntentService implements UploadIntentServicePort {
  private intents: Map<string, UploadIntentEntity> = new Map()

  constructor(
    private readonly uploadService: UploadServicePort,
    private readonly uploadAdapter: UploadAdapterPort
  ) {}

  async createIntent(options: CreateUploadIntentOptions): Promise<UploadIntentEntity> {
    const expiresAt = options.expiresAt ?? null

    // Generate presigned URL for upload FIRST
    const key = `intent-uploads/${randomUUID()}/${Date.now()}`
    const presignedUrl = await this.uploadAdapter.generatePresignedUrl(key, 3600) // 1 hour
    const presignedUrlExpiresAt = new Date(Date.now() + 3600 * 1000)

    const intent = UploadIntentEntity.create({
      key,
      presignedUrl,
      presignedUrlExpiresAt,
      expiresAt,
      sizeLimit: options.sizeLimit ?? null,
      mimeType: options.mimeType ?? null,
    })

    this.intents.set(intent.id, intent)
    return intent
  }

  async uploadFileWithIntent(intentId: string, file: File): Promise<{ intent: UploadIntentEntity; file: UploadFileEntity }> {
    const intent = this.requireIntent(intentId)
    this.ensureIntentActive(intent)

    if (intent.sizeLimit !== null && file.size > intent.sizeLimit) {
      throw new Error('File exceeds allowed size for this upload intent')
    }

    if (intent.mimeType !== null && file.type && intent.mimeType !== file.type) {
      throw new Error('File mime type is not allowed for this upload intent')
    }

    const uploadedFile = await this.uploadService.uploadFile(file)
    intent.assignUpload(uploadedFile)

    return { intent, file: uploadedFile }
  }

  async uploadFileFromUrlWithIntent(intentId: string, url: string): Promise<{ intent: UploadIntentEntity; file: UploadFileEntity }> {
    const intent = this.requireIntent(intentId)
    this.ensureIntentActive(intent)

    const uploadedFile = await this.uploadService.uploadFileFromUrl(url)

    if (intent.sizeLimit !== null && uploadedFile.size > intent.sizeLimit) {
      await this.uploadService.deleteFile(uploadedFile)
      throw new Error('File exceeds allowed size for this upload intent')
    }

    if (intent.mimeType !== null && uploadedFile.mimeType !== intent.mimeType) {
      await this.uploadService.deleteFile(uploadedFile)
      throw new Error('File mime type is not allowed for this upload intent')
    }

    intent.assignUpload(uploadedFile)

    return { intent, file: uploadedFile }
  }

  async getIntent(intentId: string): Promise<UploadIntentEntity | null> {
    return this.intents.get(intentId) ?? null
  }

  private requireIntent(intentId: string): UploadIntentEntity {
    const intent = this.intents.get(intentId)
    if (!intent) {
      throw new Error(`Upload intent ${intentId} not found`)
    }
    return intent
  }

  private ensureIntentActive(intent: UploadIntentEntity): void {
    if (intent.isUsed) {
      throw new Error('Upload intent has already been used')
    }

    if (intent.isExpired) {
      throw new Error('Upload intent has expired')
    }
  }
}
