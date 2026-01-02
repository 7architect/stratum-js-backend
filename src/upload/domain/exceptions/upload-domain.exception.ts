export abstract class UploadDomainException extends Error {
  abstract readonly code: string

  constructor(message: string, cause?: Error) {
    super(message)
    this.name = this.constructor.name
    this.cause = cause
  }
}
