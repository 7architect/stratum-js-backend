import { type UploadServicePort } from '@upload/application/ports/upload-service.port'
import { UploadServiceFactory } from '@upload/infrastructure/factory/upload-service.factory'
import { EventBusFacade } from './event-bus.facade'
import { mongoConnection } from '@/infrastructure/adapters/mongo'
import { settings } from '@config/settings'

export class UploadServiceFacade {
  private static instance: UploadServicePort

  static getInstance(): UploadServicePort {
    if (!UploadServiceFacade.instance) {
      UploadServiceFacade.instance = UploadServiceFactory.create(
        EventBusFacade.getInstanceSync(),
        {
          bucket: settings.s3Bucket,
          region: settings.s3Region,
          credentials: {
            accessKeyId: settings.s3AccessKeyId,
            secretAccessKey: settings.s3SecretAccessKey,
          },
          endpoint: settings.s3Endpoint ?? undefined,
          forcePathStyle: settings.s3ForcePathStyle,
          publicBaseUrl: settings.s3PublicBaseUrl ?? undefined,
          basePath: settings.s3BasePath ?? undefined,
        },
        mongoConnection.getDb()
      )
    }

    return UploadServiceFacade.instance
  }
}
