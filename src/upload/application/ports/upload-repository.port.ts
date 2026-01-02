import { UploadFileEntity } from '@domain/entities/upload-file.entity'
import { Mongoose } from 'mongoose'

export abstract class UploadRepoPort {
  constructor(
    protected mongoClient: Mongoose
  ) {}

  abstract save(upload: UploadFileEntity): Promise<UploadFileEntity>
  abstract delete(id: string): Promise<UploadFileEntity>
  abstract findById(id: string): Promise<UploadFileEntity | null>
  abstract findByStorageKey(storageKey: string): Promise<UploadFileEntity | null>
  abstract findByPrefix(prefix: string): Promise<UploadFileEntity[]>
  abstract findAll(page: number, perPage: number): Promise<{ uploads: UploadFileEntity[], total: number }>
}
