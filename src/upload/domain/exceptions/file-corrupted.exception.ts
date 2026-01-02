import { UploadDomainException } from './upload-domain.exception'

export class FileCorruptedException extends UploadDomainException {
  readonly code = 'FILE_CORRUPTED'

  constructor(message: string = 'File is corrupted or inconsistent', cause?: Error) {
    super(message, cause)
  }
}
