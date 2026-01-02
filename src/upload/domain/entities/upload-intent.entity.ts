import { randomUUID } from 'crypto'

export class UploadIntentEntity {
  private constructor(
    public readonly id: string,
    public readonly key: string,
    public readonly presignedUrl: string,
    public readonly presignedUrlExpiresAt: Date,
    public expiresAt: Date | null,
    public readonly sizeLimit: number | null,
    public readonly mimeType: string | null,
    public uploadedFileId: string | null,
    public usedAt: Date | null,
    public actualSize: number | null,
    public actualMimeType: string | null,
  ) {}

  static create(params: {
    key: string
    presignedUrl: string
    presignedUrlExpiresAt: Date
    expiresAt: Date | null
    sizeLimit?: number | null
    mimeType?: string | null
  }): UploadIntentEntity {
    const id = randomUUID()
    const uploadedFileId = randomUUID() // Generate file ID for future upload
    return new UploadIntentEntity(
      id,
      params.key,
      params.presignedUrl,
      params.presignedUrlExpiresAt,
      params.expiresAt,
      params.sizeLimit ?? null,
      params.mimeType ?? null,
      uploadedFileId, // Set the generated file ID
      null,
      null,
      null,
    )
  }

  get isExpired(): boolean {
    return !!this.expiresAt && new Date() > this.expiresAt
  }

  get isUsed(): boolean {
    return !!this.usedAt
  }

  expire(): void {
    this.expiresAt = new Date()
  }

  confirm(actualSize: number, actualMimeType: string): void {
    if (this.isUsed) {
      throw new Error('Upload intent already used')
    }

    if (this.isExpired) {
      throw new Error('Upload intent has expired')
    }

    if (this.sizeLimit !== null && actualSize > this.sizeLimit) {
      throw new Error('File exceeds allowed size for this upload intent')
    }

    if (this.mimeType !== null && this.mimeType !== actualMimeType) {
      throw new Error('File mime type is not allowed for this upload intent')
    }

    this.usedAt = new Date()
    this.actualSize = actualSize
    this.actualMimeType = actualMimeType
  }

  get isPresignedUrlExpired(): boolean {
    return new Date() > this.presignedUrlExpiresAt
  }
}
