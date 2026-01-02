import { UploadDomainException } from './upload-domain.exception'

export class FileAccessDeniedException extends UploadDomainException {
  readonly code = 'FILE_ACCESS_DENIED'

  constructor(fileId: string, operation: string, cause?: Error) {
    super(`Access denied for file '${fileId}' during operation: ${operation}`, cause)
  }
}
