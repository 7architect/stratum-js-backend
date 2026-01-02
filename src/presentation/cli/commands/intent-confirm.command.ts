import { Command } from 'commander'
import { UploadIntentServiceFacade } from '@/infrastructure/facade/upload-intent-service.facade'
import { printIntentResult } from '../renderers/intent-renderer'

type ConfirmIntentOptions = {
  id: string
}

export function confirmIntentCommand(): Command {
  return new Command('confirm')
    .description('Confirm upload intent by ID (verifies file was uploaded to S3)')
    .requiredOption('--id <id>', 'Intent ID')
    .action(async (options: ConfirmIntentOptions) => {
      const { id } = options
      const intent = await UploadIntentServiceFacade.getInstance().confirmIntent(id)
      printIntentResult(`Intent confirmed: ${id}`, intent)
    })
}
