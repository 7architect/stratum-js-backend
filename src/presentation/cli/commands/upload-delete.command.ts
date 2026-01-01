import { Command } from 'commander'
import { UploadServiceFacade } from '@infra/facade/upload-service.facade'
import { UploadFileEntity } from '@upload/domain/entities/upload-file.entity'
import { printUploadResult } from '../renderers/upload-renderer'

type DeleteUploadOptions = {
  id: string
  uri: string
  size: string
  mimeType: string
  storageKey: string
  createdAt: string
  uploadedAt?: string
}

export function deleteUploadCommand(): Command {
  return new Command('delete')
    .description('Delete uploaded file')
    .requiredOption('--id <id>', 'File ID')
    .requiredOption('--uri <uri>', 'File URI')
    .requiredOption('--size <size>', 'File size in bytes')
    .requiredOption('--mime-type <mimeType>', 'File MIME type')
    .requiredOption('--storage-key <storageKey>', 'Storage key')
    .requiredOption('--created-at <createdAt>', 'Created at (ISO 8601)')
    .option('--uploaded-at <uploadedAt>', 'Uploaded at (ISO 8601)')
    .action(async (options: DeleteUploadOptions) => {
      const file = UploadFileEntity.fromPersistence({
        id: options.id,
        uri: options.uri,
        size: Number.parseInt(options.size, 10),
        mimeType: options.mimeType,
        storageKey: options.storageKey,
        createdAt: new Date(options.createdAt),
        uploadedAt: options.uploadedAt ? new Date(options.uploadedAt) : null,
        deletedAt: null,
      })

      const deletedFile = await UploadServiceFacade.getInstance().deleteFile(file)
      printUploadResult('File deleted', deletedFile)
    })
}
