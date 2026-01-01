import { BaseDomainEvent } from './domain-event.interface'

export class UploadFileUploadedEvent extends BaseDomainEvent {
  constructor(
    public readonly fileId: string,
    public readonly uploadedAt: Date,
  ) {
    super('upload:file-uploaded')
  }
}
