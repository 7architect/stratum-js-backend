import { Command } from 'commander'
import { UploadIntentServiceFacade } from '@infra/facade/upload-intent-service.facade'
import { printMessageTable } from '../utils/table'
import { printIntentsTable } from '../renderers/intent-renderer'
import { printUploadsTable } from '../renderers/upload-renderer'

type UploadWithIntentOptions = {
  intentId: string
  url: string
}

export function uploadWithIntentFromUrlCommand(): Command {
  return new Command('upload-with-intent')
    .description('Upload file from URL using upload intent')
    .requiredOption('--intent-id <id>', 'Upload intent ID')
    .requiredOption('--url <url>', 'File URL to upload')
    .action(async (options: UploadWithIntentOptions) => {
      const { intentId, url } = options
      const result = await UploadIntentServiceFacade.getInstance().uploadFileFromUrlWithIntent(intentId, url)

      printMessageTable('File uploaded with intent')
      printIntentsTable([result.intent])
      printMessageTable('Uploaded file')
      printUploadsTable([result.file])
    })
}
