import { BaseDomainEvent } from './domain-event.interface'

export class UploadFileDeletedEvent extends BaseDomainEvent {
  constructor(
    public readonly fileId: string,
    public readonly deletedAt: Date,
  ) {
    super('upload:file-deleted')
  }
}
