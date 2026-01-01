import { Command } from 'commander'
import { UploadServiceFacade } from '@infra/facade/upload-service.facade'
import { printUploadResult } from '../renderers/upload-renderer'

type UploadFromUrlOptions = {
  url: string
}

export function uploadFromUrlCommand(): Command {
  return new Command('upload-url')
    .description('Upload file from URL')
    .requiredOption('--url <url>', 'File URL to upload')
    .action(async (options: UploadFromUrlOptions) => {
      const { url } = options
      const file = await UploadServiceFacade.getInstance().uploadFileFromUrl(url)
      printUploadResult('File uploaded from URL', file)
    })
}
