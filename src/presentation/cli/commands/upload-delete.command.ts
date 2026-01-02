import { Command } from 'commander'
import { UploadServiceFacade } from '@/infrastructure/facade/upload-service.facade'
import { printUploadResult } from '../renderers/upload-renderer'

export function deleteUploadCommand(): Command {
  return new Command('delete')
    .description('Delete uploaded file by storage key')
    .requiredOption('--key <key>', 'Storage key')
    .action(async (options: { key: string }) => {
      try {
        const deletedFile = await UploadServiceFacade.getInstance().deleteFileByKey(options.key)
        if (deletedFile) {
          printUploadResult('File deleted', deletedFile)
        } else {
          console.log(`File with key '${options.key}' not found`)
        }
      } catch (error) {
        console.error('Failed to delete file:', error instanceof Error ? error.message : error)
        process.exit(1)
      }
    })
}
