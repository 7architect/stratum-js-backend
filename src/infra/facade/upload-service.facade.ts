import { type UploadServicePort } from '@upload/application/ports/upload-service.port'
import { UploadServiceFactory } from '@upload/infrastructure/factory/upload-service.factory'
import { EventBusFacade } from './event-bus.facade'
import { settings } from '@config/settings'

export class UploadServiceFacade {
  private static instance: UploadServicePort | null = null

  static getInstance(): UploadServicePort {
    if (!UploadServiceFacade.instance) {
      UploadServiceFacade.instance = UploadServiceFactory.create(
        EventBusFacade.getInstance(),
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
        }
      )
    }

    return UploadServiceFacade.instance!
  }
}
