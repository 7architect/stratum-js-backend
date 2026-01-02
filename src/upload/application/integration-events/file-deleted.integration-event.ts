import { BaseDomainEvent } from '@domain/events/domain-event.interface'
import type { UploadDto } from '@presentation/upload.dto'

export class FileDeletedIntegrationEvent extends BaseDomainEvent {
  constructor(
    readonly payload: UploadDto
  ) {
    super('upload:file-deleted')
  }
}
