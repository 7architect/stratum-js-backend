import { UploadDomainException } from './upload-domain.exception'

export class FileNotFoundException extends UploadDomainException {
  readonly code = 'FILE_NOT_FOUND'

  constructor(storageKey: string, cause?: Error) {
    super(`File with storage key '${storageKey}' not found`, cause)
  }
}
