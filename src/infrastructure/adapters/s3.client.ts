import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3'

export type InfraS3ClientConfig = {
  region: string
  accessKeyId: string
  secretAccessKey: string
  endpoint?: string
  forcePathStyle?: boolean
}

class S3ClientProvider {
  private static instance: S3ClientProvider
  private client: S3Client | null = null
  private config: InfraS3ClientConfig | null = null

  private constructor() {}

  static getInstance(): S3ClientProvider {
    if (!S3ClientProvider.instance) {
      S3ClientProvider.instance = new S3ClientProvider()
    }
    return S3ClientProvider.instance
  }

  initialize(config: InfraS3ClientConfig): S3Client {
    if (!this.client) {
      const clientConfig: S3ClientConfig = {
        region: config.region,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
        forcePathStyle: config.forcePathStyle,
      }

      if (config.endpoint) {
        clientConfig.endpoint = config.endpoint
      }

      this.client = new S3Client(clientConfig)
      this.config = config
    }

    return this.client
  }

  getClient(): S3Client {
    if (!this.client) {
      throw new Error('S3 client not initialized. Call initialize() first.')
    }

    return this.client
  }

  getConfig(): InfraS3ClientConfig {
    if (!this.config) {
      throw new Error('S3 client not initialized. No config available.')
    }

    return this.config
  }
}

export const s3ClientProvider = S3ClientProvider.getInstance()
