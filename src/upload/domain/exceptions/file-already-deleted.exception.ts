import { UploadDomainException } from './upload-domain.exception'

export class FileAlreadyDeletedException extends UploadDomainException {
  readonly code = 'FILE_ALREADY_DELETED'

  constructor(fileId: string, cause?: Error) {
    super(`File with ID '${fileId}' is already deleted`, cause)
  }
}
