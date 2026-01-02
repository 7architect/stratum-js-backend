import { PresignedUrl } from '@domain/value-objects/presigned-url.value-object'

export interface UploadResult {
  id: string
  size: number
  mimeType: string
  key: string
  originalName: string
  originalExtension: string
  assetType?: string | null
  customMetadata?: Record<string, any>
  lastModified: Date
}

export interface UploadAdapterPort {
  uploadFile(file: File, assetType?: string | null, customMetadata?: Record<string, any>): Promise<UploadResult>
  uploadFileFromUrl(url: string, assetType?: string | null, customMetadata?: Record<string, any>): Promise<UploadResult>
  deleteFile(key: string): Promise<void>
  generatePresignedUrl(key: string, fileId: string, expiresIn?: number): Promise<PresignedUrl>
  generateDownloadUrl(key: string, expiresIn?: number): Promise<PresignedUrl>
  getPublicUrl(key: string): string
  getFileMetadata(key: string): Promise<UploadResult | null>
  listFiles(prefix?: string): Promise<UploadResult[]>
  renameFile(oldKey: string, newKey: string): Promise<void>
  updateFileMetadata(key: string, metadata: Record<string, any>): Promise<void>
}
