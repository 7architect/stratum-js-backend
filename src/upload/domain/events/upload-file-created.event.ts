import { BaseDomainEvent } from './domain-event.interface'

export class UploadFileCreatedEvent extends BaseDomainEvent {
  constructor(
    public readonly fileId: string,
    public readonly uri: string,
    public readonly size: number,
    public readonly mimeType: string,
    public readonly storageKey: string,
  ) {
    super('upload:file-created')
  }
}
