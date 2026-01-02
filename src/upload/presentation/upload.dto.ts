export class UploadDto {
  constructor(
    readonly id: string,
    readonly storageKey: string,
    readonly size: number,
    readonly mimeType: string,
    readonly originalName: string,
    readonly originalExtension: string,
    readonly assetType: string | null,
    readonly customMetadata: Record<string, any>,
    readonly deletedAt: Date | null,
    readonly createdAt: Date,
    readonly lastModified?: Date,
    readonly publicUrl?: string,
    readonly downloadUrl?: string,
  ) {}

  get isDeleted(): boolean {
    return this.deletedAt !== null
  }

  get fileExtension(): string {
    return this.originalExtension
  }

  get fileName(): string {
    return this.originalName
  }

  get sizeInMB(): number {
    return Math.round((this.size / (1024 * 1024)) * 100) / 100
  }

  get sizeInKB(): number {
    return Math.round((this.size / 1024) * 100) / 100
  }
}
