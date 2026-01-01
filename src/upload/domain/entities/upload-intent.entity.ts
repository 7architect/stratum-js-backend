import { randomUUID } from 'crypto'

import { UploadFileEntity } from './upload-file.entity'

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
    public uploadedFileUri: string | null,
    public usedAt: Date | null,
  ) {}

  static create(params: {
    key: string
    presignedUrl: string
    presignedUrlExpiresAt: Date
    expiresAt: Date | null
    sizeLimit?: number | null
    mimeType?: string | null
  }): UploadIntentEntity {
    return new UploadIntentEntity(
      randomUUID(),
      params.key,
      params.presignedUrl,
      params.presignedUrlExpiresAt,
      params.expiresAt,
      params.sizeLimit ?? null,
      params.mimeType ?? null,
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

  assignUpload(file: UploadFileEntity): void {
    if (this.isUsed) {
      throw new Error('Upload intent already used')
    }

    this.usedAt = new Date()
    this.uploadedFileId = file.id
    this.uploadedFileUri = file.uri
  }

  get isPresignedUrlExpired(): boolean {
    return new Date() > this.presignedUrlExpiresAt
  }
}
