export class StorageConnectionException extends Error {
  readonly code = 'STORAGE_CONNECTION_ERROR'

  constructor(message: string = 'Storage connection failed', cause?: Error) {
    super(message)
    this.name = this.constructor.name
    this.cause = cause
  }
}
