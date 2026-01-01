import { randomUUID } from 'crypto'
import { S3Client, type S3ClientConfig, DeleteObjectCommand, PutObjectCommand, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Upload } from '@aws-sdk/lib-storage'

import { type UploadAdapterPort, type UploadResult } from '../../application/ports/upload-adapter.port'

export type S3UploadAdapterConfig = {
  bucket: string
  region: string
  basePath?: string
  forcePathStyle?: boolean
  publicBaseUrl?: string
} & Pick<S3ClientConfig, 'credentials' | 'endpoint'>

export class S3UploadAdapter implements UploadAdapterPort {
  private readonly client: S3Client
  private bucketEnsured: boolean = false

  constructor(private readonly config: S3UploadAdapterConfig) {
    console.log('[S3UploadAdapter] Config:', {
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle,
      bucket: config.bucket,
    })

    this.client = new S3Client({
      region: config.region,
      credentials: config.credentials,
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle,
    })
  }

  private async ensureBucketExists(): Promise<void> {
    if (this.bucketEnsured) {
      return
    }

    try {
      // Check if bucket exists
      await this.client.send(new HeadBucketCommand({ Bucket: this.config.bucket }))
      console.log(`[S3UploadAdapter] Bucket '${this.config.bucket}' already exists`)
      this.bucketEnsured = true
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        // Bucket doesn't exist, create it
        console.log(`[S3UploadAdapter] Creating bucket '${this.config.bucket}'...`)
        try {
          await this.client.send(new CreateBucketCommand({ Bucket: this.config.bucket }))
          console.log(`[S3UploadAdapter] Bucket '${this.config.bucket}' created successfully`)
          this.bucketEnsured = true
        } catch (createError: any) {
          console.error(`[S3UploadAdapter] Failed to create bucket:`, createError)
          throw createError
        }
      } else {
        // Some other error occurred
        console.error('[S3UploadAdapter] Error checking bucket existence:', error)
        throw error
      }
    }
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    })

    await this.client.send(command)
  }

  async generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    await this.ensureBucketExists()

    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    })

    return await getSignedUrl(this.client, command, { expiresIn })
  }

  async uploadFile(file: File): Promise<UploadResult> {
    await this.ensureBucketExists()

    const mimeType = file.type || 'application/octet-stream'
    const key = this.buildObjectKey(file.name || randomUUID())
    const buffer = Buffer.from(await file.arrayBuffer())

    return await this.uploadBuffer({
      key,
      mimeType,
      buffer,
    })
  }

  async uploadFileFromUrl(url: string): Promise<UploadResult> {
    await this.ensureBucketExists()

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch file from URL: ${url}`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    const fileName = this.inferFileName(url)
    const mimeType = response.headers.get('content-type') || 'application/octet-stream'
    const key = this.buildObjectKey(fileName)

    return await this.uploadBuffer({
      key,
      mimeType,
      buffer,
    })
  }

  private async uploadBuffer(params: {
    key: string
    mimeType: string
    buffer: Buffer
  }): Promise<UploadResult> {
    await this.uploadToS3({
      Key: params.key,
      Body: params.buffer,
      ContentType: params.mimeType,
    })

    return {
      key: params.key,
      uri: this.buildPublicUrl(params.key),
      size: params.buffer.byteLength,
      mimeType: params.mimeType,
    }
  }

  private async uploadToS3(params: {
    Key: string
    Body: Buffer
    ContentType: string
  }): Promise<void> {
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.config.bucket,
        Key: params.Key,
        Body: params.Body,
        ContentType: params.ContentType,
        ACL: 'public-read',
      },
    })

    await upload.done()
  }

  private buildObjectKey(originalName: string): string {
    const cleanName = originalName.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    const key = `${randomUUID()}-${cleanName}`
    return this.config.basePath ? `${this.trimSlashes(this.config.basePath)}/${key}` : key
  }

  private buildPublicUrl(key: string): string {
    if (this.config.publicBaseUrl) {
      const base = this.config.publicBaseUrl.replace(/\/$/, '')
      return `${base}/${key}`
    }

    if (this.config.endpoint) {
      const endpoint = this.config.endpoint.toString().replace(/\/$/, '')
      return `${endpoint}/${this.config.bucket}/${key}`
    }

    return `${key}`
  }

  private inferFileName(url: string): string {
    try {
      const { pathname } = new URL(url)
      const fileName = pathname.split('/').filter(Boolean).pop()
      return fileName ?? `${randomUUID()}`
    } catch {
      return randomUUID()
    }
  }

  private trimSlashes(value: string): string {
    return value.replace(/^\/+/, '').replace(/\/+$/, '')
  }
}
