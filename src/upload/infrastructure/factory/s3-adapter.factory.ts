import mongoose from 'mongoose'
import { S3UploadAdapter, type S3UploadAdapterConfig } from '@infrastructure/adapters/s3-upload.adapter'
import { type UploadAdapterPort } from '@application/ports/upload-adapter.port'

export class S3AdapterFactory {
  static create(config: S3UploadAdapterConfig): UploadAdapterPort {
    return new S3UploadAdapter(config)
  }
}
