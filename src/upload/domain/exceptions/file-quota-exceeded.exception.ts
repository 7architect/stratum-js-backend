import { UploadDomainException } from './upload-domain.exception'

export class FileQuotaExceededException extends UploadDomainException {
  readonly code = 'FILE_QUOTA_EXCEEDED'

  constructor(currentSize: number, maxQuota: number, cause?: Error) {
    super(`File quota exceeded: ${currentSize} bytes exceeds limit of ${maxQuota} bytes`, cause)
  }
}
