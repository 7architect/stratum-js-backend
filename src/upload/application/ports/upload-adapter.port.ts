export interface UploadResult {
  uri: string
  size: number
  mimeType: string
  key: string
}

export interface UploadAdapterPort {
  uploadFile(file: File): Promise<UploadResult>
  uploadFileFromUrl(url: string): Promise<UploadResult>
  deleteFile(key: string): Promise<void>
  generatePresignedUrl(key: string, expiresIn?: number): Promise<string>
}
