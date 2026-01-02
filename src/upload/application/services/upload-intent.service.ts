import { randomUUID } from 'crypto'
import { UploadIntentEntity } from '@domain/entities/upload-intent.entity'
import { UploadFileEntity } from '@domain/entities/upload-file.entity'
import { type UploadAdapterPort } from '@application/ports/upload-adapter.port'
import { type UploadIntentServicePort, type CreateUploadIntentOptions } from '@application/ports/upload-intent.service'
import { type EventBusPort } from '@application/ports/event-bus.port'
import { type UploadServicePort } from '@application/ports/upload-service.port'
import { UploadIntentConfirmedIntegrationEvent } from '@application/integration-events'

export class UploadIntentService implements UploadIntentServicePort {
  private intents: Map<string, UploadIntentEntity> = new Map()

  constructor(
    private readonly eventBus: EventBusPort,
    private readonly uploadAdapter: UploadAdapterPort,
    private readonly uploadService: UploadServicePort
  ) {}

  async createIntent(options: CreateUploadIntentOptions): Promise<UploadIntentEntity> {
    const expiresAt = options.expiresAt ?? null
    const fileId = randomUUID() // Generate file ID first

    const key = `intent-uploads/${randomUUID()}/${Date.now()}`
    const presignedUrlVO = await this.uploadAdapter.generatePresignedUrl(key, fileId, 3600) // 1 hour

    const intent = UploadIntentEntity.create({
      key,
      presignedUrl: presignedUrlVO.url,
      presignedUrlExpiresAt: presignedUrlVO.expiresAt,
      expiresAt,
      sizeLimit: options.sizeLimit ?? null,
      mimeType: options.mimeType ?? null,
    })

    this.intents.set(intent.id, intent)

    // No event published for intent creation (internal-only operation)

    return intent
  }

  async validateIntent(intentId: string): Promise<void> {
    const intent = this.requireIntent(intentId)
    this.ensureIntentActive(intent)
  }

  async confirmIntent(intentId: string): Promise<UploadIntentEntity> {
    const intent = this.requireIntent(intentId)
    this.ensureIntentActive(intent)

    // Get file metadata from S3 (includes ID from metadata)
    const metadata = await this.uploadAdapter.getFileMetadata(intent.key)
    if (!metadata) {
      throw new Error('File not found in storage')
    }

    // Validate and confirm intent
    intent.confirm(metadata.size, metadata.mimeType)

    // Create UploadFileEntity with ID from S3 metadata and track it
    const uploadFile = UploadFileEntity.create({
      id: metadata.id, // Use ID from S3 metadata
      storageKey: intent.key,
      size: metadata.size,
      mimeType: metadata.mimeType,
      originalName: metadata.originalName,
      originalExtension: metadata.originalExtension,
      assetType: metadata.assetType ?? null,
      customMetadata: metadata.customMetadata ?? {},
      lastModified: metadata.lastModified,
    })

    // Track upload - this will publish FileUploadedIntegrationEvent
    const uploadDto = await this.uploadService.trackUpload(uploadFile)

    // Publish UploadIntentConfirmedIntegrationEvent with the upload DTO as payload
    const event = new UploadIntentConfirmedIntegrationEvent(uploadDto)
    await this.eventBus.publish(event)

    return intent
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
