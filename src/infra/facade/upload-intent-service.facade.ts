import { type UploadIntentServicePort } from '@upload/application/ports/upload-intent.service'
import { UploadIntentServiceFactory } from '@upload/infrastructure/factory/upload-intent-service.factory'
import { UploadServiceFacade } from './upload-service.facade'
import { UploadServiceFactory } from '@upload/infrastructure/factory/upload-service.factory'
import { EventBusFacade } from './event-bus.facade'
import { settings } from '@config/settings'

export class UploadIntentServiceFacade {
  private static instance: UploadIntentServicePort | null = null

  static getInstance(): UploadIntentServicePort {
    if (!UploadIntentServiceFacade.instance) {
      const uploadService = UploadServiceFacade.getInstance()
      const adapter = UploadServiceFactory.createAdapter({
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
      })

      UploadIntentServiceFacade.instance = UploadIntentServiceFactory.createWithUploadService(
        uploadService,
        adapter
      )
    }

    return UploadIntentServiceFacade.instance!
  }
}
