import { UploadDomainException } from './upload-domain.exception'

export class UnsupportedFileTypeException extends UploadDomainException {
  readonly code = 'UNSUPPORTED_FILE_TYPE'

  constructor(mimeType: string, allowedTypes?: string[], cause?: Error) {
    const message = allowedTypes?.length
      ? `File type '${mimeType}' is not supported. Allowed types: ${allowedTypes.join(', ')}`
      : `File type '${mimeType}' is not supported`
    super(message, cause)
  }
}
