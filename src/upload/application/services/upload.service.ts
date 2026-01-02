import { UploadServicePort } from '@application/ports/upload-service.port'
import { UploadFileEntity } from '@domain/entities/upload-file.entity'
import { type UploadAdapterPort, type UploadResult } from '@application/ports/upload-adapter.port'
import { type EventBusPort } from '@application/ports/event-bus.port'
import { type UploadRepoPort } from '@application/ports/upload-repository.port'
import { UploadDto } from '../../presentation/upload.dto'
import { PresignedUrl } from '@domain/value-objects/presigned-url.value-object'
import {
  FileMetadataNotFoundException,
  FileNotFoundException
} from '@domain/exceptions'
import {
  FileUploadedIntegrationEvent,
  FileDeletedIntegrationEvent,
  FileMetadataUpdatedIntegrationEvent
} from '@application/integration-events'

type ResolvedFileData = {
  id: string
  storageKey: string
  size: number
  mimeType: string
  originalName: string
  originalExtension: string
  assetType: string | null
  customMetadata: Record<string, string>
  createdAt: Date
  deletedAt: Date | null
  lastModified: Date | null
}

export class UploadService extends UploadServicePort {
  constructor(
    eventBus: EventBusPort,
    uploadAdapter: UploadAdapterPort,
    uploadRepo: UploadRepoPort,
  ) {
    super(eventBus, uploadAdapter, uploadRepo)
  }

  async uploadFile(file: File): Promise<UploadDto> {
    const uploadResult = await this.uploadAdapter.uploadFile(file)
    const entity = await this.persistUploadedFile(uploadResult)
    return this.mapToDto(entity)
  }

  async uploadFileFromUrl(url: string): Promise<UploadDto> {
    const uploadResult = await this.uploadAdapter.uploadFileFromUrl(url)
    const entity = await this.persistUploadedFile(uploadResult)
    return this.mapToDto(entity)
  }

  async deleteFile(file: UploadFileEntity): Promise<UploadDto> {
    const result = await this.deleteFileFromBothSources(file.storageKey)
    if (!result) {
      throw new FileNotFoundException(file.storageKey)
    }
    return result
  }

  async deleteFileByKey(storageKey: string): Promise<UploadDto | null> {
    return await this.deleteFileFromBothSources(storageKey)
  }

  async getFile(storageKey: string): Promise<UploadDto | null> {
    return await this.getFileFromBothSources(storageKey)
  }

  async getFileWithUrls(storageKey: string): Promise<UploadDto | null> {
    return await this.getFileFromBothSources(storageKey, true)
  }

  async listFiles(prefix: string): Promise<UploadDto[]> {
    try {
      const [fromDb, storageFiles] = await Promise.all([
        this.uploadRepo.findByPrefix(prefix),
        this.uploadAdapter.listFiles(prefix)
      ])

      const results: UploadDto[] = []
      const storageByKey = new Map(storageFiles.map(file => [file.key, file]))

      if (fromDb) {
        for (const entity of fromDb) {
          const storageFile = storageByKey.get(entity.storageKey) ?? null
          const resolved = this.resolveSources(entity.storageKey, entity, storageFile, 'listFiles')
          if (resolved) {
            results.push(this.mapResolvedToDto(resolved.data))
          }
          if (storageFile) {
            storageByKey.delete(entity.storageKey)
          }
        }
      }

      for (const [key, storageFile] of storageByKey) {
        const resolved = this.resolveSources(key, null, storageFile, 'listFiles')
        if (resolved) {
          results.push(this.mapResolvedToDto(resolved.data))
        }
      }

      return results
    } catch (error) {
      throw new FileMetadataNotFoundException(`Failed to list files with prefix: ${prefix}`, error as Error)
    }
  }

  async getFileMetadata(storageKey: string): Promise<UploadDto | null> {
    const file = await this.getFile(storageKey)
    return file
  }

  async trackUpload(uploadFile: UploadFileEntity): Promise<UploadDto> {
    await this.uploadRepo.save(uploadFile)

    // Create and publish Integration Event
    const uploadDto = this.mapToDto(uploadFile)
    const event = new FileUploadedIntegrationEvent(uploadDto)
    await this.eventBus.publish(event)

    return uploadDto
  }

  async renameFile(oldKey: string, newKey: string): Promise<void> {
    await this.uploadAdapter.renameFile(oldKey, newKey)
  }

  async updateFileMetadata(storageKey: string, metadata: Record<string, string>): Promise<void> {
    await this.uploadAdapter.updateFileMetadata(storageKey, metadata)
  }

  async generateDownloadUrl(storageKey: string, expiresIn?: number): Promise<PresignedUrl> {
    // Verify file exists in both sources
    const resolved = this.resolveSources(storageKey,
      await this.uploadRepo.findByStorageKey(storageKey),
      await this.uploadAdapter.getFileMetadata(storageKey),
      'generateDownloadUrl'
    )

    if (!resolved) {
      throw new FileNotFoundException(storageKey)
    }

    return await this.uploadAdapter.generateDownloadUrl(storageKey, expiresIn)
  }

  async getPublicUrl(storageKey: string): Promise<string> {
    // Verify file exists in both sources
    const resolved = this.resolveSources(storageKey,
      await this.uploadRepo.findByStorageKey(storageKey),
      await this.uploadAdapter.getFileMetadata(storageKey),
      'getPublicUrl'
    )

    if (!resolved) {
      throw new FileNotFoundException(storageKey)
    }

    return this.uploadAdapter.getPublicUrl(storageKey)
  }

  private async persistUploadedFile(upload: UploadResult): Promise<UploadFileEntity> {
    const file = UploadFileEntity.create({
      id: upload.id, // Use ID from adapter (from S3 metadata)
      size: upload.size,
      mimeType: upload.mimeType,
      storageKey: upload.key,
      originalName: upload.originalName,
      originalExtension: upload.originalExtension,
      lastModified: upload.lastModified,
    })

    // Save to repository first
    await this.uploadRepo.save(file)

    // Create and publish Integration Event
    const uploadDto = this.mapToDto(file)
    const event = new FileUploadedIntegrationEvent(uploadDto)
    await this.eventBus.publish(event)

    return file
  }

  private mapToDto(entity: UploadFileEntity, includeUrls: boolean = false): UploadDto {
    const publicUrl = includeUrls ? this.uploadAdapter.getPublicUrl(entity.storageKey) : undefined

    return new UploadDto(
      entity.id,
      entity.storageKey,
      entity.size,
      entity.mimeType,
      entity.originalName,
      entity.originalExtension,
      entity.assetType,
      entity.customMetadata,
      entity.deletedAt,
      entity.createdAt,
      entity.lastModified ?? undefined,
      publicUrl,
      undefined, // downloadUrl - generated on demand
    )
  }

  private mapResolvedToDto(data: ResolvedFileData, includeUrls: boolean = false): UploadDto {
    const publicUrl = includeUrls ? this.uploadAdapter.getPublicUrl(data.storageKey) : undefined

    return new UploadDto(
      data.id,
      data.storageKey,
      data.size,
      data.mimeType,
      data.originalName,
      data.originalExtension,
      data.assetType,
      data.customMetadata,
      data.deletedAt,
      data.createdAt,
      data.lastModified ?? undefined,
      publicUrl,
      undefined, // downloadUrl - generated on demand
    )
  }

  /**
   * Universal method to get file from both sources (repository + storage)
   * Ensures data consistency and merges information from both sources
   */
  private async getFileFromBothSources(storageKey: string, includeUrls: boolean = false): Promise<UploadDto | null> {
    const [fromDb, metadata] = await Promise.all([
      this.uploadRepo.findByStorageKey(storageKey),
      this.uploadAdapter.getFileMetadata(storageKey)
    ])

    const resolved = this.resolveSources(storageKey, fromDb, metadata, 'getFile')

    if (!resolved) {
      throw new FileNotFoundException(storageKey)
    }

    return this.mapResolvedToDto(resolved.data, includeUrls)
  }

  /**
   * Universal method to delete file from both sources (repository + storage)
   * Ensures complete cleanup from both database and storage
   */
  private async deleteFileFromBothSources(storageKey: string): Promise<UploadDto | null> {
    // First, get file from both sources to ensure it exists
    const [fromDb, metadata] = await Promise.all([
      this.uploadRepo.findByStorageKey(storageKey),
      this.uploadAdapter.getFileMetadata(storageKey)
    ])

    const resolved = this.resolveSources(storageKey, fromDb, metadata, 'deleteFile')

    if (!resolved) {
      throw new FileNotFoundException(storageKey)
    }

    const { data, fromDb: hasDb, fromStorage: hasStorage } = resolved
    const entityForPersistence = resolved.dbFile ?? UploadFileEntity.fromPersistence({
      id: data.id,
      size: data.size,
      mimeType: data.mimeType,
      storageKey: data.storageKey,
      originalName: data.originalName,
      originalExtension: data.originalExtension,
      assetType: data.assetType,
      customMetadata: data.customMetadata,
      createdAt: data.createdAt,
      deletedAt: data.deletedAt,
      lastModified: data.lastModified,
    })

    const deletePromises: Promise<any>[] = []

    if (hasStorage && resolved.storageFile) {
      deletePromises.push(this.uploadAdapter.deleteFile(storageKey))
    }

    // Mark as deleted and save to repository if exists in DB
    if (hasDb && resolved.dbFile && !resolved.dbFile.isDeleted) {
      resolved.dbFile.delete()
      deletePromises.push(this.uploadRepo.save(resolved.dbFile))
    } else if (!hasDb) {
      entityForPersistence.delete()
    }

    // Execute all deletions in parallel
    await Promise.all(deletePromises)

    // Create and publish Integration Event for deletion
    const deletedDto = this.mapResolvedToDto({
      ...data,
      deletedAt: entityForPersistence.deletedAt,
    })
    const event = new FileDeletedIntegrationEvent(deletedDto)
    await this.eventBus.publish(event)

    return deletedDto
  }

  /**
   * Resolve data between database and storage with DB-first merge strategy
   */
  private resolveSources(
    storageKey: string,
    dbFile: UploadFileEntity | null,
    storageFile: UploadResult | null,
    context: string,
  ): {
    data: ResolvedFileData
    fromDb: boolean
    fromStorage: boolean
    dbFile: UploadFileEntity | null
    storageFile: UploadResult | null
  } | null {
    if (!dbFile && !storageFile) {
      return null
    }

    if (dbFile && storageFile) {
      this.warnOnMismatch(storageKey, dbFile, storageFile, context)
      return {
        data: {
          id: dbFile.id,
          storageKey: dbFile.storageKey,
          size: dbFile.size,
          mimeType: dbFile.mimeType,
          originalName: dbFile.originalName,
          originalExtension: dbFile.originalExtension,
          assetType: dbFile.assetType,
          customMetadata: dbFile.customMetadata,
          createdAt: dbFile.createdAt,
          deletedAt: dbFile.deletedAt,
          lastModified: storageFile.lastModified ?? dbFile.lastModified ?? null,
        },
        fromDb: true,
        fromStorage: true,
        dbFile,
        storageFile,
      }
    }

    if (dbFile && !storageFile) {
      console.warn(`[UploadService:${context}] File '${storageKey}' missing in storage, using database record`)
      return {
        data: {
          id: dbFile.id,
          storageKey: dbFile.storageKey,
          size: dbFile.size,
          mimeType: dbFile.mimeType,
          originalName: dbFile.originalName,
          originalExtension: dbFile.originalExtension,
          assetType: dbFile.assetType,
          customMetadata: dbFile.customMetadata,
          createdAt: dbFile.createdAt,
          deletedAt: dbFile.deletedAt,
          lastModified: dbFile.lastModified ?? null,
        },
        fromDb: true,
        fromStorage: false,
        dbFile,
        storageFile: null,
      }
    }

    if (!dbFile && storageFile) {
      console.warn(`[UploadService:${context}] File '${storageKey}' missing in database, using storage metadata`)
      const fallbackLastModified = storageFile.lastModified ?? new Date()
      return {
        data: {
          id: storageFile.id,
          storageKey: storageFile.key,
          size: storageFile.size,
          mimeType: storageFile.mimeType,
          originalName: storageFile.originalName,
          originalExtension: storageFile.originalExtension,
          assetType: storageFile.assetType ?? null,
          customMetadata: storageFile.customMetadata ?? {},
          createdAt: fallbackLastModified,
          deletedAt: null,
          lastModified: storageFile.lastModified ?? fallbackLastModified,
        },
        fromDb: false,
        fromStorage: true,
        dbFile: null,
        storageFile,
      }
    }

    return null
  }

  /**
   * Logs warnings if there is mismatch between database and storage representations
   */
  private warnOnMismatch(
    storageKey: string,
    entity: UploadFileEntity,
    metadata: UploadResult,
    context: string,
  ): void {
    if (entity.id !== metadata.id) {
      console.warn(`[UploadService:${context}] File ID mismatch for ${storageKey}: DB=${entity.id}, Storage=${metadata.id}`)
    }

    if (entity.size !== metadata.size) {
      console.warn(`[UploadService:${context}] File size mismatch for ${storageKey}: DB=${entity.size}, Storage=${metadata.size}`)
    }

    if (entity.mimeType !== metadata.mimeType) {
      console.warn(`[UploadService:${context}] File MIME mismatch for ${storageKey}: DB=${entity.mimeType}, Storage=${metadata.mimeType}`)
    }
  }
}
