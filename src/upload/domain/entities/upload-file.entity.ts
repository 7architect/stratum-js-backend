import { randomUUID } from 'crypto'

import { type DomainEvent } from '../events/domain-event.interface'
import { UploadFileCreatedEvent } from '../events/upload-file-created.event'
import { UploadFileUploadedEvent } from '../events/upload-file-uploaded.event'
import { UploadFileDeletedEvent } from '../events/upload-file-deleted.event'

export class UploadFileEntity {
  private events: DomainEvent[] = []

  private constructor(
    public readonly id: string,
    public uri: string,
    public size: number,
    public mimeType: string,
    public readonly storageKey: string,
    public readonly createdAt: Date,
    public uploadedAt: Date | null,
    public deletedAt: Date | null,
  ) {}

  static create(params: {
    id?: string
    uri: string
    size: number
    mimeType: string
    storageKey: string
    createdAt?: Date
  }): UploadFileEntity {
    const file = new UploadFileEntity(
      params.id ?? randomUUID(),
      params.uri,
      params.size,
      params.mimeType,
      params.storageKey,
      params.createdAt ?? new Date(),
      null,
      null,
    )

    file.events.push(
      new UploadFileCreatedEvent(
        file.id,
        file.uri,
        file.size,
        file.mimeType,
        file.storageKey,
      ),
    )

    return file
  }

  static fromPersistence(params: {
    id: string
    uri: string
    size: number
    mimeType: string
    storageKey: string
    createdAt: Date
    uploadedAt: Date | null
    deletedAt: Date | null
  }): UploadFileEntity {
    return new UploadFileEntity(
      params.id,
      params.uri,
      params.size,
      params.mimeType,
      params.storageKey,
      params.createdAt,
      params.uploadedAt,
      params.deletedAt,
    )
  }

  get isUploaded(): boolean {
    return this.uploadedAt !== null
  }

  get isDeleted(): boolean {
    return this.deletedAt !== null
  }

  updateMetadata(metadata: { uri?: string; size?: number; mimeType?: string }): void {
    if (metadata.uri) {
      this.uri = metadata.uri
    }

    if (metadata.size !== undefined) {
      this.size = metadata.size
    }

    if (metadata.mimeType) {
      this.mimeType = metadata.mimeType
    }
  }

  markUploaded(date: Date = new Date()): void {
    if (this.isDeleted) {
      throw new Error('Cannot mark deleted file as uploaded')
    }

    this.uploadedAt = date
    this.events.push(new UploadFileUploadedEvent(this.id, date))
  }

  delete(date: Date = new Date()): void {
    if (this.isDeleted) {
      return
    }

    this.deletedAt = date
    this.events.push(new UploadFileDeletedEvent(this.id, date))
  }

  getUncommittedEvents(): DomainEvent[] {
    const events = this.events
    this.events = []
    return events
  }
}
