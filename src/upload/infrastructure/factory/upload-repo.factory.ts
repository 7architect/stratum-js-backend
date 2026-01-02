import mongoose from 'mongoose'
import { type UploadRepoPort } from '@application/ports/upload-repository.port'
import { UploadRepoMongoAdapter } from '@infrastructure/adapters/upload-repo-mongo.adapter'

export class UploadRepoFactory {
  static create(db: mongoose.Mongoose): UploadRepoPort {
    return new UploadRepoMongoAdapter(db)
  }
}
