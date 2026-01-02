export class UploadFailedException extends Error {
  readonly code = 'UPLOAD_FAILED'

  constructor(message: string = 'File upload failed', cause?: Error) {
    super(message)
    this.name = this.constructor.name
    this.cause = cause
  }
}
