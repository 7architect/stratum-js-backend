import { UploadDomainException } from './upload-domain.exception'

export class FileMetadataNotFoundException extends UploadDomainException {
  readonly code = 'FILE_METADATA_NOT_FOUND'

  constructor(message: string = 'File metadata not found', cause?: Error) {
    super(message, cause)
  }
}
