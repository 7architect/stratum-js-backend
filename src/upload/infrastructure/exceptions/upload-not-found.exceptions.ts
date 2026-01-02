export class UploadNotFoundError extends Error {
  constructor(
    private readonly deletedId: string
  ) {
    super(`Upload with id ${deletedId} not found`)
  }

  get id(): string {
    return this.deletedId
  }
}
