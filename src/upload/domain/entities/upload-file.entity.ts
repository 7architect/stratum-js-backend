type CreateParams = {
  id: string
  size: number
  mimeType: string
  storageKey: string
  originalName: string
  originalExtension: string
  assetType?: string | null
  customMetadata?: Record<string, any>
  lastModified?: Date | null
}

type FromPersistenceParams = {
  id: string
  size: number
  mimeType: string
  storageKey: string
  originalName: string
  originalExtension: string
  assetType: string | null
  customMetadata: Record<string, any>
  createdAt: Date
  deletedAt: Date | null
  lastModified: Date | null
}

export class UploadFileEntity {
  private constructor(
    // Identity (immutable)
    private readonly fileId: string,
    private readonly fileStorageKey: string,
    // Metadata (mutable)
    private fileSize: number,
    private fileMimeType: string,
    private readonly fileOriginalName: string,
    private readonly fileOriginalExtension: string,
    private fileAssetType: string | null,
    private fileCustomMetadata: Record<string, any>,
    // Timestamps
    private readonly fileCreatedAt: Date,
    private fileDeletedAt: Date | null,
    private fileLastModified: Date | null,
  ) {}

  static create(params: CreateParams): UploadFileEntity {
    const now = new Date()
    const lastModified = params.lastModified ?? now
    return new UploadFileEntity(
      params.id,                          // fileId
      params.storageKey,                  // fileStorageKey
      params.size,                        // fileSize
      params.mimeType,                    // fileMimeType
      params.originalName,                // fileOriginalName
      params.originalExtension,           // fileOriginalExtension
      params.assetType ?? null,           // fileAssetType
      params.customMetadata ?? {},        // fileCustomMetadata
      now,                                // fileCreatedAt
      null,                               // fileDeletedAt
      lastModified,                       // fileLastModified
    )
  }

  static fromPersistence(params: FromPersistenceParams): UploadFileEntity {
    return new UploadFileEntity(
      params.id,                // fileId
      params.storageKey,        // fileStorageKey
      params.size,              // fileSize
      params.mimeType,          // fileMimeType
      params.originalName,      // fileOriginalName
      params.originalExtension, // fileOriginalExtension
      params.assetType,         // fileAssetType
      params.customMetadata,    // fileCustomMetadata
      params.createdAt,         // fileCreatedAt
      params.deletedAt,         // fileDeletedAt
      params.lastModified,      // fileLastModified
    )
  }

  // ========================================
  // Business Getters (Identity)
  // ========================================

  get id(): string {
    return this.fileId
  }

  get storageKey(): string {
    return this.fileStorageKey
  }

  // ========================================
  // Business Getters (Metadata)
  // ========================================

  get size(): number {
    return this.fileSize
  }

  get mimeType(): string {
    return this.fileMimeType
  }

  get originalName(): string {
    return this.fileOriginalName
  }

  get originalExtension(): string {
    return this.fileOriginalExtension
  }

  get assetType(): string | null {
    return this.fileAssetType
  }

  get customMetadata(): Record<string, any> {
    return { ...this.fileCustomMetadata }
  }

  // ========================================
  // Business Getters (Timestamps)
  // ========================================

  get createdAt(): Date {
    return this.fileCreatedAt
  }

  get deletedAt(): Date | null {
    return this.fileDeletedAt
  }

  get lastModified(): Date | null {
    return this.fileLastModified
  }

  // ========================================
  // Business Logic (State Checks)
  // ========================================

  get isDeleted(): boolean {
    return this.fileDeletedAt !== null
  }

  // ========================================
  // Business Operations
  // ========================================

  updateMetadata(metadata: { size?: number; mimeType?: string }): void {
    if (metadata.size !== undefined) {
      this.fileSize = metadata.size
    }

    if (metadata.mimeType) {
      this.fileMimeType = metadata.mimeType
    }
  }

  updateCustomMetadata(metadata: Partial<Record<string, any>>): void {
    this.fileCustomMetadata = { ...this.fileCustomMetadata, ...metadata }
  }

  setCustomMetadata(metadata: Record<string, any>): void {
    this.fileCustomMetadata = metadata
  }

  setAssetType(assetType: string | null): void {
    this.fileAssetType = assetType
  }

  delete(date: Date = new Date()): void {
    if (this.isDeleted) {
      return
    }

    this.fileDeletedAt = date
  }
}
