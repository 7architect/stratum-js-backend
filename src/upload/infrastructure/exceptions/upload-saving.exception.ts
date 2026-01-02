import { UploadFileEntity } from "@domain/entities/upload-file.entity"

export class UploadSavingError extends Error {
  constructor(
    private readonly upload: UploadFileEntity
  ) {
    super(`Failed to save upload ${upload.id}`)
  }

  get id(): string {
    return this.upload.id
  }

  get storageKey(): string {
    return this.upload.storageKey
  }
}
