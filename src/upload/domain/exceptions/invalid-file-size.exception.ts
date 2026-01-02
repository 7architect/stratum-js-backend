import { UploadDomainException } from './upload-domain.exception'

export class InvalidFileSizeException extends UploadDomainException {
  readonly code = 'INVALID_FILE_SIZE'

  constructor(size: number, maxSize?: number, cause?: Error) {
    const message = maxSize
      ? `File size ${size} bytes exceeds maximum allowed size of ${maxSize} bytes`
      : `Invalid file size: ${size} bytes`
    super(message, cause)
  }
}
