import { BaseDomainEvent } from '@domain/events/domain-event.interface'
import type { UploadDto } from '@presentation/upload.dto'

export class FileMetadataUpdatedIntegrationEvent extends BaseDomainEvent {
  constructor(
    readonly payload: UploadDto
  ) {
    super('upload:file-metadata-updated')
  }
}
