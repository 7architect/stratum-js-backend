import { Command } from 'commander'
import { UploadServiceFacade } from '@/infrastructure/facade/upload-service.facade'
import { printUploadResult } from '../renderers/upload-renderer'

type GetUploadOptions = {
  key: string
}

export function getUploadCommand(): Command {
  return new Command('get')
    .description('Get file information by storage key')
    .requiredOption('--key <key>', 'Storage key')
    .action(async (options: GetUploadOptions) => {
      try {
        const file = await UploadServiceFacade.getInstance().getFile(options.key)
        if (file) {
          printUploadResult('File information', file)
        } else {
          console.log(`File with key '${options.key}' not found`)
        }
      } catch (error) {
        console.error('Failed to get file:', error instanceof Error ? error.message : error)
        process.exit(1)
      }
    })
}
