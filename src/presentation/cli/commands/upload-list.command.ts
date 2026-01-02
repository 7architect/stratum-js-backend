import { Command } from 'commander'
import { UploadServiceFacade } from '@/infrastructure/facade/upload-service.facade'
import { printUploadsTable } from '../renderers/upload-renderer'

export function listUploadsCommand(): Command {
  return new Command('list')
    .description('List all uploaded files')
    .action(async () => {
      try {
        const files = await UploadServiceFacade.getInstance().listFiles()
        printUploadsTable(files)
      } catch (error) {
        console.error('Failed to list files:', error instanceof Error ? error.message : error)
        process.exit(1)
      }
    })
}
