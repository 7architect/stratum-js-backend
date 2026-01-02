import { type UploadIntentServicePort } from '@upload/application/ports/upload-intent.service'
import { UploadIntentServiceFactory } from '@upload/infrastructure/factory/upload-intent-service.factory'
import { S3AdapterFactory } from '@upload/infrastructure/factory/s3-adapter.factory'
import { EventBusFacade } from './event-bus.facade'
import { UploadServiceFacade } from './upload-service.facade'
import { settings } from '@config/settings'

export class UploadIntentServiceFacade {
  private static instance: UploadIntentServicePort | null = null

  static getInstance(): UploadIntentServicePort {
    if (!UploadIntentServiceFacade.instance) {
      const adapter = S3AdapterFactory.create({
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

      const uploadService = UploadServiceFacade.getInstance()

      UploadIntentServiceFacade.instance = UploadIntentServiceFactory.create(
        EventBusFacade.getInstanceSync(),
        adapter,
        uploadService
      )
    }

    return UploadIntentServiceFacade.instance!
  }
}
